import db from "@/lib/db";
import type {
  Experiment,
  ExperimentStatus,
  Idea,
  IdeaStatus,
  MotivationStats,
  Project,
  ProjectDetail,
  ProjectStatus,
  ProjectTodo,
  Suggestion,
  SuggestionStatus,
  TodoStatus,
  WorkSession,
} from "@/lib/types";

type ProjectInput = Partial<Project> & { name?: string };
type IdeaInput = Partial<Idea> & { title?: string };
type SuggestionInput = Partial<Suggestion> & { title?: string; tags?: string[] | string };
type ExperimentInput = Partial<Experiment> & { title?: string };

type RecommendationOptions = {
  excludeIds?: number[];
  limit?: number;
};

type ProjectRow = Omit<Project, "id" | "starred"> & {
  id: number;
  slug: string;
  starred: number;
};

type JoinedRow = {
  id: number;
  title: string;
  description: string;
  project_id: number | null;
  project_name: string | null;
  status: string;
  created_at: string;
  tags?: string;
  outcome?: string;
};

export function slugify(text: string): string {
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

export function generateUniqueSlug(name: string, excludeProjectId?: number): string {
  const baseSlug = slugify(name) || "project";
  let slug = baseSlug;
  let counter = 1;
  const checkStmt = excludeProjectId
    ? db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?")
    : db.prepare("SELECT id FROM projects WHERE slug = ?");

  while (true) {
    const existing = excludeProjectId ? checkStmt.get(slug, excludeProjectId) : checkStmt.get(slug);
    if (!existing) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

const insertProject = db.prepare(`
  INSERT INTO projects (slug, name, description, status, starred, last_worked_on, current_step, notes, created_at, updated_at)
  VALUES (@slug, @name, @description, @status, @starred, @last_worked_on, @current_step, @notes, @created_at, @updated_at)
`);

const updateProjectStatement = db.prepare(`
  UPDATE projects
  SET slug = @slug,
      name = @name,
      description = @description,
      status = @status,
      starred = @starred,
      last_worked_on = @last_worked_on,
      current_step = @current_step,
      notes = @notes,
      updated_at = @updated_at
  WHERE id = @id
`);

const insertIdea = db.prepare(`
  INSERT INTO ideas (title, description, project_id, status, created_at)
  VALUES (@title, @description, @project_id, @status, @created_at)
`);

const updateIdeaStatement = db.prepare(`
  UPDATE ideas
  SET title = @title,
      description = @description,
      project_id = @project_id,
      status = @status
  WHERE id = @id
`);

const insertSuggestion = db.prepare(`
  INSERT INTO suggestions (title, description, project_id, tags, status, created_at)
  VALUES (@title, @description, @project_id, @tags, @status, @created_at)
`);

const updateSuggestionStatement = db.prepare(`
  UPDATE suggestions
  SET title = @title,
      description = @description,
      project_id = @project_id,
      tags = @tags,
      status = @status
  WHERE id = @id
`);

const insertExperiment = db.prepare(`
  INSERT INTO experiments (title, description, project_id, status, outcome, created_at)
  VALUES (@title, @description, @project_id, @status, @outcome, @created_at)
`);

const updateExperimentStatement = db.prepare(`
  UPDATE experiments
  SET title = @title,
      description = @description,
      project_id = @project_id,
      status = @status,
      outcome = @outcome
  WHERE id = @id
`);

function now() {
  return new Date().toISOString();
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function nullableString(value: unknown) {
  const normalized = stringValue(value);
  return normalized.length ? normalized : null;
}

function normalizeProjectStatus(value: unknown): ProjectStatus {
  return ["active", "paused", "archived", "idea"].includes(String(value)) ? (value as ProjectStatus) : "idea";
}

function normalizeIdeaStatus(value: unknown): IdeaStatus {
  return ["idea", "linked", "converted", "discarded"].includes(String(value)) ? (value as IdeaStatus) : "idea";
}

function normalizeSuggestionStatus(value: unknown): SuggestionStatus {
  return ["open", "done", "discarded"].includes(String(value)) ? (value as SuggestionStatus) : "open";
}

function normalizeExperimentStatus(value: unknown): ExperimentStatus {
  return ["active", "promoted", "kept_as_idea", "discarded", "postponed"].includes(String(value))
    ? (value as ExperimentStatus)
    : "active";
}

function normalizeProjectId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function normalizeBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function parseTags(value: string | null | undefined) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : [];
  } catch {
    return [];
  }
}

function mapProject(row: ProjectRow): Project {
  return {
    ...row,
    starred: Boolean(row.starred),
  };
}

function mapIdea(row: JoinedRow): Idea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    project_id: row.project_id,
    project_name: row.project_name,
    status: normalizeIdeaStatus(row.status),
    created_at: row.created_at,
  };
}

