import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    TextField, 
    Grid, 
    Chip,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CompareIcon from '@mui/icons-material/Compare';
import axios from 'axios';
import { API_BASE } from '../config';

interface ImageTask {
    id: string;
    name: string;
    question: string;
    idealPrompt: string;
    Image: Array<{
        id?: number;
        imageQuestion?: {
            url?: string; 
            formats?: { 
                medium?: { url: string }; 
                small?: { url: string };
                thumbnail?: { url: string };
            }
        };
        url?: string; 
        formats?: { 
            medium?: { url: string }; 
            small?: { url: string };
            thumbnail?: { url: string };
        } 
    }>;
}

interface EvaluationResult {
    analysis?: string;
    score?: number;
    feedback?: string;
    similarityScore?: number;
    criterionResults?: Array<{
        criterionId: string;
        score: number;
        subquestionResults: Array<{
            subquestionId: string;
            score: number;
            feedback: string;
        }>;
    }>;
    totalScore?: number;
    maxPossibleScore?: number;
}

interface CriteriaData {
    [key: string]: {
        id: string;
        name: string;
        subquestions: Array<{
            id: string;
            question: string;
        }>;
    };
}

export default function ImageGenerationTask() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    
    const [task, setTask] = useState<ImageTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [userPrompt, setUserPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [criteriaData, setCriteriaData] = useState<CriteriaData | null>(null);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);
    const MAX_PROMPT_LENGTH = 1000; // OpenAI's maximum prompt length

    useEffect(() => {
        const fetchTaskData = async () => {
            if (!taskId) return;
            
            try {
                setLoading(true);
                
                // Use the new efficient endpoint for single task
                const response = await axios.get(`${API_BASE}/tasks/${taskId}`);
                const taskData = response.data.data;
                
                if (!taskData) {
                    console.error('Task not found');
                    navigate('/image-generation');
                    return;
                }
                
                setTask(taskData);
            } catch (error) {
                console.error('Error fetching task:', error);
                navigate('/image-generation');
            } finally {
                setLoading(false);
            }
        };

        const fetchCriteria = async () => {
            try {
                const response = await axios.get(`${API_BASE}/criteria`);
                const criteriaArray = response.data.data || [];
                const criteriaObj = criteriaArray.reduce((acc: Record<string, { id: string; name: string; subquestions: Array<{ id: string; question: string }> }>, criterion: { id: string; name: string; subquestions: Array<{ id: string; question: string }> }) => {
                    acc[criterion.id] = criterion;
                    return acc;
                }, {});
                setCriteriaData(criteriaObj);
            } catch {
                // Handle errors silently or show user-friendly message
            }
        };

        fetchTaskData();
        fetchCriteria();
    }, [taskId, navigate]);

    const handleGenerateImage = async () => {
        if (!userPrompt.trim()) return;
        
        if (userPrompt.length > MAX_PROMPT_LENGTH) {
            alert(`Prompt is too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.`);
            return;
        }
        
        setIsGenerating(true);
        setGeneratedImageUrl(null);
        setEvaluationResult(null);
        
        try {
            const response = await axios.post(`${API_BASE}/generate-image`, {
                prompt: userPrompt
            });
            
            if (response.data.success) {
                setGeneratedImageUrl(response.data.imageUrl);
                setShowComparison(true);
                
                // Always submit for evaluation after image generation
                if (task) {
                    submitPromptForEvaluation(response.data.imageUrl);
                }
            } else {
                console.error('Image generation failed:', response.data.error);
                alert('Failed to generate image: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const submitPromptForEvaluation = async (imageUrl: string) => {
        if (!task || !imageUrl) {
            return;
        }
        
        try {
            setIsEvaluating(true);
            setEvaluationError(null); // Clear any previous errors
            
            // Get the expected image URL
            const expectedImageUrl = getImageUrl(task.Image);
            if (!expectedImageUrl) {
                setEvaluationError('No reference image found for this task. Please contact support.');
                setIsEvaluating(false);
                return;
            }

            // Call the new image evaluation endpoint
            const response = await axios.post(`${API_BASE}/evaluate-images`, {
                taskId: task.id,
                userImageUrl: imageUrl,
                expectedImageUrl: expectedImageUrl
            });

            if (response.data.success) {
                // Process the evaluation result directly
                const result = response.data.evaluation;
                
                if (result && result.criteria) {
                    // Convert the result format to match the expected format
                    const rawCriterionResults = Object.entries(result.criteria).map(([criterionId, criterionData]) => {
                        const typedCriterionData = criterionData as { subquestions: Record<string, { score: number; feedback: string }> };
                        
                        // Skip if this isn't actually a criterion (e.g., if it's the similarity score)
                        if (!typedCriterionData.subquestions) {
                            return null;
                        }
                        
                        return {
                            criterionId,
                            score: 0, // Will be calculated from subquestions
                            subquestionResults: Object.entries(typedCriterionData.subquestions).map(([subquestionId, subData]) => ({
                                subquestionId,
                                score: Math.max(1, Math.min(subData.score || 1, 5)), // Clamp score to [1, 5]
                                feedback: subData.feedback || 'No feedback provided'
                            }))
                        };
                    });

                    // Filter out null entries and ensure proper typing
                    const criterionResults = rawCriterionResults.filter((result): result is NonNullable<typeof result> => result !== null);

                    // Calculate criterion scores as average of subquestion scores
                    criterionResults.forEach(criterion => {
                        const avgScore = criterion.subquestionResults.reduce((sum, sub) => sum + sub.score, 0) / criterion.subquestionResults.length;
                        criterion.score = avgScore;
                    });

                    const totalScore = criterionResults.reduce((sum, criterion) => sum + criterion.score, 0);
                    const maxPossibleScore = criterionResults.length * 5;
                    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
                    
                    // Try to find similarity score in multiple locations
                    let similarityScore = result.overallSimilarity || 0;
                    
                    // If not found at top level, look in criteria object
                    if (similarityScore === 0 && result.criteria) {
                        // Look for overallSimilarity key in criteria
                        if (result.criteria.overallSimilarity !== undefined) {
                            similarityScore = result.criteria.overallSimilarity;
                        } else {
                            // Search through all criteria keys for a number value that might be similarity
                            for (const [, value] of Object.entries(result.criteria)) {
                                if (typeof value === 'number' && value >= 0 && value <= 100) {
                                    similarityScore = value;
                                    break;
                                }
                            }
                        }
                    }
                    
                    setEvaluationResult({
                        score: percentageScore,
                        totalScore,
                        maxPossibleScore,
                        similarityScore,
                        criterionResults,
                        analysis: `Your generated image scored ${percentageScore}% (${totalScore.toFixed(1)}/${maxPossibleScore} points) based on visual comparison with the expected result`,
                        feedback: criterionResults.map(cr => 
                            cr.subquestionResults?.map(sr => sr.feedback).join(' ')
                        ).join(' ')
                    });
                }
            }
            
        } catch (error) {
            console.error('Error evaluating image:', error);
            
            // Provide specific error messages based on the error type
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    setEvaluationError('Unable to access images for comparison. The reference image may not be publicly accessible.');
                } else if (error.response?.status === 500) {
                    setEvaluationError('Server error occurred during evaluation. Please try again later.');
                } else {
                    setEvaluationError('Network error occurred. Please check your connection and try again.');
                }
            } else {
                setEvaluationError('An unexpected error occurred during evaluation. Please try again.');
            }
        } finally {
            setIsEvaluating(false);
        }
    };

    const getImageUrl = (imageArray: Array<{ 
        id?: number;
        imageQuestion?: {
            url?: string; 
            formats?: { 
                medium?: { url: string }; 
                small?: { url: string };
                thumbnail?: { url: string };
            }
        };
        url?: string; 
        formats?: { 
            medium?: { url: string }; 
            small?: { url: string };
            thumbnail?: { url: string };
        } 
    }>) => {
        if (!imageArray || imageArray.length === 0) {
            return null;
        }
        
        const firstImage = imageArray[0];
        
        let url = firstImage?.imageQuestion?.url || 
                  firstImage?.imageQuestion?.formats?.medium?.url || 
                  firstImage?.imageQuestion?.formats?.small?.url ||
                  firstImage?.imageQuestion?.formats?.thumbnail?.url ||
                  firstImage?.url || 
                  firstImage?.formats?.medium?.url || 
                  firstImage?.formats?.small?.url ||
                  firstImage?.formats?.thumbnail?.url ||
                  undefined;
        
        if (url && !url.startsWith('http')) {
            const baseUrl = API_BASE.replace('/api/analyzer', '');
            url = `${baseUrl}${url}`;
        }
        
        return url;
    };

    if (loading) {
        return (
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!task) {
        return (
            <Box sx={{ 
                flexGrow: 1, 
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Task not found
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/image-generation')}
                        sx={{ mt: 2 }}
                    >
                        Back to Tasks
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 3 },
            minHeight: '100vh',
            bgcolor: '#f8fafc'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/image-generation')}
                    sx={{ borderRadius: 2 }}
                >
                    ← Back to Tasks
                </Button>
                <Chip 
                    label="Image Task"
                    sx={{ 
                        bgcolor: '#2196f3',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                />
                <Chip label="Prompt Analysis" variant="outlined" />
            </Box>

            <Grid container spacing={3}>
                {/* Left Panel - Task Details */}
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <Typography 
                            variant="h5" 
                            fontWeight="bold" 
                            sx={{ 
                                mb: 2, 
                                color: '#1a202c',
                                fontSize: { xs: '1.25rem', md: '1.5rem' }
                            }}
                        >
                            {task.name}
                        </Typography>
                        
                        {/* Task Question */}
                        <Box sx={{ 
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#f0f9ff',
                            border: '1px solid #bae6fd'
                        }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    color: '#0369a1',
                                    fontWeight: 'bold',
                                    mb: 1,
                                    fontSize: { xs: '0.875rem', md: '1rem' }
                                }}
                            >
                                🎯 YOUR GOAL:
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    lineHeight: 1.6,
                                    fontSize: { xs: '0.95rem', md: '1rem' },
                                    color: '#0c4a6e'
                                }}
                            >
                                {task.question}
                            </Typography>
                        </Box>
                        
                        {/* Inspiration Image */}
                        <Box sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid #ff9800',
                            bgcolor: '#fff3e0'
                        }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    p: 1, 
                                    bgcolor: '#ff9800', 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}
                            >
                                🎨 Inspiration Image
                            </Typography>
                            {getImageUrl(task.Image) ? (
                                <img
                                    src={getImageUrl(task.Image) || ''}
                                    alt={task.name}
                                    style={{ 
                                        width: '100%', 
                                        maxHeight: '400px', 
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            ) : (
                                <Box sx={{ 
                                    height: 300, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ff9800'
                                }}>
                                    <Typography>No image available</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Panel - Prompt Input & Results */}
                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{ 
                                mb: 2,
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                color: '#1a202c'
                            }}
                        >
                            <AutoFixHighIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Your Prompt
                        </Typography>
                        <TextField
                            multiline
                            rows={6}
                            fullWidth
                            variant="outlined"
                            placeholder="Write your DALL-E prompt here... Be specific about style, composition, lighting, and details!"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            error={userPrompt.length > MAX_PROMPT_LENGTH}
                            helperText={`${userPrompt.length}/${MAX_PROMPT_LENGTH} characters`}
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.9rem', md: '1rem' }
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleGenerateImage}
                                disabled={!userPrompt.trim() || isGenerating || userPrompt.length > MAX_PROMPT_LENGTH}
                                sx={{ 
                                    borderRadius: 2,
                                    px: 4,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.9rem', md: '1rem' }
                                }}
                            >
                                {isGenerating ? 'Generating...' : 'Generate & Compare'}
                            </Button>
                            <Typography 
                                variant="body2" 
                                color={userPrompt.length > MAX_PROMPT_LENGTH ? "error" : "text.secondary"}
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                            >
                                {userPrompt.length}/{MAX_PROMPT_LENGTH} characters
                            </Typography>
                        </Box>
                        {isGenerating && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress sx={{ borderRadius: 1 }} />
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                        mt: 1,
                                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                                    }}
                                >
                                    Creating your image and comparing it with the expected result...
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Comparison Results */}
                    {showComparison && (
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                    mb: 3,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    color: '#1a202c'
                                }}
                            >
                                <CompareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Image Comparison
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            fontWeight="bold" 
                                            sx={{ 
                                                mb: 1,
                                                fontSize: { xs: '1rem', md: '1.1rem' },
                                                color: '#374151'
                                            }}
                                        >
                                            Your Result
                                        </Typography>
                                        <Box sx={{ 
                                            height: 300, 
                                            bgcolor: '#f5f5f5', 
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px dashed #ddd',
                                            overflow: 'hidden'
                                        }}>
                                            {generatedImageUrl ? (
                                                <img
                                                    src={generatedImageUrl}
                                                    alt="Generated Image"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover' 
                                                    }}
                                                />
                                            ) : (
                                                <Typography color="text.secondary">
                                                    Generated Image Preview
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                mt: 1, 
                                                fontStyle: 'italic',
                                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                                color: '#6b7280',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            "{userPrompt}"
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            fontWeight="bold" 
                                            sx={{ 
                                                mb: 1,
                                                fontSize: { xs: '1rem', md: '1.1rem' },
                                                color: '#374151'
                                            }}
                                        >
                                            Expected Result
                                        </Typography>
                                        <Box sx={{ 
                                            height: 300, 
                                            bgcolor: '#f5f5f5', 
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #4caf50',
                                            overflow: 'hidden'
                                        }}>
                                            {getImageUrl(task.Image) ? (
                                                <img
                                                    src={getImageUrl(task.Image) || ''}
                                                    alt="Expected Result"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover' 
                                                    }}
                                                />
                                            ) : (
                                                <Typography color="text.secondary">
                                                    Expected Image
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            {/* Evaluation Results */}
                            {(isEvaluating || evaluationResult) && (
                                <Box sx={{ mt: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography 
                                        variant="h6" 
                                        fontWeight="bold" 
                                        sx={{ 
                                            mb: 2,
                                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                                            color: '#1a202c'
                                        }}
                                    >
                                        📊 Image Similarity Evaluation
                                    </Typography>
                                    
                                    {isEvaluating ? (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Analyzing how well your generated image matches the expected result...
                                            </Typography>
                                            <LinearProgress sx={{ borderRadius: 1 }} />
                                        </Box>
                                    ) : evaluationError ? (
                                        <Box sx={{ 
                                            p: 2, 
                                            bgcolor: '#fff3e0', 
                                            borderRadius: 2,
                                            border: '1px solid #ff9800'
                                        }}>
                                            <Typography variant="body1" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                ⚠️ Evaluation Error
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {evaluationError}
                                            </Typography>
                                        </Box>
                                    ) : evaluationResult && (
                                        <Box>
                                            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                                                <strong>Analysis:</strong> {evaluationResult.analysis || 'Analysis completed'}
                                            </Typography>
                                            
                                            {/* Score Display */}
                                            {evaluationResult.score !== undefined && evaluationResult.totalScore !== undefined && evaluationResult.maxPossibleScore !== undefined && (
                                                <Box sx={{ mb: 3 }}>
                                                    {/* Criteria-based Score */}
                                                    <Box sx={{ mb: 3 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="h6" fontWeight="bold" color="primary">
                                                                {evaluationResult.score}%
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Criteria Score
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={evaluationResult.score} 
                                                            sx={{ 
                                                                height: 12, 
                                                                borderRadius: 6,
                                                                bgcolor: '#f0f0f0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: evaluationResult.score >= 80 ? '#4caf50' : 
                                                                            evaluationResult.score >= 60 ? '#ff9800' : '#f44336',
                                                                    borderRadius: 6
                                                                }
                                                            }} 
                                                        />
                                                    </Box>

                                                    {/* Image Similarity Score */}
                                                    {evaluationResult.similarityScore !== undefined && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                                <Typography variant="h6" fontWeight="bold" color="secondary">
                                                                    {Math.round(evaluationResult.similarityScore)}%
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Image Similarity
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={evaluationResult.similarityScore} 
                                                                sx={{ 
                                                                    height: 12, 
                                                                    borderRadius: 6,
                                                                    bgcolor: '#f0f0f0',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: evaluationResult.similarityScore >= 80 ? '#2196f3' : 
                                                                                evaluationResult.similarityScore >= 60 ? '#ff9800' : '#f44336',
                                                                        borderRadius: 6
                                                                    }
                                                                }} 
                                                            />
                                                        </Box>
                                                    )}
                                                    
                                                    <Box sx={{ 
                                                        p: 2, 
                                                        bgcolor: '#f8fafc', 
                                                        borderRadius: 2,
                                                        border: '1px solid #e2e8f0',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                            Total Score: {evaluationResult.totalScore} / {evaluationResult.maxPossibleScore} points
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            
                                            {/* Detailed Criteria Breakdown */}
                                            {evaluationResult.criterionResults && evaluationResult.criterionResults.length > 0 && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                                        📋 Detailed Criteria Breakdown:
                                                    </Typography>
                                                    {evaluationResult.criterionResults.map((criterion, index) => (
                                                        <Box key={index} sx={{ 
                                                            mb: 3, 
                                                            p: 2, 
                                                            bgcolor: '#f8fafc', 
                                                            borderRadius: 2,
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight="bold">
                                                                    {criteriaData?.[criterion.criterionId]?.name || `Criterion ${index + 1}`}
                                                                </Typography>
                                                                <Typography variant="h6" fontWeight="bold" color={criterion.score >= 4 ? 'success.main' : criterion.score >= 3 ? 'warning.main' : 'error.main'}>
                                                                    {criterion.score}/5
                                                                </Typography>
                                                            </Box>
                                                            
                                                            {criterion.subquestionResults && criterion.subquestionResults.length > 0 && (
                                                                <Box sx={{ mt: 1 }}>
                                                                    {criterion.subquestionResults.map((subResult, subIndex) => {
                                                                        const subQuestion = criteriaData?.[criterion.criterionId]?.subquestions?.find((sq: { id: string; question: string }) => sq.id === subResult.subquestionId);
                                                                        return (
                                                                            <Box key={subIndex} sx={{ 
                                                                                mb: 1, 
                                                                                p: 1.5, 
                                                                                bgcolor: 'white', 
                                                                                borderRadius: 1,
                                                                                border: '1px solid #e2e8f0'
                                                                            }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                                                        {subQuestion?.question || `Sub-criterion ${subIndex + 1}`}
                                                                                    </Typography>
                                                                                    <Typography variant="body2" fontWeight="bold" color={subResult.score >= 4 ? 'success.main' : subResult.score >= 3 ? 'warning.main' : 'error.main'}>
                                                                                        {subResult.score}/5
                                                                                    </Typography>
                                                                                </Box>
                                                                                {subResult.feedback && (
                                                                                    <Typography variant="body2" sx={{ 
                                                                                        color: '#6b7280',
                                                                                        lineHeight: 1.5,
                                                                                        fontSize: '0.875rem'
                                                                                    }}>
                                                                                        💬 {subResult.feedback}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
} 