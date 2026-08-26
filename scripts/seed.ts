import db from "../lib/db";

const now = new Date();

const projectSeed = [
  {
    name: "Project Garden",
    description: "A calm dashboard for choosing what to work on across personal software projects.",
    status: "active",
    starred: true,
    last_worked_on: daysAgo(1),
    current_step: "Finish the recommendations card interactions and polish the project detail page.",
    notes: "Core MVP is in place. Need to keep the tone warm and personal.",
  },
  {
    name: "Voice Memo Summarizer",
    description: "A tiny app that turns rambly phone voice notes into concise action items.",
    status: "active",
    starred: true,
    last_worked_on: daysAgo(9),
    current_step: "Prototype local transcription fallback for offline notes.",
    notes: "The mobile capture flow feels delightful already.",
  },
  {
    name: "Recipe Screenshot Parser",
    description: "Extract ingredients and steps from screenshots so recipes stop living in camera roll chaos.",
    status: "paused",
    starred: false,
    last_worked_on: daysAgo(22),
    current_step: "Evaluate OCR libraries with better handwritten support.",
    notes: "Promising utility, but parsing quality needs another pass.",
  },
  {
    name: "Indie Analytics Journal",
    description: "Combine product metrics with a daily journal so numbers have context.",
    status: "idea",
    starred: true,
    last_worked_on: null,
    current_step: "Sketch the weekly review screen and metric import flow.",
    notes: "Could be useful for tiny SaaS experiments.",
  },
  {
    name: "Tiny CRM for Friend Projects",
    description: "A relationship tracker for collaborators, references, and casual project check-ins.",
    status: "paused",
    starred: false,
    last_worked_on: daysAgo(40),
    current_step: "Decide whether this should really be a Notion template instead of an app.",
    notes: "Useful, but maybe overbuilt.",
  },
  {
    name: "Open Tabs Graveyard",
    description: "A browser extension that helps turn tab clutter into saved ideas or tasks.",
    status: "active",
    starred: true,
    last_worked_on: daysAgo(6),
    current_step: "Build the archive-to-reading-list flow.",
    notes: "Strong personal painkiller project.",
  },
  {
    name: "Neighborhood Event Bot",
    description: "A weekly digest of local events stitched together from community calendars.",
    status: "idea",
    starred: false,
    last_worked_on: null,
    current_step: "See whether calendar sources are consistent enough to scrape.",
    notes: "Could be charming if the data quality holds up.",
  },
  {
    name: "Desk Stretch Companion",
    description: "Gentle movement reminders for long coding sessions, tuned for deep work blocks.",
    status: "archived",
    starred: false,
    last_worked_on: daysAgo(120),
    current_step: "Leave archived unless a strong reason returns.",
    notes: "Nice concept, but the habit never stuck.",
  },
  {
    name: "Personal API Cookbook",
    description: "A searchable archive of clean API examples from projects you enjoyed building.",
    status: "active",
    starred: true,
    last_worked_on: daysAgo(14),
    current_step: "Port the favorite auth examples and document copy-paste snippets.",
    notes: "This could save future-you a lot of setup time.",
  },
];

const ideaSeed = [
  { title: "Weekly review email to self", description: "Summarize what shipped, what stalled, and what feels interesting next.", project: "Project Garden", status: "linked" },
  { title: "Mood-based project picker", description: "Let the app suggest projects based on focus, energy, and available time.", project: "Project Garden", status: "linked" },
  { title: "Import voice notes from iCloud folder", description: "Watch a folder and create draft summaries automatically.", project: "Voice Memo Summarizer", status: "idea" },
  { title: "Ingredient substitution helper", description: "Offer quick swaps once the recipe screenshot is parsed.", project: "Recipe Screenshot Parser", status: "idea" },
  { title: "Micro-journal attached to analytics spikes", description: "Ask why a metric moved before memory fades.", project: "Indie Analytics Journal", status: "linked" },
  { title: "Warm intro tracker", description: "Store people who might be helpful for future launches or hiring.", project: "Tiny CRM for Friend Projects", status: "idea" },
  { title: "Tab cleanup streak counter", description: "Reward the habit of converting tabs into captured items.", project: "Open Tabs Graveyard", status: "linked" },
  { title: "Calendar source reliability score", description: "Rank event feeds by freshness and duplicate rate.", project: "Neighborhood Event Bot", status: "idea" },
  { title: "Favorite snippet collections", description: "Bundle API examples by task like auth, uploads, and pagination.", project: "Personal API Cookbook", status: "linked" },
  { title: "One-tap project parking", description: "Pause a project without guilt and leave yourself a future restart note.", project: "Project Garden", status: "idea" },
  { title: "Audio summary speaker labels", description: "Separate your own reflections from interview clips.", project: "Voice Memo Summarizer", status: "idea" },
  { title: "Generate grocery list from parsed recipe", description: "Turn captured recipes into a practical next action.", project: "Recipe Screenshot Parser", status: "idea" },
];