function mapSuggestion(row: JoinedRow): Suggestion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    project_id: row.project_id,
    project_name: row.project_name,
    tags: parseTags(row.tags),
    status: normalizeSuggestionStatus(row.status),
    created_at: row.created_at,
  };
}

function mapExperiment(row: JoinedRow): Experiment {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    project_id: row.project_id,
    project_name: row.project_name,
    status: normalizeExperimentStatus(row.status),
    outcome: row.outcome ?? "",
    created_at: row.created_at,
  };
}

export function listProjects(status?: string): Project[] {
  const query = `
    SELECT p.*,
      COUNT(pt.id) as total_todos,
      SUM(CASE WHEN pt.status = 'done' THEN 1 ELSE 0 END) as done_todos,
      (SELECT title FROM project_todos WHERE project_id = p.id AND status = 'working' LIMIT 1) as working_todo,
      (SELECT title FROM project_todos WHERE project_id = p.id AND status = 'want_to_work' LIMIT 1) as want_to_work_todo
    FROM projects p
    LEFT JOIN project_todos pt ON p.id = pt.project_id
    ${status ? "WHERE p.status = ?" : ""}
    GROUP BY p.id
    ORDER BY p.starred DESC, p.updated_at DESC
  `;

  const rows = status
    ? db.prepare(query).all(status)
    : db.prepare(query).all();

  return (rows as Array<ProjectRow & { total_todos: number; done_todos: number; working_todo?: string; want_to_work_todo?: string }>).map((row) => ({
    ...mapProject(row),
    todos_count: {
      total: row.total_todos || 0,
      done: row.done_todos || 0,
      working: row.working_todo || undefined,
      want_to_work: row.want_to_work_todo || undefined,
    },
  }));
}

export function getProject(idOrSlug: number | string): Project | null {
  if (typeof idOrSlug === "number" || /^\d+$/.test(String(idOrSlug))) {
    const numericId = Number(idOrSlug);
    const row = (db.prepare("SELECT * FROM projects WHERE id = ? OR slug = ?").get(numericId, String(idOrSlug))) as ProjectRow | undefined;
    return row ? mapProject(row) : null;
  }
  const row = db.prepare("SELECT * FROM projects WHERE slug = ?").get(String(idOrSlug)) as ProjectRow | undefined;
  return row ? mapProject(row) : null;
}

export function createProject(input: ProjectInput): Project {
  const timestamp = now();
  const name = stringValue(input.name).slice(0, 160);

  if (!name) {
    throw new Error("Project name is required");
  }

  const slug = generateUniqueSlug(name);
  const payload = {
    slug,
    name,
    description: stringValue(input.description),
    status: normalizeProjectStatus(input.status),
    starred: normalizeBoolean(input.starred, false) ? 1 : 0,
    last_worked_on: nullableString(input.last_worked_on),
    current_step: stringValue(input.current_step),
    notes: stringValue(input.notes),
    created_at: timestamp,
    updated_at: timestamp,
  };

  const result = insertProject.run(payload);
  return getProject(Number(result.lastInsertRowid)) as Project;
}

