import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
    createTheme, 
    ThemeProvider, 
    CssBaseline, 
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import SecurityHeaders from './components/SecurityHeaders';
import { StreakProvider } from './contexts/StreakContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage';
import ImageGenerationDashboard from './pages/ImageGenerationDashboard';
import ImageGenerationTask from './pages/ImageGenerationTask';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CalendarPage from './pages/CalendarPage.tsx';
import TaskPage from './pages/TaskPage';
import ProfilePage from './pages/ProfilePage';

// Theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#ff9800',
        },
        background: {
            default: '#f4f6fa',
        },
    },
    shape: { borderRadius: 12 },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: unknown) => {
                // Don't retry on 401/403 errors (authentication issues)
                if (typeof error === 'object' && 
                    error !== null && 
                    'response' in error) {
                    const axiosError = error as { response?: { status?: number } };
                    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                        return false;
                    }
                }
                return failureCount < 3;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <SecurityHeaders />
            <QueryClientProvider client={queryClient}>
                <StreakProvider>
                    <Router>
                        <Routes>
                            <Route 
                                path="/" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return <LoginPage onUserLogin={props.onUserLogin} />;
                                            }
                                            return null;
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route 
                                path="/login" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return <LoginPage onUserLogin={props.onUserLogin} />;
                                            }
                                            return null;
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route 
                                path="/dashboard" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <DashboardPage 
                                                    userId={props.userId} 
                                                    name={props.name} 
                                                />
                                            );
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route 
                                path="/results" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <ResultsPage 
                                                    userId={props.userId} 
                                                />
                                            );
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route 
                                path="/image-generation" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <ImageGenerationDashboard />
                                            );
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route 
                                path="/image-generation/task/:taskId" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <ImageGenerationTask />
                                            );
                                        }}
                                    </Layout>
                                } 
                            />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route 
                                path="/calendar" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <CalendarPage 
                                                    userId={props.userId}
                                                />
                                            );
                                        }}
                                    </Layout>
                                }
                            />
                            <Route 
                                path="/task/:taskId" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <TaskPage 
                                                    userId={props.userId} 
                                                    name={props.name} 
                                                />
                                            );
                                        }}
                                    </Layout>
                                }
                            />
                            <Route 
                                path="/profile" 
                                element={
                                    <Layout>
                                        {(props) => {
                                            if ('onUserLogin' in props) {
                                                return null; // This shouldn't happen due to redirects
                                            }
                                            return (
                                                <ProfilePage 
                                                    userId={props.userId}
                                                    onLogout={props.onLogout}
                                                />
                                            );
                                        }}
                                    </Layout>
                                }
                            />
                        </Routes>
                    </Router>
                </StreakProvider>
            </QueryClientProvider>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </ThemeProvider>
    );
}

export default App;