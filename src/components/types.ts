export interface TaskResult {
    taskId: string;
    score: number;
    criterionResults: Array<{
        criterionId: string;
        score: number;
        subquestionResults: Array<{
            subquestionId: string;
            score: number;
            feedback: string;
        }>;
    }>;
}

export interface UserResult {
    score: number | null;
    taskResults: TaskResult[];
}

export interface Image {
    imageQuestion: {
        formats: {
            thumbnail: {
                url: string;
            };
        };
    };
}

export interface Task {
    id: string;
    name: string;
    question: string;
    idealPrompt: string;
    Image: Image[];
}

export interface Criteria {
    id: string;
    name: string;
}

export interface TaskImageProps {
    image: Task['Image'][0];
}

export interface TaskHintProps {
    task: Task;
    showHint: boolean;
    onToggleHint: () => void;
}

export interface TaskResultsProps {
    taskResult: TaskResult;
    criteriaData: Record<string, Criteria>;
    currentAttempts: number;
    onNextTask: () => void;
}

export interface TaskSubmissionProps {
    userSolution: string;
    onSolutionChange: (value: string) => void;
    onSubmit: () => void;
    isEvaluating: boolean;
}

export interface FinalResultsProps {
    tasksMap: Record<string, Task>;
    criteriaData: Record<string, Criteria>;
    resultsData: UserResult;
    onSendEmail: () => void;
    isSendingEmail: boolean;
}

export interface LoginFormProps {
    onSubmit: (data: { email: string; name: string }) => void;
    onSkip: () => void;
} 