export function updateProject(idOrSlug: number | string, input: ProjectInput): Project | null {
  const existing = getProject(idOrSlug);
  if (!existing) return null;

  const newName = stringValue(input.name, existing.name).slice(0, 160);
  const slug = newName !== existing.name || !existing.slug
    ? generateUniqueSlug(newName, existing.id)
    : existing.slug;

  updateProjectStatement.run({
    id: existing.id,
    slug,
    name: newName,
    description: stringValue(input.description, existing.description),
    status: normalizeProjectStatus(input.status ?? existing.status),
    starred: normalizeBoolean(input.starred, existing.starred) ? 1 : 0,
    last_worked_on:
      input.last_worked_on === null
        ? null
        : nullableString(input.last_worked_on) ?? existing.last_worked_on,
    current_step: stringValue(input.current_step, existing.current_step),
    notes: stringValue(input.notes, existing.notes),
    updated_at: now(),
  });

  return getProject(existing.id);
}

export function deleteProject(idOrSlug: number | string) {
  const existing = getProject(idOrSlug);
  if (!existing) return false;
  return db.prepare("DELETE FROM projects WHERE id = ?").run(existing.id).changes > 0;
}

export function logProjectWork(idOrSlug: number | string, input: { summary?: unknown; nextStep?: unknown }): Project | null {
  const existing = getProject(idOrSlug);
  if (!existing) return null;

  const summary = stringValue(input.summary);
  const nextStep = stringValue(input.nextStep, existing.current_step);
  const timestamp = now();
  const logEntry = summary ? `[${new Date(timestamp).toLocaleString()}] ${summary}` : "";
  const notes = logEntry
    ? [existing.notes, logEntry].filter(Boolean).join("\n\n")
    : existing.notes;

  updateProjectStatement.run({
    id: existing.id,
    slug: existing.slug,
    name: existing.name,
    description: existing.description,
    status: existing.status,
    starred: existing.starred ? 1 : 0,
    last_worked_on: timestamp,
    current_step: nextStep,
    notes,
    updated_at: timestamp,
  });

  return getProject(existing.id);
}

export function listIdeas(options: { projectId?: number } = {}): Idea[] {
  const { projectId } = options;
  const rows = db.prepare(`
    SELECT ideas.*, projects.name AS project_name
    FROM ideas
    LEFT JOIN projects ON ideas.project_id = projects.id
    ${projectId !== undefined ? "WHERE ideas.project_id = ?" : ""}
    ORDER BY ideas.created_at DESC
  `).all(...(projectId !== undefined ? [projectId] : [])) as JoinedRow[];
  return rows.map(mapIdea);
}

export function getIdea(id: number): Idea | null {
  const row = db.prepare(`
    SELECT ideas.*, projects.name AS project_name
    FROM ideas
    LEFT JOIN projects ON ideas.project_id = projects.id
    WHERE ideas.id = ?
  `).get(id) as JoinedRow | undefined;
  return row ? mapIdea(row) : null;
}

export function createIdea(input: IdeaInput): Idea {
  const payload = {
    title: stringValue(input.title).slice(0, 160),
    description: stringValue(input.description),
    project_id: normalizeProjectId(input.project_id),
    status: normalizeIdeaStatus(input.status),
    created_at: now(),
  };

  if (!payload.title) {
    throw new Error("Idea title is required");
  }

  const result = insertIdea.run(payload);
  return getIdea(Number(result.lastInsertRowid)) as Idea;
}

export function updateIdea(id: number, input: IdeaInput): Idea | null {
  const existing = getIdea(id);
  if (!existing) return null;

  updateIdeaStatement.run({
    id,
    title: stringValue(input.title, existing.title).slice(0, 160),
    description: stringValue(input.description, existing.description),
    project_id: input.project_id === null ? null : normalizeProjectId(input.project_id) ?? existing.project_id,
    status: normalizeIdeaStatus(input.status ?? existing.status),
  });

  return getIdea(id);
}

export function deleteIdea(id: number) {
  return db.prepare("DELETE FROM ideas WHERE id = ?").run(id).changes > 0;
}

