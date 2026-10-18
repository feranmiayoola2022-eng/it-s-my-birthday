/* ==========================================================================
   FerranTech Birthday Experience — content data
   Edit this file to change text, add projects, gallery items, or wishes.
   ========================================================================== */

const BIRTHDAY_CONFIG = {
  name: "Ayoola Enoch Oluwaferanmi",
  brand: "FerranTech",
  // month is 0-indexed: 9 = October
  date: { year: 2026, month: 9, day: 19 },
  whatsapp: "2349115725707",
  email: "feranmiayoola2022@gmail.com"
};

/* JOURNEY PANELS ---------------------------------------------------------- */
const JOURNEY_PANELS = [
  {
    title: "The person I am today",
    body: "A Computer Science student who is still figuring things out, and honest about it. I like understanding how things work, I like building, and I like the feeling of finally getting something to behave the way I intended."
  },
  {
    title: "The lessons that shape me",
    body: "Consistency beats intensity. Finishing something small is worth more than starting something impressive. And feedback — especially the uncomfortable kind — is a shortcut, not an insult."
  },
  {
    title: "My journey into technology",
    body: "It started with curiosity about the things I used every day and grew into actual building: HTML and CSS first, then JavaScript, then projects with a real purpose behind them. Now I'm moving into Python and backend development."
  },
  {
    title: "The dreams I'm working towards",
    body: "To become a software developer who builds genuinely useful things — tools that help students, systems that serve real institutions, products that make someone's day slightly easier."
  },
  {
    title: "The person I hope to become",
    body: "Someone disciplined, humble, and consistent. Someone whose work speaks clearly. Someone who kept learning long after the novelty wore off."
  },
  {
    title: "Faith, discipline, and learning",
    body: "Faith gives direction. Discipline gives momentum. Learning keeps both honest. I'm trying to hold all three at once, imperfectly but deliberately."
  }
];

/* PILLARS ----------------------------------------------------------------- */
const PILLARS = [
  {
    label: "Create",
    title: "Ideas into experiences",
    body: "Turning thoughts into thoughtful digital experiences — interfaces that feel considered, not assembled."
  },
  {
    label: "Learn",
    title: "Practice over posturing",
    body: "Developing skills, exploring new possibilities, and improving through practice rather than claiming expertise."
  },
  {
    label: "Build",
    title: "Useful by design",
    body: "Creating meaningful solutions with technology — things that solve a real problem for a real person."
  }
];

/* PROJECTS ----------------------------------------------------------------
   Add `live` or `source` only when a real, working URL exists.
   -------------------------------------------------------------------------- */
const PROJECTS = [
  {
    id: "ibbul-csc",
    title: "IBBUL Computer Science Department Website",
    description:
      "A website created for the Computer Science department at Ibrahim Badamasi Babangida University, Lapai — giving the department a clear, accessible presence online.",
    live: "https://feranmiayoola2022-eng.github.io/IBBUL-CSC/",
    source: "",
    art: "csc"
  },
  {
    id: "sos-alert",
    title: "IBBUL SOS Alert System",
    description:
      "An emergency alert concept focused on helping people communicate emergencies quickly and reach the right response information. A concept project.",
    live: "",
    source: "",
    art: "sos"
  },
  {
    id: "result-checker",
    title: "Result Checker & CGPA Calculator",
    description:
      "A student-focused academic tool built around checking results and calculating CGPA — designed around the workflow students actually deal with.",
    live: "",
    source: "",
    art: "results"
  },
  {
    id: "pchops",
    title: "PCHops Restaurant Ordering Platform",
    description:
      "A restaurant ordering website project focused on presenting a menu clearly and making the ordering experience simpler.",
    live: "",
    source: "",
    art: "pchops"
  }
];

/* GALLERY -----------------------------------------------------------------
   Every item is a clearly-labelled placeholder until you add `src`.
   To use a real photo:
     1. Save an optimised image to assets/img/
     2. Add `src: 'assets/img/your-file.jpg'`
     3. Set `placeholder: false`
     4. Update `alt` and `caption`
   layout: 'normal' | 'wide' | 'tall' | 'featured'
   -------------------------------------------------------------------------- */
const GALLERY = [
  {
    id: "g1", layout: "featured",
    caption: "The year in one frame.",
    alt: "Placeholder for a featured portrait from this year.",
    src: "", placeholder: true,
    note: "Add a featured photograph — assets/img/featured.jpg"
  },
  {
    id: "g2", layout: "normal",
    caption: "At the desk.",
    alt: "Placeholder for a photograph at my workspace.",
    src: "", placeholder: true,
    note: "assets/img/workspace.jpg"
  },
  {
    id: "g3", layout: "tall",
    caption: "Building something.",
    alt: "Placeholder for a photograph while working on a project.",
    src: "", placeholder: true,
    note: "assets/img/building.jpg"
  },
  {
    id: "g4", layout: "normal",
    caption: "A milestone.",
    alt: "Placeholder for a milestone photograph.",
    src: "", placeholder: true,
    note: "assets/img/milestone.jpg"
  },
  {
    id: "g5", layout: "normal",
    caption: "Off-screen.",
    alt: "Placeholder for a personal photograph.",
    src: "", placeholder: true,
    note: "assets/img/personal.jpg"
  },
  {
    id: "g6", layout: "wide",
    caption: "The campus.",
    alt: "Placeholder for a campus photograph.",
    src: "", placeholder: true,
    note: "assets/img/campus.jpg"
  }
];

/* WISHES WALL -------------------------------------------------------------
   These are clearly-labelled SAMPLE notes. They cannot be mistaken for real
   messages. Real messages require a moderation backend — until then the wall
   shows samples plus anything the visitor saved locally on their own device.
   -------------------------------------------------------------------------- */
const SAMPLE_WISHES = [
  {
    text: "Happy birthday, Ferran. Keep building — the discipline you're developing now is going to carry you further than you can see from here.",
    from: "Sample note",
    mood: "Inspirational",
    sample: true
  },
  {
    text: "Another year of grace. Praying this new chapter brings clarity, growth, and open doors.",
    from: "Sample note",
    mood: "Prayerful",
    sample: true
  },
  {
    text: "18 was the setup. 19 is the build. Go and finish something great this year.",
    from: "Sample note",
    mood: "Funny",
    sample: true
  }
];