import { Box } from '@mui/material';
import { Image } from './types';

interface TaskImageProps {
    image: Image;
}

export default function TaskImage({ image }: TaskImageProps) {
    const imageUrl = image.imageQuestion.formats.thumbnail.url;
    
    // If URL starts with http/https, use it as is (Supabase URLs)
    // Otherwise, prepend the API base URL (legacy local uploads)
    const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `https://prompt-pal-api.onrender.com${imageUrl}`;

    return (
        <Box>
            <img
                src={fullImageUrl}
                alt="Question Image"
                style={{ width: '100%', borderRadius: 8 }}
            />
        </Box>
    );
} 