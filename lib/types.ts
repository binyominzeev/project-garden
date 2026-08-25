export type ProjectStatus = "active" | "paused" | "archived" | "idea";
export type IdeaStatus = "idea" | "linked" | "converted" | "discarded";
export type SuggestionStatus = "open" | "done" | "discarded";
export type ExperimentStatus = "active" | "promoted" | "kept_as_idea" | "discarded" | "postponed";

export type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  interest: number;
  priority: number;
  last_worked_on: string | null;
  current_step: string;
  notes: string;
  created_at: string;
  updated_at: string;
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
