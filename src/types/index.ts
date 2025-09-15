export interface CriterionResult {
  criterionId: string;
  score: number;
  subquestionResults: Array<{
    subquestionId: string;
    score: number;
    feedback: string;
  }>;
}

export interface TaskResult {
  taskId: string;
  score: number;
  criterionResults: CriterionResult[];
}

export interface CriteriaData {
  [key: string]: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface TaskData {
  [key: string]: {
    id: string;
    name: string;
    question: string;
    Image?: string[];
  };
}

export interface ResultsData {
  score: number;
  taskResults: TaskResult[];
} 