const suggestionSeed = [
  { title: "Add keyboard shortcuts for capture", description: "Open each quick-capture form with a single keystroke.", project: "Project Garden", tags: ["ux", "speed"], status: "open" },
  { title: "Persist dismissed tabs to a maybe-later bucket", description: "Not every tab should become a task, but some deserve a holding pen.", project: "Open Tabs Graveyard", tags: ["workflow", "capture"], status: "open" },
  { title: "Show analytics trends beside journal entries", description: "Overlay metrics next to writing so causality is easier to infer.", project: "Indie Analytics Journal", tags: ["insight", "metrics"], status: "done" },
  { title: "Better OCR confidence surfacing", description: "Highlight low-confidence recipe blocks so edits are faster.", project: "Recipe Screenshot Parser", tags: ["ocr", "quality"], status: "open" },
  { title: "Link experiments back into idea backlog", description: "When an experiment stalls, store its learning as an idea automatically.", project: "Project Garden", tags: ["workflow", "ideas"], status: "open" },
  { title: "Create starter packs of common API patterns", description: "Bundle examples by category and include gotchas you already solved.", project: "Personal API Cookbook", tags: ["docs", "snippets"], status: "open" },
];

const experimentSeed = [
  { title: "Command palette quick capture", description: "See if a command palette beats the home page buttons for fast capture.", project: "Project Garden", status: "active", outcome: "Early prototype feels faster on desktop, but mobile needs a different pattern." },
  { title: "Edge OCR worker", description: "Test whether OCR can run cheaply on an edge function without timeouts.", project: "Recipe Screenshot Parser", status: "postponed", outcome: "Cold starts made the first pass unpleasant. Revisit if provider options improve." },
  { title: "Digest built from local event calendars only", description: "Try generating a weekly event email without social APIs.", project: "Neighborhood Event Bot", status: "kept_as_idea", outcome: "Data quality was uneven, but the concept still feels charming enough to revisit later." },
  { title: "Audio summary in two tones", description: "Compare concise summaries versus conversational recap outputs.", project: "Voice Memo Summarizer", status: "promoted", outcome: "Concise mode clearly wins for daily use, but both should exist." },
];

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function getProjectIdMap() {
  const rows = db.prepare("SELECT id, name FROM projects").all() as Array<{ id: number; name: string }>;
  return new Map(rows.map((row) => [row.name, row.id]));
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function main() {
  db.exec(`
    DELETE FROM experiments;
    DELETE FROM suggestions;
    DELETE FROM ideas;
    DELETE FROM projects;
    DELETE FROM sqlite_sequence WHERE name IN ('projects', 'ideas', 'suggestions', 'experiments');
  `);

  const insertProject = db.prepare(`
    INSERT INTO projects (slug, name, description, status, starred, last_worked_on, current_step, notes, created_at, updated_at)
    VALUES (@slug, @name, @description, @status, @starred, @last_worked_on, @current_step, @notes, @created_at, @updated_at)
  `);

  const insertIdea = db.prepare(`
    INSERT INTO ideas (title, description, project_id, status, created_at)
    VALUES (@title, @description, @project_id, @status, @created_at)
  `);

  const insertSuggestion = db.prepare(`
    INSERT INTO suggestions (title, description, project_id, tags, status, created_at)
    VALUES (@title, @description, @project_id, @tags, @status, @created_at)
  `);

  const insertExperiment = db.prepare(`
    INSERT INTO experiments (title, description, project_id, status, outcome, created_at)
    VALUES (@title, @description, @project_id, @status, @outcome, @created_at)
  `);

  const transaction = db.transaction(() => {
    for (const project of projectSeed) {
      const createdAt = project.last_worked_on ?? daysAgo(30);
      insertProject.run({
        ...project,
        slug: slugify(project.name),
        created_at: createdAt,
        updated_at: project.last_worked_on ?? createdAt,
      });
    }

    const projectIds = getProjectIdMap();

    for (const idea of ideaSeed) {
      insertIdea.run({
        title: idea.title,
        description: idea.description,
        project_id: projectIds.get(idea.project) ?? null,
        status: idea.status,
        created_at: daysAgo(Math.floor(Math.random() * 25) + 1),
      });
    }

    for (const suggestion of suggestionSeed) {
      insertSuggestion.run({
        title: suggestion.title,
        description: suggestion.description,
        project_id: projectIds.get(suggestion.project) ?? null,
        tags: JSON.stringify(suggestion.tags),
        status: suggestion.status,
        created_at: daysAgo(Math.floor(Math.random() * 18) + 1),
      });
    }

    for (const experiment of experimentSeed) {
      insertExperiment.run({
        title: experiment.title,
        description: experiment.description,
        project_id: projectIds.get(experiment.project) ?? null,
        status: experiment.status,
        outcome: experiment.outcome,
        created_at: daysAgo(Math.floor(Math.random() * 20) + 1),
      });
    }
  });

  transaction();

  const counts = {
    projects: (db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number }).count,
    ideas: (db.prepare("SELECT COUNT(*) as count FROM ideas").get() as { count: number }).count,
    suggestions: (db.prepare("SELECT COUNT(*) as count FROM suggestions").get() as { count: number }).count,
    experiments: (db.prepare("SELECT COUNT(*) as count FROM experiments").get() as { count: number }).count,
  };

  console.log(`Seeded ${counts.projects} projects, ${counts.ideas} ideas, ${counts.suggestions} suggestions, and ${counts.experiments} experiments.`);
}

main();
