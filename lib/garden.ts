import db from "@/lib/db";
import type {
  Experiment,
  ExperimentStatus,
  Idea,
  IdeaStatus,
  Project,
  ProjectDetail,
  ProjectStatus,
  Suggestion,
  SuggestionStatus,
} from "@/lib/types";

type ProjectInput = Partial<Project> & { name?: string };
type IdeaInput = Partial<Idea> & { title?: string };
type SuggestionInput = Partial<Suggestion> & { title?: string; tags?: string[] | string };
type ExperimentInput = Partial<Experiment> & { title?: string };

type RecommendationOptions = {
  excludeIds?: number[];
  limit?: number;
};

type ProjectRow = Omit<Project, "id" | "interest" | "priority"> & {
  id: number;
  interest: number;
  priority: number;
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

const insertProject = db.prepare(`
  INSERT INTO projects (name, description, status, interest, priority, last_worked_on, current_step, notes, created_at, updated_at)
  VALUES (@name, @description, @status, @interest, @priority, @last_worked_on, @current_step, @notes, @created_at, @updated_at)
`);

const updateProjectStatement = db.prepare(`
  UPDATE projects
  SET name = @name,
      description = @description,
      status = @status,
      interest = @interest,
      priority = @priority,
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

function clampRating(value: unknown, fallback = 3) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(5, Math.max(1, Math.round(numeric)));
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
  return row;
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
  const rows = status
    ? db.prepare("SELECT * FROM projects WHERE status = ? ORDER BY updated_at DESC, interest DESC, priority DESC").all(status)
    : db.prepare("SELECT * FROM projects ORDER BY updated_at DESC, interest DESC, priority DESC").all();
  return (rows as ProjectRow[]).map(mapProject);
}

export function getProject(id: number): Project | null {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined;
  return row ? mapProject(row) : null;
}

export function createProject(input: ProjectInput): Project {
  const timestamp = now();
  const payload = {
    name: stringValue(input.name).slice(0, 160),
    description: stringValue(input.description),
    status: normalizeProjectStatus(input.status),
    interest: clampRating(input.interest, 3),
    priority: clampRating(input.priority, 3),
    last_worked_on: nullableString(input.last_worked_on),
    current_step: stringValue(input.current_step),
    notes: stringValue(input.notes),
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (!payload.name) {
    throw new Error("Project name is required");
  }

  const result = insertProject.run(payload);
  return getProject(Number(result.lastInsertRowid)) as Project;
}

export function updateProject(id: number, input: ProjectInput): Project | null {
  const existing = getProject(id);
  if (!existing) return null;

  updateProjectStatement.run({
    id,
    name: stringValue(input.name, existing.name).slice(0, 160),
    description: stringValue(input.description, existing.description),
    status: normalizeProjectStatus(input.status ?? existing.status),
    interest: clampRating(input.interest ?? existing.interest, existing.interest),
    priority: clampRating(input.priority ?? existing.priority, existing.priority),
    last_worked_on:
      input.last_worked_on === null
        ? null
        : nullableString(input.last_worked_on) ?? existing.last_worked_on,
    current_step: stringValue(input.current_step, existing.current_step),
    notes: stringValue(input.notes, existing.notes),
    updated_at: now(),
  });

  return getProject(id);
}

export function deleteProject(id: number) {
  return db.prepare("DELETE FROM projects WHERE id = ?").run(id).changes > 0;
}

export function logProjectWork(id: number, input: { summary?: unknown; nextStep?: unknown }): Project | null {
  const existing = getProject(id);
  if (!existing) return null;

  const summary = stringValue(input.summary);
  const nextStep = stringValue(input.nextStep, existing.current_step);
  const timestamp = now();
  const logEntry = summary ? `[${new Date(timestamp).toLocaleString()}] ${summary}` : "";
  const notes = logEntry
    ? [existing.notes, logEntry].filter(Boolean).join("\n\n")
    : existing.notes;

  updateProjectStatement.run({
    id,
    name: existing.name,
    description: existing.description,
    status: existing.status,
    interest: existing.interest,
    priority: existing.priority,
    last_worked_on: timestamp,
    current_step: nextStep,
    notes,
    updated_at: timestamp,
  });

  return getProject(id);
}

export function listIdeas(): Idea[] {
  const rows = db.prepare(`
    SELECT ideas.*, projects.name AS project_name
    FROM ideas
    LEFT JOIN projects ON ideas.project_id = projects.id
    ORDER BY ideas.created_at DESC
  `).all() as JoinedRow[];
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

export function getProjectDetail(id: number): ProjectDetail | null {
  const project = getProject(id);
  if (!project) return null;

  return {
    project,
    ideas: listIdeas().filter((idea) => idea.project_id === id),
    suggestions: listSuggestions({ projectId: id }),
    experiments: listExperiments(id),
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
      const interestWeight = project.interest * 1.9;
      const priorityWeight = project.priority * 1.7;
      const statusBonus = project.status === "active" ? 1.5 : project.status === "idea" ? 1.1 : 0.4;
      return {
        project,
        score: idleBonus + interestWeight + priorityWeight + statusBonus,
      };
    })
    .sort((left, right) => right.score - left.score || right.project.updated_at.localeCompare(left.project.updated_at));

  return ranked.slice(0, limit).map((item) => item.project);
}