export function listSuggestions(filters: { q?: string; tag?: string; projectId?: number | null } = {}): Suggestion[] {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.q) {
    clauses.push("(LOWER(suggestions.title) LIKE ? OR LOWER(suggestions.description) LIKE ?)");
    const pattern = `%${filters.q.toLowerCase()}%`;
    params.push(pattern, pattern);
  }

  if (filters.tag) {
    clauses.push("LOWER(suggestions.tags) LIKE ?");
    params.push(`%${filters.tag.toLowerCase()}%`);
  }

  if (typeof filters.projectId === "number") {
    clauses.push("suggestions.project_id = ?");
    params.push(filters.projectId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.prepare(`
    SELECT suggestions.*, projects.name AS project_name
    FROM suggestions
    LEFT JOIN projects ON suggestions.project_id = projects.id
    ${where}
    ORDER BY suggestions.created_at DESC
  `).all(...params) as JoinedRow[];

  return rows.map(mapSuggestion);
}

export function getSuggestion(id: number): Suggestion | null {
  const row = db.prepare(`
    SELECT suggestions.*, projects.name AS project_name
    FROM suggestions
    LEFT JOIN projects ON suggestions.project_id = projects.id
    WHERE suggestions.id = ?
  `).get(id) as JoinedRow | undefined;
  return row ? mapSuggestion(row) : null;
}

export function createSuggestion(input: SuggestionInput): Suggestion {
  const payload = {
    title: stringValue(input.title).slice(0, 160),
    description: stringValue(input.description),
    project_id: normalizeProjectId(input.project_id),
    tags: JSON.stringify(normalizeTags(input.tags)),
    status: normalizeSuggestionStatus(input.status),
    created_at: now(),
  };

  if (!payload.title) {
    throw new Error("Suggestion title is required");
  }

  const result = insertSuggestion.run(payload);
  return getSuggestion(Number(result.lastInsertRowid)) as Suggestion;
}

export function updateSuggestion(id: number, input: SuggestionInput): Suggestion | null {
  const existing = getSuggestion(id);
  if (!existing) return null;

  updateSuggestionStatement.run({
    id,
    title: stringValue(input.title, existing.title).slice(0, 160),
    description: stringValue(input.description, existing.description),
    project_id: input.project_id === null ? null : normalizeProjectId(input.project_id) ?? existing.project_id,
    tags: JSON.stringify(normalizeTags(input.tags ?? existing.tags)),
    status: normalizeSuggestionStatus(input.status ?? existing.status),
  });

  return getSuggestion(id);
}

export function deleteSuggestion(id: number) {
  return db.prepare("DELETE FROM suggestions WHERE id = ?").run(id).changes > 0;
}

export function listExperiments(projectId?: number | null): Experiment[] {
  const rows = (typeof projectId === "number"
    ? db.prepare(`
        SELECT experiments.*, projects.name AS project_name
        FROM experiments
        LEFT JOIN projects ON experiments.project_id = projects.id
        WHERE experiments.project_id = ?
        ORDER BY experiments.created_at DESC
      `).all(projectId)
    : db.prepare(`
        SELECT experiments.*, projects.name AS project_name
        FROM experiments
        LEFT JOIN projects ON experiments.project_id = projects.id
        ORDER BY experiments.created_at DESC
      `).all()) as JoinedRow[];

  return rows.map(mapExperiment);
}

export function getExperiment(id: number): Experiment | null {
  const row = db.prepare(`
    SELECT experiments.*, projects.name AS project_name
    FROM experiments
    LEFT JOIN projects ON experiments.project_id = projects.id
    WHERE experiments.id = ?
  `).get(id) as JoinedRow | undefined;
  return row ? mapExperiment(row) : null;
}

export function createExperiment(input: ExperimentInput): Experiment {
  const payload = {
    title: stringValue(input.title).slice(0, 160),
    description: stringValue(input.description),
    project_id: normalizeProjectId(input.project_id),
    status: normalizeExperimentStatus(input.status),
    outcome: stringValue(input.outcome),
    created_at: now(),
  };

  if (!payload.title) {
    throw new Error("Experiment title is required");
  }

  const result = insertExperiment.run(payload);
  return getExperiment(Number(result.lastInsertRowid)) as Experiment;
}

export function updateExperiment(id: number, input: ExperimentInput): Experiment | null {
  const existing = getExperiment(id);
  if (!existing) return null;

  updateExperimentStatement.run({
    id,
    title: stringValue(input.title, existing.title).slice(0, 160),
    description: stringValue(input.description, existing.description),
    project_id: input.project_id === null ? null : normalizeProjectId(input.project_id) ?? existing.project_id,
    status: normalizeExperimentStatus(input.status ?? existing.status),
    outcome: stringValue(input.outcome, existing.outcome),
  });

  return getExperiment(id);
}

export function deleteExperiment(id: number) {
  return db.prepare("DELETE FROM experiments WHERE id = ?").run(id).changes > 0;
}

export function getProjectTodos(projectId: number): ProjectTodo[] {
  return db.prepare(`
    SELECT * FROM project_todos
    WHERE project_id = ?
    ORDER BY CASE status
      WHEN 'working' THEN 1
      WHEN 'want_to_work' THEN 2
      WHEN 'todo' THEN 3
      WHEN 'done' THEN 4
    END, updated_at DESC
  `).all(projectId) as ProjectTodo[];
}

export function createProjectTodo(projectId: number, title: string): ProjectTodo {
  const cleanTitle = stringValue(title).slice(0, 200);
  if (!cleanTitle) {
    throw new Error("Todo title is required");
  }
  const timestamp = now();
  const res = db.prepare(`
    INSERT INTO project_todos (project_id, title, status, created_at, updated_at)
    VALUES (?, ?, 'todo', ?, ?)
  `).run(projectId, cleanTitle, timestamp, timestamp);

  db.prepare("UPDATE projects SET updated_at = ? WHERE id = ?").run(timestamp, projectId);

  return db.prepare("SELECT * FROM project_todos WHERE id = ?").get(res.lastInsertRowid) as ProjectTodo;
}

function stopActiveWorkSessions() {
  const timestamp = now();
  const openSessions = db.prepare("SELECT * FROM work_sessions WHERE end_time IS NULL").all() as WorkSession[];
  for (const session of openSessions) {
    const duration = Math.max(1, Math.round((new Date(timestamp).getTime() - new Date(session.start_time).getTime()) / 1000));
    db.prepare("UPDATE work_sessions SET end_time = ?, duration_seconds = ? WHERE id = ?")
      .run(timestamp, duration, session.id);
  }
}

function stopActiveWorkSessionsForTodo(todoId: number) {
  const timestamp = now();
  const openSessions = db.prepare("SELECT * FROM work_sessions WHERE todo_id = ? AND end_time IS NULL").all(todoId) as WorkSession[];
  for (const session of openSessions) {
    const duration = Math.max(1, Math.round((new Date(timestamp).getTime() - new Date(session.start_time).getTime()) / 1000));
    db.prepare("UPDATE work_sessions SET end_time = ?, duration_seconds = ? WHERE id = ?")
      .run(timestamp, duration, session.id);
  }
}

export function updateProjectTodoStatus(projectId: number, todoId: number, status: TodoStatus): ProjectTodo | null {
  const existing = db.prepare("SELECT * FROM project_todos WHERE id = ? AND project_id = ?").get(todoId, projectId) as ProjectTodo | undefined;
  if (!existing) return null;

  const timestamp = now();

  if (status === "working") {
    stopActiveWorkSessions();

    db.prepare("UPDATE project_todos SET status = 'want_to_work', updated_at = ? WHERE project_id = ? AND status = 'working' AND id != ?")
      .run(timestamp, projectId, todoId);

    db.prepare(`
      INSERT INTO work_sessions (project_id, todo_id, start_time, duration_seconds, notes, created_at)
      VALUES (?, ?, ?, 0, '', ?)
    `).run(projectId, todoId, timestamp, timestamp);

    db.prepare("UPDATE projects SET last_worked_on = ?, current_step = ?, updated_at = ? WHERE id = ?")
      .run(timestamp, existing.title, timestamp, projectId);

    db.prepare("UPDATE project_todos SET status = 'working', completed_at = NULL, updated_at = ? WHERE id = ?")
      .run(timestamp, todoId);
  } else if (status === "done") {
    stopActiveWorkSessionsForTodo(todoId);

    db.prepare("UPDATE project_todos SET status = 'done', completed_at = ?, updated_at = ? WHERE id = ?")
      .run(timestamp, timestamp, todoId);

    db.prepare("UPDATE projects SET last_worked_on = ?, updated_at = ? WHERE id = ?")
      .run(timestamp, timestamp, projectId);
  } else {
    stopActiveWorkSessionsForTodo(todoId);

    db.prepare("UPDATE project_todos SET status = ?, completed_at = NULL, updated_at = ? WHERE id = ?")
      .run(status, timestamp, todoId);
  }

  return db.prepare("SELECT * FROM project_todos WHERE id = ?").get(todoId) as ProjectTodo;
}

export function deleteProjectTodo(projectId: number, todoId: number): boolean {
  stopActiveWorkSessionsForTodo(todoId);
  return db.prepare("DELETE FROM project_todos WHERE id = ? AND project_id = ?").run(todoId, projectId).changes > 0;
}

export function getActiveWorkSession(projectId?: number): WorkSession | null {
  const row = (projectId
    ? db.prepare(`
        SELECT ws.*, pt.title as todo_title, p.name as project_name, p.slug as project_slug
        FROM work_sessions ws
        LEFT JOIN project_todos pt ON ws.todo_id = pt.id
        LEFT JOIN projects p ON ws.project_id = p.id
        WHERE ws.project_id = ? AND ws.end_time IS NULL
        ORDER BY ws.start_time DESC LIMIT 1
      `).get(projectId)
    : db.prepare(`
        SELECT ws.*, pt.title as todo_title, p.name as project_name, p.slug as project_slug
        FROM work_sessions ws
        LEFT JOIN project_todos pt ON ws.todo_id = pt.id
        LEFT JOIN projects p ON ws.project_id = p.id
        WHERE ws.end_time IS NULL
        ORDER BY ws.start_time DESC LIMIT 1
      `).get()) as WorkSession | undefined;

  return row || null;
}

export function stopWorkSession(sessionId?: number, notes = ""): WorkSession | null {
  const timestamp = now();
  const session = sessionId
    ? (db.prepare("SELECT * FROM work_sessions WHERE id = ?").get(sessionId) as WorkSession | undefined)
    : (db.prepare("SELECT * FROM work_sessions WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1").get() as WorkSession | undefined);

  if (!session || session.end_time) return null;

  const duration = Math.max(1, Math.round((new Date(timestamp).getTime() - new Date(session.start_time).getTime()) / 1000));
  db.prepare("UPDATE work_sessions SET end_time = ?, duration_seconds = ?, notes = ? WHERE id = ?").run(
    timestamp,
    duration,
    notes || session.notes || "",
    session.id
  );

  if (session.todo_id) {
    const todo = db.prepare("SELECT status FROM project_todos WHERE id = ?").get(session.todo_id) as { status: string } | undefined;
    if (todo && todo.status === "working") {
      db.prepare("UPDATE project_todos SET status = 'want_to_work', updated_at = ? WHERE id = ?").run(timestamp, session.todo_id);
    }
  }

  return db.prepare(`
    SELECT ws.*, pt.title as todo_title, p.name as project_name, p.slug as project_slug
    FROM work_sessions ws
    LEFT JOIN project_todos pt ON ws.todo_id = pt.id
    LEFT JOIN projects p ON ws.project_id = p.id
    WHERE ws.id = ?
  `).get(session.id) as WorkSession;
}

export function getMotivationStats(): MotivationStats {
  const nowObj = new Date();
  const todayStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, "0")}-${String(nowObj.getDate()).padStart(2, "0")}`;
  const weekAgoObj = new Date(nowObj.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgoObj.toISOString();

  const allSessions = db.prepare(`
    SELECT ws.*, pt.title as todo_title, p.name as project_name, p.slug as project_slug
    FROM work_sessions ws
    LEFT JOIN project_todos pt ON ws.todo_id = pt.id
    LEFT JOIN projects p ON ws.project_id = p.id
    ORDER BY ws.start_time DESC
  `).all() as WorkSession[];

  let todayDurationSeconds = 0;
  let weekDurationSeconds = 0;

  for (const session of allSessions) {
    let dur = session.duration_seconds;
    if (!session.end_time) {
      dur = Math.max(0, Math.round((nowObj.getTime() - new Date(session.start_time).getTime()) / 1000));
    }

    if (session.start_time.startsWith(todayStr)) {
      todayDurationSeconds += dur;
    }
    if (session.start_time >= weekAgoStr) {
      weekDurationSeconds += dur;
    }
  }

  const todayCompleted = db.prepare("SELECT COUNT(*) as count FROM project_todos WHERE completed_at LIKE ?").get(`${todayStr}%`) as { count: number };
  const weekCompleted = db.prepare("SELECT COUNT(*) as count FROM project_todos WHERE completed_at >= ?").get(weekAgoStr) as { count: number };

  const activityDatesRows = db.prepare(`
    SELECT DISTINCT substr(date, 1, 10) as day FROM (
      SELECT completed_at as date FROM project_todos WHERE completed_at IS NOT NULL
      UNION ALL
      SELECT start_time as date FROM work_sessions
    ) WHERE date IS NOT NULL AND date != ''
    ORDER BY day DESC
  `).all() as Array<{ day: string }>;

  const dateSet = new Set(activityDatesRows.map((r) => r.day));
  let streakDays = 0;

  const checkDate = new Date(nowObj);
  const checkTodayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

  if (!dateSet.has(checkTodayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (dateSet.has(dStr)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const victoriesRows = db.prepare(`
    SELECT pt.*, p.name as project_name,
      COALESCE((SELECT SUM(ws.duration_seconds) FROM work_sessions ws WHERE ws.todo_id = pt.id), 0) as duration_seconds
    FROM project_todos pt
    LEFT JOIN projects p ON pt.project_id = p.id
    WHERE pt.status = 'done'
    ORDER BY pt.completed_at DESC LIMIT 20
  `).all() as Array<ProjectTodo & { project_name?: string; duration_seconds?: number }>;

  return {
    todayDurationSeconds,
    weekDurationSeconds,
    todayCompletedCount: todayCompleted.count,
    weekCompletedCount: weekCompleted.count,
    streakDays,
    recentVictories: victoriesRows,
    recentSessions: allSessions.slice(0, 20),
  };
}

export function getProjectDetail(idOrSlug: number | string): ProjectDetail | null {
  const project = getProject(idOrSlug);
  if (!project) return null;

  return {
    project,
    todos: getProjectTodos(project.id),
    activeSession: getActiveWorkSession(project.id),
    ideas: listIdeas({ projectId: project.id }),
    suggestions: listSuggestions({ projectId: project.id }),
    experiments: listExperiments(project.id),
  };
}

export function getProjectRecommendations(options: RecommendationOptions = {}): Project[] {
  const { excludeIds = [], limit = 3 } = options;
  const excluded = new Set(excludeIds);
  const candidates = listProjects().filter((project) => project.status !== "archived" && !excluded.has(project.id));

  const ranked = candidates
    .map((project) => {
      const daysSinceWorked = project.last_worked_on
        ? Math.floor((Date.now() - new Date(project.last_worked_on).getTime()) / (1000 * 60 * 60 * 24))
        : 45;
      const idleBonus = Math.min(Math.max(daysSinceWorked, 0), 45) * 0.08;
      const starredBonus = project.starred ? 4.2 : 0;
      const statusBonus = project.status === "active" ? 1.5 : project.status === "idea" ? 1.1 : 0.4;
      return {
        project,
        score: idleBonus + starredBonus + statusBonus,
      };
    })
    .sort((left, right) => right.score - left.score || right.project.updated_at.localeCompare(left.project.updated_at));

  return ranked.slice(0, limit).map((item) => item.project);
}
