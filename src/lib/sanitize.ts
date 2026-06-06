import { REFLECTION_MAX_LENGTH } from "@/lib/constants";

const htmlTagPattern = /<\/?[^>]+(>|$)/g;
const whitespacePattern = /\s+/g;
const specialCharacterPattern = /[&<>"'`]/g;

const escapeMap: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;"
};

export const sanitizeReflectionNote = (input: string): string => {
  const withoutHtml = input.replace(htmlTagPattern, " ");
  const normalized = withoutHtml.replace(whitespacePattern, " ").trim();
  const limited = normalized.slice(0, REFLECTION_MAX_LENGTH);

  return limited.replace(
    specialCharacterPattern,
    (character) => escapeMap[character] ?? ""
  );
};
