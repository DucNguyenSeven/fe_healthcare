"use client";

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import FAQItem from '../../../components/common/FAQItem';
import { faqData, FAQ } from '../data/faq.data';

interface FAQSectionProps {
  id?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({ id = 'faq' }) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id={id}
      sx={{
        backgroundColor: 'background.default',
        scrollMarginTop: { xs: '56px', sm: '64px' },
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 6 },
        overflow: 'visible',
        position: 'relative',
        scrollSnapAlign: 'start',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 2, md: 2.5 },
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mt: 0,
            }}
          >
            Câu hỏi thường gặp
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              lineHeight: 1.4,
              mb: 1.5,
            }}
          >
            Tìm hiểu thêm về Healthcare+ qua những câu hỏi phổ biến
          </Typography>

          {/* Gradient Underline */}
          <Box
            sx={{
              width: '80px',
              height: '3px',
              mx: 'auto',
              background: 'linear-gradient(90deg, #D0006F 0%, #4169E1 100%)',
              borderRadius: '2px',
            }}
          />
        </Box>

        {/* FAQ Accordion */}
        <Box
          sx={{
            maxWidth: { xs: '100%', sm: '700px', md: '800px' },
            mx: 'auto',
          }}
        >
          <Stack spacing={1.5}>
            {faqData.map((faq: FAQ) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                expanded={expanded === `panel${faq.id}`}
                onChange={handleChange(`panel${faq.id}`)}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection; 