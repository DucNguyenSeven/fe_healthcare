import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import FeedbackCard from '../../../components/common/FeedbackCard';
import { feedbackData, Feedback } from '../../../data/global/feedback.data';

interface FeedbackSectionProps {
  id?: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ id = 'reviews' }) => {
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

        {/* Feedback Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 2.5, sm: 3, md: 3 },
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
      </Container>
    </Box>
  );
};

export default FeedbackSection; 