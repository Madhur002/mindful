export const EXAM_TYPES = [
  "NEET",
  "JEE",
  "CUET",
  "CAT",
  "GATE",
  "UPSC",
  "Board Exams"
] as const;

export const STRESS_TRIGGERS = [
  "Study load",
  "Sleep deprivation",
  "Peer pressure",
  "Parental expectations",
  "Fear of failure",
  "Mock test results",
  "Time pressure",
  "Loneliness"
] as const;

export const REFLECTION_MAX_LENGTH = 500;
export const MOOD_MIN = 1;
export const MOOD_MAX = 10;
export const STORAGE_VERSION = 1;
export const STORAGE_KEY = "mindful:mood-history:v1";
export const AI_TIMEOUT_MS = 15000;
export const WELLNESS_RATE_LIMIT = 10;
export const WELLNESS_RATE_WINDOW_MS = 60 * 60 * 1000;
export const WELLNESS_BODY_LIMIT_BYTES = 10 * 1024;

type ExamTypeValue = (typeof EXAM_TYPES)[number];
type StressTriggerValue = (typeof STRESS_TRIGGERS)[number];

export type WellnessResponseShape = {
  copingStrategy: string;
  motivation: string;
  mindfulnessExercise: string;
  studyTip: string;
};

export const MOOD_ANCHORS = [
  { score: 1, emoji: "😔", label: "Very low" },
  { score: 5, emoji: "😐", label: "Steady" },
  { score: 10, emoji: "😊", label: "Strong" }
] as const;

export const MOOD_HEAT_CLASSES = [
  "bg-rose-200 text-rose-950 border-rose-300",
  "bg-orange-200 text-orange-950 border-orange-300",
  "bg-amber-200 text-amber-950 border-amber-300",
  "bg-lime-200 text-lime-950 border-lime-300",
  "bg-emerald-200 text-emerald-950 border-emerald-300"
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/history", label: "History" },
  { href: "/resources", label: "Resources" }
] as const;

export const getFallbackWellnessResponse = ({
  examType,
  moodScore,
  triggers
}: {
  examType: ExamTypeValue;
  moodScore: number;
  triggers: readonly StressTriggerValue[];
}): WellnessResponseShape => {
  const triggerText =
    triggers.length > 0 ? triggers.join(", ").toLowerCase() : "today's pressure";
  const effortNote =
    moodScore <= 4
      ? "A lower mood day still counts as data, not defeat."
      : "Your check-in shows you are paying attention to your energy.";

  return {
    copingStrategy: `For ${triggerText}, try a 10-minute reset: step away from the desk, drink water, and write the next tiny study action on paper. ${effortNote}`,
    motivation: `${examType} preparation can feel heavy because the stakes are visible every day. You are allowed to move steadily without measuring your worth by one mock score or one hard chapter.`,
    mindfulnessExercise:
      "Try box breathing now: inhale for 4 counts, hold for 4, exhale for 4, and hold again for 4. Repeat this for four rounds while relaxing your shoulders.",
    studyTip: `For ${examType}, protect one short recovery block after every two focused study blocks. A rested mind remembers more than a tired mind forcing one extra hour.`
  };
};

export const WELLNESS_RESOURCES = [
  {
    title: "Breathing Techniques",
    items: [
      "Box breathing: inhale 4, hold 4, exhale 4, hold 4 for four rounds.",
      "4-7-8 breathing: inhale 4, hold 7, exhale slowly for 8.",
      "5-4-3-2-1 grounding: name five things you see, four you feel, three you hear, two you smell, one you taste."
    ]
  },
  {
    title: "Study Planning Tips",
    items: [
      "Use 45-10 cycles: 45 minutes focused study, 10 minutes away from the screen or desk.",
      "Keep one daily revision block small enough to complete on a difficult day.",
      "Review mock-test mistakes by topic, not by self-criticism."
    ]
  },
  {
    title: "Emergency Mental Health Contacts in India",
    items: [
      "iCALL Psychosocial Helpline: 9152987821, icall@tiss.ac.in.",
      "Vandrevala Foundation: +91 9999 666 555, help@vandrevalafoundation.com, available 24x7.",
      "India emergency response: call 112 if someone is in immediate danger."
    ]
  }
] as const;
