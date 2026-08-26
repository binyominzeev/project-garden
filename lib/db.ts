import Database from "better-sqlite3";
import path from "path";

const databasePath = path.join(process.cwd(), "garden.db");
const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'archived', 'idea')) DEFAULT 'idea',
    starred INTEGER NOT NULL DEFAULT 0 CHECK(starred IN (0, 1)),
    last_worked_on TEXT,
    current_step TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK(status IN ('idea', 'linked', 'converted', 'discarded')) DEFAULT 'idea',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL CHECK(status IN ('open', 'done', 'discarded')) DEFAULT 'open',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'promoted', 'kept_as_idea', 'discarded', 'postponed')) DEFAULT 'active',
    outcome TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS project_todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('todo', 'want_to_work', 'working', 'done')) DEFAULT 'todo',
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS work_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    todo_id INTEGER REFERENCES project_todos(id) ON DELETE SET NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
`);

// Auto-migrate non-empty descriptions to project_todos
try {
  const projects = db.prepare("SELECT id, description, created_at FROM projects WHERE description IS NOT NULL AND description != ''").all() as Array<{ id: number; description: string; created_at: string }>;
  const now = new Date().toISOString();
  
  const insertTodo = db.prepare(`
    INSERT INTO project_todos (project_id, title, status, created_at, updated_at)
    VALUES (?, ?, 'todo', ?, ?)
  `);
  
  const countTodos = db.prepare("SELECT COUNT(*) as count FROM project_todos WHERE project_id = ?");
  const clearDescription = db.prepare("UPDATE projects SET description = '' WHERE id = ?");

  for (const project of projects) {
    const existing = countTodos.get(project.id) as { count: number };
    if (existing.count === 0) {
      const lines = project.description.split("\n");
      let migratedAny = false;
      for (const rawLine of lines) {
        let cleaned = rawLine.trim();
        // Remove markdown list markers or checkbox markers
        cleaned = cleaned.replace(/^([-*+]|\d+\.|\[\s*\]|\[[xX]\])\s*/, "").trim();
        if (cleaned.length > 0) {
          insertTodo.run(project.id, cleaned, project.created_at || now, now);
          migratedAny = true;
        }
      }
      if (migratedAny) {
        clearDescription.run(project.id);
      }
    }
  }
} catch (e) {
  console.error("Error migrating project descriptions to todos:", e);
}

const slugifyText = (text: string): string => {
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
};

// Auto-migrate slug column on projects table
try {
  db.exec("ALTER TABLE projects ADD COLUMN slug TEXT;");
} catch {
  // Column already exists
}

try {
  db.exec("ALTER TABLE projects ADD COLUMN starred INTEGER NOT NULL DEFAULT 0 CHECK(starred IN (0, 1));");
} catch {
  // Column already exists
}

try {
  const unsluggedProjects = db.prepare("SELECT id, name FROM projects WHERE slug IS NULL OR slug = ''").all() as Array<{ id: number; name: string }>;
  if (unsluggedProjects.length > 0) {
    const updateSlug = db.prepare("UPDATE projects SET slug = ? WHERE id = ?");
    const checkSlug = db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?");

    for (const project of unsluggedProjects) {
      const baseSlug = slugifyText(project.name) || `project-${project.id}`;
      let candidateSlug = baseSlug;
      let counter = 1;
      while (checkSlug.get(candidateSlug, project.id)) {
        counter++;
        candidateSlug = `${baseSlug}-${counter}`;
      }
      updateSlug.run(candidateSlug, project.id);
    }
  }

  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);");
} catch (e) {
  console.error("Error migrating project slugs:", e);
}

export default db;
