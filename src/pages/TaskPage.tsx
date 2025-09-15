import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Paper } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import RightSidebar from '../components/RightSidebar';
import TaskImage from '../components/TaskImage';
import TaskHint from '../components/TaskHint';
import TaskResults from '../components/TaskResults';
import TaskSubmission from '../components/TaskSubmission';
import { convertArrayToObject } from '../utils';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { CriteriaData } from '../types';
import type { Image } from '../components/types';
import { API_BASE } from '../config';
import { useStreak } from '../contexts/StreakContext';
import PromptPal from '../utils/Images/prompt-pal-logo.png'

interface CriterionResult {
    criterionId: string;
    score: number;
    subquestionResults: Array<{
        subquestionId: string;
        score: number;
        feedback: string;
    }>;
}

interface TaskResult {
    taskId: string;
    submissionId: string;
    submittedAt: string;
    score: number;
    criterionResults: CriterionResult[];
}

interface TaskPageProps {
    userId: string;
    name: string;
}

export default function TaskPage({ userId }: TaskPageProps) {
    const { taskId } = useParams<{ taskId: string }>();
    const [submissionTimestamp, setSubmissionTimestamp] = useState<number | null>(null);
    const [userSolution, setUserSolution] = useState('');
    const [evaluatingTaskId, setEvaluatingTaskId] = useState<string | null>(null);
    const [taskAttempts, setTaskAttempts] = useState<Record<string, number>>({});
    const [taskScores, setTaskScores] = useState<Record<string, number[]>>({});
    const [showHint, setShowHint] = useState<Record<string, boolean>>({});
    const [showResults, setShowResults] = useState<Record<string, boolean>>({});
    const previousTaskResultsRef = useRef<Record<string, TaskResult>>({});
    const { refreshStreakData } = useStreak();

    const taskQuery = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => axios.get(`${API_BASE}/tasks/${taskId}`).then((res) => res.data.data),
        enabled: !!taskId,
    });

    const criteriaQuery = useQuery({
        queryKey: ['criteria'],
        queryFn: () => axios.get(`${API_BASE}/criteria`).then((res) => convertArrayToObject(res.data.data, 'id')),
        enabled: true,
    });

    const submitSolution = useMutation({
        mutationFn: ({ taskId, solutionPrompt }: { taskId: string; solutionPrompt: string }) =>
            axios.post(`${API_BASE}/users/${userId}/submit`, { taskId, solutionPrompt }),
        onSuccess: () => {
            console.log("Solution submitted successfully. Waiting for results...");
        },
        onError: (error: unknown) => {
            console.error('Submission failed:', error);
            setEvaluatingTaskId(null);
            setSubmissionTimestamp(null);
            
            let errorMessage = 'Failed to submit your solution. Please try again.';
            
            if (typeof error === 'object' && error && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: { message?: string }; message?: string } } };
                if (axiosError.response?.data?.error?.message) {
                    errorMessage = axiosError.response.data.error.message;
                } else if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        },
    });

    const resultsQuery = useQuery({
        queryKey: ['results', userId, taskId],
        queryFn: () => axios.get(`${API_BASE}/users/${userId}/tasks/${taskId}/results`).then((res) => res.data),
        enabled: !!userId && !!taskId && !!evaluatingTaskId && !!submissionTimestamp,
        refetchInterval: () => (evaluatingTaskId && submissionTimestamp) ? 2000 : false,
        refetchIntervalInBackground: true,
    });

    const sendResultsEmail = useMutation({
        mutationFn: () => axios.post(`${API_BASE}/users/${userId}/tasks/${taskId}/send-results`),
        onSuccess: () => {
            toast.success('Results have been sent to your email successfully! 🎉', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                style: {
                    fontSize: '1.1em',
                    fontWeight: 500,
                },
            });
        },
        onError: (error: Error) => {
            console.error("Failed to send results email:", error.message);
            toast.error('Failed to send email. Please try again.');
        }
    });

    useEffect(() => {
        if (!evaluatingTaskId || !submissionTimestamp || !resultsQuery.data) {
            console.log('Missing requirements for result processing:', {
                evaluatingTaskId: !!evaluatingTaskId,
                submissionTimestamp: !!submissionTimestamp,
                resultsData: !!resultsQuery.data
            });
            return;
        }
      
        const newResult = resultsQuery.data.taskResults.find(
            (r: TaskResult) => r.taskId === evaluatingTaskId
        );
        const oldResult = previousTaskResultsRef.current[evaluatingTaskId];

        if (!newResult || !Array.isArray(newResult.criterionResults) || newResult.criterionResults.length === 0) {
            console.log(`Waiting for complete results for ${evaluatingTaskId}…`);
            return;
        }

        const resultTimestamp = new Date(newResult.submittedAt).getTime();
        const submissionTime = submissionTimestamp;
        
        if (resultTimestamp < (submissionTime - 1000)) {
            console.log(`Result is from old submission. Result time: ${new Date(resultTimestamp).toISOString()}, Current submission time: ${new Date(submissionTime).toISOString()}`);
            return;
        }

        const hasIncompleteResults = newResult.criterionResults.some(
            (criterion: CriterionResult) => !Array.isArray(criterion.subquestionResults) || criterion.subquestionResults.length === 0
        );

        if (hasIncompleteResults) {
            console.log(`Waiting for complete criterion results for ${evaluatingTaskId}…`);
            return;
        }

        if (oldResult && JSON.stringify(newResult) === JSON.stringify(oldResult)) {
            console.log(`No new results for ${evaluatingTaskId}…`);
            return;
        }
        
        console.log(`Complete results received for task ${evaluatingTaskId} from current submission. Processing score.`);

        const totalScore = newResult.criterionResults.reduce(
            (sum: number, criterion: CriterionResult) => sum + criterion.score, 0
        );
        const maxPossibleScore = newResult.criterionResults.length * 5;
        const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
        
        setTaskAttempts(prev => ({
            ...prev,
            [evaluatingTaskId]: (prev[evaluatingTaskId] || 0) + 1
        }));
        
        setTaskScores(prev => ({
            ...prev,
            [evaluatingTaskId]: [...(prev[evaluatingTaskId] || []), percentageScore]
        }));
        
        setShowResults(prev => ({
            ...prev,
            [evaluatingTaskId]: true
        }));

        // Refresh streak data since user completed a task
        console.log('Task completed successfully, refreshing streak data...');
        refreshStreakData();

        setEvaluatingTaskId(null);
        setSubmissionTimestamp(null);
        previousTaskResultsRef.current[evaluatingTaskId] = newResult;
    }, [resultsQuery.data, evaluatingTaskId, submissionTimestamp, refreshStreakData]);

    const handleSolutionSubmit = () => {
        if (!taskId || !userSolution || submitSolution.isPending || !!evaluatingTaskId) {
            return;
        }
        
        console.log('Submitting solution for task:', taskId, 'Solution:', userSolution);
        
        const timestamp = Date.now();
        setSubmissionTimestamp(timestamp);
        setEvaluatingTaskId(taskId);
        
        console.log('Setting submission timestamp:', new Date(timestamp).toISOString());
        
        previousTaskResultsRef.current[taskId] = resultsQuery.data?.taskResults.find(
            (r: TaskResult) => r.taskId === taskId
        );
        
        submitSolution.mutate({ taskId, solutionPrompt: userSolution });
    };

    const task = taskQuery.data;
    const currentTaskResult = resultsQuery.data?.taskResults?.find(
        (result: TaskResult) => result.taskId === taskId
    );
    const hasResults = !!currentTaskResult && currentTaskResult.criterionResults?.length > 0;
    const shouldShowResults = hasResults && showResults[taskId || ''];
    const currentAttempts = taskAttempts[taskId || ''] || 0;
    const currentScores = taskScores[taskId || ''] || [];
    const canShowHint = currentAttempts >= 2 && currentScores.filter(score => score <= 20).length >= 2;

    if (taskQuery.isLoading || criteriaQuery.isLoading) {
        return (
            <>
                <Box className="dashboard-loading-content">
                    <Box className="dashboard-loading-header">
                        <EmojiEventsIcon className="dashboard-loading-icon" />
                        <img src={PromptPal} alt="Prompt Pal Logo" style={{ height: 24, marginLeft: 8 }} />
                    </Box>
                    
                    <Box className="dashboard-loading-container">
                        <EmojiEventsIcon className="dashboard-loading-main-icon" />
                        <Typography variant="h5" className="dashboard-loading-main-title">
                            Loading Task...
                        </Typography>
                        <Typography className="dashboard-loading-subtitle">
                            Getting your task ready!
                        </Typography>
                        <Box className="dashboard-loading-progress-container">
                            <Box className="dashboard-loading-progress-bar" />
                        </Box>
                    </Box>
                </Box>
                <RightSidebar />
            </>
        );
    }

    if (taskQuery.isError) {
        return (
            <>
                <Box className="dashboard-error-content">
                    <Paper elevation={3} className="dashboard-error-paper">
                        <Typography variant="h6" className="dashboard-error-title">
                            Failed to Load Task
                        </Typography>
                        <Typography className="dashboard-error-subtitle">
                            We couldn't load your task. Please try refreshing the page.
                        </Typography>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="dashboard-error-button"
                        >
                            Refresh Page
                        </button>
                    </Paper>
                </Box>
                <RightSidebar />
            </>
        );
    }

    if (!task) {
        return (
            <Box className="dashboard-no-tasks">
                <Typography className="dashboard-no-tasks-text">Task not found</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box className="dashboard-main-content">
                <Box className="dashboard-header">
                    <EmojiEventsIcon className="dashboard-header-icon" />
                    <img src={PromptPal} alt="Prompt Pal Logo" style={{ height: 24, marginLeft: 8 }} />
                </Box>
                <Typography className="dashboard-motivational-message">
                    Ready for today's challenge? Let's get creative!
                </Typography>
                <Box className="dashboard-decorative-icon-container">
                    <EmojiEventsIcon className="dashboard-decorative-icon" />
                </Box>
                <Paper elevation={3} className="dashboard-task-paper task-content">
                    <Typography variant="h6" className="dashboard-task-title">
                        {task.name}
                    </Typography>
                    <Typography component="p" className="dashboard-task-question">
                        {task.question}
                    </Typography>
                    {task.Image?.length > 0 && (
                        <Box className="dashboard-task-images">
                            {task.Image.map((img: Image, idx: number) => (
                                <Box key={idx} className="dashboard-task-image-container">
                                    <TaskImage image={img} />
                                </Box>
                            ))}
                        </Box>
                    )}
                    {canShowHint && (
                        <TaskHint 
                            task={task}
                            showHint={showHint[task.id]}
                            onToggleHint={() => setShowHint(prev => ({
                                ...prev,
                                [task.id]: !prev[task.id]
                            }))}
                        />
                    )}
                    <TaskSubmission 
                        userSolution={userSolution}
                        onSolutionChange={setUserSolution}
                        onSubmit={handleSolutionSubmit}
                        isEvaluating={!!evaluatingTaskId && !!submissionTimestamp}
                    />
                    {shouldShowResults && (
                        <TaskResults 
                            taskResult={currentTaskResult}
                            criteriaData={criteriaQuery.data as CriteriaData || {}}
                            currentAttempts={currentAttempts}
                            onSendEmail={() => sendResultsEmail.mutate()}
                            isSendingEmail={sendResultsEmail.isPending}
                            userId={userId}
                        />
                    )}
                </Paper>
            </Box>
            <RightSidebar />
        </>
    );
} 