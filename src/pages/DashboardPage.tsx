import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Paper } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import RightSidebar from '../components/RightSidebar';
import TaskImage from '../components/TaskImage';
import TaskHint from '../components/TaskHint';
import TaskResults from '../components/TaskResults';
import TaskSubmission from '../components/TaskSubmission';
import { convertArrayToObject } from '../utils';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { CriteriaData } from '../types';
import type { Image } from '../components/types';
import './DashboardPage.css';
import { API_BASE } from '../config';
import { useStreak } from '../contexts/StreakContext';
import PromptPal from '../../src/utils/Images/prompt-pal-logo.png'

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
    submittedAt: string; // This should be ISO string from backend
    score: number;
    criterionResults: CriterionResult[];
}

interface DashboardPageProps {
    userId: string;
    name: string;
}

export default function DashboardPage({ userId, name }: DashboardPageProps) {
    const navigate = useNavigate();
    const [submissionTimestamp, setSubmissionTimestamp] = useState<number | null>(null);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [userSolutions, setUserSolutions] = useState<Record<string, string>>({});
    const [evaluatingTaskId, setEvaluatingTaskId] = useState<string | null>(null);
    const [taskAttempts, setTaskAttempts] = useState<Record<string, number>>({});
    const [taskScores, setTaskScores] = useState<Record<string, number[]>>({});
    const [showHint, setShowHint] = useState<Record<string, boolean>>({});
    const [showResults, setShowResults] = useState<Record<string, boolean>>({});
    const previousTaskResultsRef = useRef<Record<string, TaskResult>>({});
    const [runTutorial, setRunTutorial] = useState(false);
    const { refreshStreakData } = useStreak();

    const steps: Step[] = [
        {
            target: 'body',
            content: 'Welcome to Prompt Pal! Let\'s take a quick tour of how to use this platform.',
            placement: 'center' as const,
            disableBeacon: true,
        },
        {
            target: '.task-content',
            content: 'Here you\'ll see the task description and any associated images. Read them carefully!',
            placement: 'bottom' as const,
        },
        {
            target: '.solution-input',
            content: 'This is where you\'ll write your prompt solution. Be as detailed and specific as possible!',
            placement: 'top' as const,
        },
        {
            target: '.submit-button',
            content: 'Click here to submit your solution and get feedback.',
            placement: 'top' as const,
        },
        {
            target: 'body',
            content: 'After submission, you\'ll see detailed feedback and scores here. Your performance will be evaluated based on multiple criteria.',
            placement: 'center' as const,
            disableBeacon: true,
        },
        {
            target: 'body',
            content: 'If you\'re struggling, hints will become available after multiple attempts. Don\'t worry if you don\'t get it right the first time!',
            placement: 'center' as const,
            disableBeacon: true,
        }
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setRunTutorial(false);
        }
    };

    const tasksQuery = useQuery({
        queryKey: ['tasks', userId],
        queryFn: () => axios.get(`${API_BASE}/daily-tasks`).then((res) => {
            console.log('Tasks loaded:', res.data.data);
            return res.data.data;
        }),
        enabled: !!userId,
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
        queryKey: ['results', userId],
        queryFn: () => axios.get(`${API_BASE}/users/${userId}/results`).then((res) => res.data),
        enabled: !!userId && !!evaluatingTaskId && !!submissionTimestamp,
        refetchInterval: () => (evaluatingTaskId && submissionTimestamp) ? 2000 : false,
        refetchIntervalInBackground: true,
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

        // Check if we have a valid result with actual criterion results
        if (!newResult || !Array.isArray(newResult.criterionResults) || newResult.criterionResults.length === 0) {
            console.log(`Waiting for complete results for ${evaluatingTaskId}…`);
            return;
        }

        // Check if result is from current submission using timestamp
        const resultTimestamp = new Date(newResult.submittedAt).getTime();
        const submissionTime = submissionTimestamp;
        
        console.log('Timestamp comparison:', {
            resultTimestamp: new Date(resultTimestamp).toISOString(),
            submissionTimestamp: new Date(submissionTime).toISOString(),
            isFromCurrentSubmission: resultTimestamp >= submissionTime
        });

        // Only process if result is from current submission (within 1 second tolerance for server delays)
        if (resultTimestamp < (submissionTime - 1000)) {
            console.log(`Result is from old submission. Result time: ${new Date(resultTimestamp).toISOString()}, Current submission time: ${new Date(submissionTime).toISOString()}`);
            return;
        }

        // Check if all criterion results have subquestion results
        const hasIncompleteResults = newResult.criterionResults.some(
            (criterion: CriterionResult) => !Array.isArray(criterion.subquestionResults) || criterion.subquestionResults.length === 0
        );

        if (hasIncompleteResults) {
            console.log(`Waiting for complete criterion results for ${evaluatingTaskId}…`);
            return;
        }

        // Check if the result is the same as the previous one
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

        
        console.log('Task completed successfully, refreshing streak data...');
        refreshStreakData();

        
        setEvaluatingTaskId(null);
        setSubmissionTimestamp(null);
        previousTaskResultsRef.current[evaluatingTaskId] = newResult;
    }, [resultsQuery.data, evaluatingTaskId, submissionTimestamp, refreshStreakData]);


    useEffect(() => {
        if (userId && !name) {
            axios.get(`${API_BASE}/users/${userId}`)
                .then(() => {
                    // Handle name update if needed
                });
        }
    }, [userId, name]);

    // Check if all tasks are completed and redirect to results
    useEffect(() => {
        console.log('Current task index:', currentTaskIndex);
        console.log('Tasks data:', tasksQuery.data);
        if (tasksQuery.data && currentTaskIndex >= tasksQuery.data.length) {
            console.log('No more tasks, redirecting to results');
            navigate('/results');
        }
    }, [currentTaskIndex, tasksQuery.data, navigate]);

    // Start tutorial for new users
    useEffect(() => {
        setRunTutorial(true);
    }, []);

    const handleSolutionSubmit = () => {
        if (!task || !userSolution || submitSolution.isPending || !!evaluatingTaskId) {
            return;
        }
        
        console.log('Submitting solution for task:', task.id, 'Solution:', userSolution);
        
        // NEW: Set timestamp when submission starts
        const timestamp = Date.now();
        setSubmissionTimestamp(timestamp);
        setEvaluatingTaskId(task.id);
        
        console.log('Setting submission timestamp:', new Date(timestamp).toISOString());
        
        previousTaskResultsRef.current[task.id] = resultsQuery.data?.taskResults.find(
            (r: TaskResult) => r.taskId === task.id
        );
        
        submitSolution.mutate({ taskId: task.id, solutionPrompt: userSolution });
    };


    const task = tasksQuery.data?.[currentTaskIndex];
    const userSolution = userSolutions[task?.id] || '';
    const currentTaskResult = resultsQuery.data?.taskResults?.find(
        (result: TaskResult) => result.taskId === task?.id
    );
    const hasResults = !!currentTaskResult && currentTaskResult.criterionResults?.length > 0;
    const shouldShowResults = hasResults && showResults[task?.id];
    const currentAttempts = taskAttempts[task?.id] || 0;
    const currentScores = taskScores[task?.id] || [];
    const canShowHint = currentAttempts >= 2 && currentScores.filter(score => score <= 20).length >= 2;

    // Show loading with proper layout instead of blank page
    if (tasksQuery.isLoading || criteriaQuery.isLoading) {
        return (
            <>
                <Box className="dashboard-loading-content">
                    {/* Header Bar */}
                    <Box className="dashboard-loading-header">
                        <EmojiEventsIcon className="dashboard-loading-icon" />
                        <img src={PromptPal} alt="Prompt Pal Logo" style={{ height: 36, marginLeft: 8 }} />
                    </Box>
                    
                    {/* Loading Content */}
                    <Box className="dashboard-loading-container">
                        <EmojiEventsIcon className="dashboard-loading-main-icon" />
                        <Typography variant="h5" className="dashboard-loading-main-title">
                            Preparing Your Challenge...
                        </Typography>
                        <Typography className="dashboard-loading-subtitle">
                            Loading your personalized tasks and getting everything ready for you!
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

    // Show error state if tasks failed to load
    if (tasksQuery.isError) {
        return (
            <>
                <Box className="dashboard-error-content">
                    <Paper elevation={3} className="dashboard-error-paper">
                        <Typography variant="h6" className="dashboard-error-title">
                            Failed to Load Tasks
                        </Typography>
                        <Typography className="dashboard-error-subtitle">
                            We couldn't load your tasks. Please try refreshing the page.
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

    // If no tasks available but loaded successfully
    if (!task) {
        return (
            <Box className="dashboard-no-tasks">
                <Typography className="dashboard-no-tasks-text">No tasks available</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box className="dashboard-main-content">
                {/* Header Bar */}
                <Box className="dashboard-header">
                    <EmojiEventsIcon className="dashboard-header-icon" />
                    <img src={PromptPal} alt="Prompt Pal Logo" style={{ height: 32, marginLeft: 8 }} />
                </Box>
                {/* Motivational Message */}
                <Typography className="dashboard-motivational-message">
                    Ready for today's challenge? Let's get creative!
                </Typography>
                {/* Decorative Icon */}
                <Box className="dashboard-decorative-icon-container">
                    <EmojiEventsIcon className="dashboard-decorative-icon" />
                </Box>
                <Paper elevation={3} className="dashboard-task-paper task-content">
                    <Typography variant="h6" className="dashboard-task-title">
                        Task {currentTaskIndex + 1}: {task?.name}
                    </Typography>
                    <Typography component="p" className="dashboard-task-question">
                        {task?.question}
                    </Typography>
                    {task?.Image?.length > 0 && (
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
                            showHint={showHint[task?.id]}
                            onToggleHint={() => setShowHint(prev => ({
                                ...prev,
                                [task?.id]: !prev[task?.id]
                            }))}
                        />
                    )}
                    <TaskSubmission 
                        userSolution={userSolution}
                        onSolutionChange={(value) => setUserSolutions(prev => ({ ...prev, [task?.id]: value }))}
                        onSubmit={handleSolutionSubmit}
                        isEvaluating={!!evaluatingTaskId && !!submissionTimestamp}
                    />
                    {shouldShowResults && (
                        <TaskResults 
                            taskResult={currentTaskResult}
                            criteriaData={criteriaQuery.data as CriteriaData || {}}
                            currentAttempts={currentAttempts}
                            onNextTask={() => setCurrentTaskIndex(prev => prev + 1)}
                            userId={userId}
                        />
                    )}
                </Paper>
            </Box>
            <RightSidebar />
            <Joyride
                steps={steps}
                run={runTutorial}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        primaryColor: '#ff9800',
                        zIndex: 10000,
                        backgroundColor: '#fff',
                        textColor: '#333',
                        arrowColor: '#fff',
                        overlayColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                        maxWidth: 420,
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        padding: '28px 32px',
                        fontSize: '1.05rem',
                        boxShadow: '0 8px 32px rgba(255, 152, 0, 0.18), 0 2px 12px rgba(0,0,0,0.10)',
                        border: '3px solid #ffb300',
                        position: 'relative',
                        outline: 'none',
                        transition: 'box-shadow 0.2s',
                    },
                    tooltipTitle: {
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        marginBottom: 14,
                        color: '#ff9800',
                    },
                    tooltipContent: {
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                        color: '#333',
                    },
                    buttonNext: {
                        backgroundColor: '#ff9800',
                        color: '#fff',
                        fontSize: '1rem',
                        padding: '10px 28px',
                        borderRadius: 8,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.18)',
                        border: 'none',
                        marginLeft: 8,
                        transition: 'background 0.2s',
                    },
                    buttonBack: {
                        color: '#ff9800',
                        background: 'none',
                        fontWeight: 500,
                        marginRight: 8,
                        fontSize: '1rem',
                        textTransform: 'none',
                        border: 'none',
                    },
                    buttonSkip: {
                        color: '#666',
                        background: 'none',
                        fontSize: '1rem',
                        textTransform: 'none',
                        border: 'none',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    spotlight: {
                        backgroundColor: 'transparent',
                    },
                }}
            />
        </>
    );
} 