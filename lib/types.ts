export type ProjectStatus = "active" | "paused" | "archived" | "idea";
export type IdeaStatus = "idea" | "linked" | "converted" | "discarded";
export type SuggestionStatus = "open" | "done" | "discarded";
export type ExperimentStatus = "active" | "promoted" | "kept_as_idea" | "discarded" | "postponed";
export type TodoStatus = "todo" | "want_to_work" | "working" | "done";

export type ProjectTodo = {
  id: number;
  project_id: number;
  title: string;
  status: TodoStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkSession = {
  id: number;
  project_id: number;
  todo_id: number | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
  notes: string;
  created_at: string;
  todo_title?: string | null;
  project_name?: string | null;
  project_slug?: string | null;
};

export type MotivationStats = {
  todayDurationSeconds: number;
  weekDurationSeconds: number;
  todayCompletedCount: number;
  weekCompletedCount: number;
  streakDays: number;
  recentVictories: Array<ProjectTodo & { project_name?: string; duration_seconds?: number }>;
  recentSessions: WorkSession[];
};

export type Project = {
  id: number;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  starred: boolean;
  last_worked_on: string | null;
  current_step: string;
  notes: string;
  created_at: string;
  updated_at: string;
  todos_count?: { total: number; done: number; working?: string; want_to_work?: string };
};

export type Idea = {
  id: number;
  title: string;
  description: string;
  project_id: number | null;
  project_name?: string | null;
  status: IdeaStatus;
  created_at: string;
};

export type Suggestion = {
  id: number;
  title: string;
  description: string;
  project_id: number | null;
  project_name?: string | null;
  tags: string[];
  status: SuggestionStatus;
  created_at: string;
};

export type Experiment = {
  id: number;
  title: string;
  description: string;
  project_id: number | null;
  project_name?: string | null;
  status: ExperimentStatus;
  outcome: string;
  created_at: string;
};

export type ProjectDetail = {
  project: Project;
  todos: ProjectTodo[];
  activeSession: WorkSession | null;
  ideas: Idea[];
  suggestions: Suggestion[];
  experiments: Experiment[];
};

export const statusLabel = {
  project: {
    active: "Active",
    paused: "Paused",
    archived: "Archived",
    idea: "Idea",
  } as Record<ProjectStatus, string>,
  todo: {
    todo: "Várakozik",
    want_to_work: "Ezen akarok dolgozni",
    working: "Ezen dolgozom",
    done: "Kész",
  } as Record<TodoStatus, string>,
  idea: {
    idea: "Idea",
    linked: "Linked",
    converted: "Converted",
    discarded: "Discarded",
  } as Record<IdeaStatus, string>,
  suggestion: {
    open: "Open",
    done: "Done",
    discarded: "Discarded",
  } as Record<SuggestionStatus, string>,
  experiment: {
    active: "Active",
    promoted: "Promoted",
    kept_as_idea: "Kept as idea",
    discarded: "Discarded",
    postponed: "Postponed",
  } as Record<ExperimentStatus, string>,
};
