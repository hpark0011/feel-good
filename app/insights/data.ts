export const insights = [
  {
    user: "John Doe",
    match: 90,
    actionType: "contact",
    segments: [
      { text: "Rising engagement with your guidance on " },
      { text: "improving sleep", highlight: true },
      { text: " and morning energy. A quick check-in could convert interest." },
    ],
    sources: [],
  },
  {
    user: "Sam Jung",
    match: 80,
    actionType: "contact",
    segments: [
      { text: "Users are asking about " },
      { text: "stress management", highlight: true },
      { text: " tips. Consider reaching out with a short plan." },
    ],
    sources: [],
  },
  {
    user: "Sam Jung",
    match: 80,
    actionType: "contact",
    segments: [
      { text: "Positive sentiment around " },
      { text: "habit building", highlight: true },
      { text: " is trending. Send a quick nudge to keep momentum." },
    ],
    sources: [],
  },
  {
    user: "David Thompson",
    match: 75,
    actionType: "create-content",
    segments: [
      { text: "24 people asked about " },
      { text: "healthy lunch ideas", highlight: true },
      {
        text: " for busy weekdays. Creating a 3-post series would help you get more audience.",
      },
    ],
    sources: [],
  },
  {
    user: "Sam Jung",
    match: 74,
    actionType: "create-content",
    segments: [
      { text: "Interest in " },
      { text: "beginner strength training", highlight: true },
      { text: " is climbing. Publish a short starter routine." },
    ],
    sources: [],
  },
  {
    user: "David Thompson",
    match: 75,
    actionType: "add-data",
    segments: [
      { text: "Missing " },
      { text: "blood pressure readings", highlight: true },
      { text: " for the last month. Add recent values to improve recs." },
    ],
  },
  {
    user: "Sam Jung",
    match: 74,
    actionType: "add-data",
    segments: [
      { text: "Update your " },
      { text: "sleep diary", highlight: true },
      { text: " for this week to refine insights." },
    ],
    sources: [],
  },
] as const;
