export const storyFrames = [
  {
    position: 1,
    text: "Kolikrát jste dnes čekali na volný stroj?",
    direction: "Detail stroje a krátká otázka přes celou obrazovku.",
  },
  {
    position: 2,
    text: "V MyFit nemusíte. Celé fitness máte pro sebe.",
    direction: "Široký záběr prázdného fitka, klidná atmosféra.",
  },
  {
    position: 3,
    text: "Vyberte si svůj termín. 💪",
    direction: "Logo MyFit, výrazné CTA a prostor pro odkaz Rezervovat.",
  },
];

export const calendarItems = [
  { day: 3, type: "STORY", title: "Cvičení ve dvou", state: "published" },
  { day: 5, type: "STORY", title: "Soukromí bez čekání", state: "today" },
  { day: 7, type: "REEL", title: "5 důvodů vzít parťáka", state: "ready" },
  { day: 9, type: "STORY", title: "Rezervace a CTA", state: "planned" },
  { day: 12, type: "POST", title: "Benefity MyFit", state: "planned" },
  { day: 15, type: "STORY", title: "Trenérský tip", state: "draft" },
  { day: 19, type: "REEL", title: "Krátký trénink", state: "draft" },
  { day: 22, type: "STORY", title: "Community anketa", state: "planned" },
  { day: 26, type: "POST", title: "Soukromé fitness", state: "draft" },
] as const;

export const moduleCards = [
  {
    title: "Marketing Brain",
    description:
      "Ověřená fakta, pravidla značky a preference, které AI musí dodržovat.",
    icon: "◈",
    status: "Připraveno k napojení",
  },
  {
    title: "Idea Bank",
    description: "Rychlé nápady přirozeným jazykem a jejich využití v plánu.",
    icon: "💡",
    status: "Součást MVP",
  },
  {
    title: "Trend Radar",
    description:
      "Aktuální trendy se zdrojem, expirací a doporučením pro MyFit.",
    icon: "↗",
    status: "Součást MVP",
  },
  {
    title: "Kampaně",
    description:
      "Mechanika akce, komunikační plán a samostatné potvrzení výše slevy.",
    icon: "◎",
    status: "Finanční potvrzení povinné",
  },
  {
    title: "AI Visual",
    description:
      "Generování náhledového PNG pro Story nebo Post, i bez vlastní fotky.",
    icon: "▧",
    status: "Součást MVP",
  },
  {
    title: "Marketing Memory",
    description:
      "Historie publikovaného obsahu, témat a odvozených doporučení.",
    icon: "◌",
    status: "Učí se až z potvrzených dat",
  },
];
