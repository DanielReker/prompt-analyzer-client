import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Paper, CircularProgress, Typography } from '@mui/material';
import RightSidebar from '../components/RightSidebar';
import FinalResults from '../components/FinalResults';
import { convertArrayToObject } from '../utils';
import type { TaskData, CriteriaData, ResultsData } from '../types';
import { API_BASE } from '../config';

interface ResultsPageProps {
    userId: string;
}

export default function ResultsPage({ userId }: ResultsPageProps) {
    const navigate = useNavigate();

    const tasksQuery = useQuery({
        queryKey: ['tasks', userId],
        queryFn: () => axios.get(`${API_BASE}/daily-tasks`).then((res) => res.data.data),
        enabled: !!userId,
        retry: 3,
        retryDelay: 1000,
    });

    const criteriaQuery = useQuery({
        queryKey: ['criteria'],
        queryFn: () => axios.get(`${API_BASE}/criteria`).then((res) => convertArrayToObject(res.data.data, 'id')),
        enabled: true,
        retry: 3,
        retryDelay: 1000,
    });

    const resultsQuery = useQuery({
        queryKey: ['results', userId],
        queryFn: () => axios.get(`${API_BASE}/users/${userId}/results`).then((res) => res.data),
        enabled: !!userId,
        retry: 3,
        retryDelay: 1000,
    });

    const sendResultsEmail = useMutation({
        mutationFn: () => axios.post(`${API_BASE}/users/${userId}/send-results`),
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

    const handleRestartQuiz = () => {
        navigate('/dashboard');
    };

    // Show loading state
    if (tasksQuery.isLoading || criteriaQuery.isLoading || resultsQuery.isLoading) {
        return (
            <Box sx={{ 
                flex: 1, 
                mr: { xs: 0, md: '300px' }, 
                p: { xs: 2, md: 4 }, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Show error state
    if (tasksQuery.isError || criteriaQuery.isError || resultsQuery.isError) {
        return (
            <Box sx={{ 
                flex: 1, 
                mr: { xs: 0, md: '300px' }, 
                p: { xs: 2, md: 4 }, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Typography variant="h6" color="error">
                    Error loading results. Please try again later.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ 
                flex: 1, 
                mr: { xs: 0, md: '300px' }, 
                p: { xs: 2, md: 4 }, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start' 
            }}>
                <Paper elevation={3} sx={{ 
                    width: '100%', 
                    maxWidth: 700, 
                    p: { xs: 2, md: 4 }, 
                    borderRadius: 4, 
                    boxShadow: 3, 
                    bgcolor: '#fff' 
                }}>
                    <FinalResults 
                        tasksMap={tasksQuery.data ? convertArrayToObject(tasksQuery.data, 'id') as TaskData : {} as TaskData}
                        criteriaData={criteriaQuery.data as CriteriaData || {} as CriteriaData}
                        resultsData={resultsQuery.data as ResultsData}
                        onSendEmail={() => sendResultsEmail.mutate()}
                        isSendingEmail={sendResultsEmail.isPending}
                        onRestartQuiz={handleRestartQuiz}
                        userId={userId}
                    />
                </Paper>
            </Box>
            <RightSidebar />
        </>
    );
} 