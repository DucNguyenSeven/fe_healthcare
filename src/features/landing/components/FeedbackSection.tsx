'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Avatar,
  Rating,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackCard from '../../../components/common/FeedbackCard';
import { feedbackData, Feedback } from '../../../data/global/feedback.data';
import MobileSlider from './MobileSlider';

interface FeedbackSectionProps {
  id?: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ id = 'reviews' }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const renderFeedbackCard = (feedback: Feedback) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        minHeight: '280px',
        maxHeight: '320px',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ 
        p: 3, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        '&:last-child': {
          pb: 3,
        },
      }}>
        <Stack spacing={2} sx={{ height: '100%', width: '100%' }}>
          {/* Header with Avatar, Name, Title, and Rating */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Avatar
              src={feedback.avatar || undefined}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1.5rem',
              }}
            >
              {feedback.avatar ? null : <PersonIcon />}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                {feedback.title}
              </Typography>
              
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                {feedback.name}
              </Typography>
              
              <Rating
                value={feedback.rating}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#ffc107',
                  },
                  '& .MuiRating-iconEmpty': {
                    color: '#e0e0e0',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Feedback Content */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              flexGrow: 1,
              fontSize: '0.85rem',
              fontStyle: 'italic',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 6,
              WebkitBoxOrient: 'vertical',
              textAlign: 'justify',
            }}
          >
            &quot;{feedback.feedback}&quot;
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      id={id}
      sx={{
        backgroundColor: 'background.default',
        scrollMarginTop: { xs: '56px', sm: '64px' },
        pt: { xs: 4, md: 5 },
        pb: { xs: 4, md: 5 },
        overflow: 'visible',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              mb: 1.5,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mt: 0,
            }}
          >
            Phản hồi từ bệnh nhân
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.4,
            }}
          >
            Hàng nghìn bệnh nhân đã tin tưởng và hài lòng với dịch vụ chăm sóc sức khỏe của chúng tôi
          </Typography>
        </Box>

        {/* Feedback Grid/Slider */}
        {isMdUp ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                md: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: { md: 3, lg: 3 },
              alignItems: 'stretch',
              justifyContent: 'center',
              maxWidth: '100%',
              mb: { xs: 3, md: 4 },
            }}
          >
            {feedbackData.map((feedback: Feedback) => (
              <Box
                key={feedback.id}
                sx={{
                  display: 'flex',
                  height: '100%',
                  minHeight: '280px',
                  maxHeight: '320px',
                }}
              >
                <FeedbackCard
                  name={feedback.name}
                  title={feedback.title}
                  avatar={feedback.avatar || undefined}
                  feedback={feedback.feedback}
                  rating={feedback.rating}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <MobileSlider 
            items={feedbackData} 
            renderItem={renderFeedbackCard}
            ariaLabel="Feedback carousel"
          />
        )}
      </Container>
    </Box>
  );
};

export default FeedbackSection; 