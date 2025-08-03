import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQItemProps {
  question: string;
  answer: string;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, expanded, onChange }) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      sx={{
        mb: 0,
        borderRadius: 1.5,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '4px 0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon 
            sx={{ 
              color: 'primary.main',
              transition: 'transform 0.3s ease-in-out',
            }} 
          />
        }
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1, sm: 1.25 },
          minHeight: '48px',
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
          '&.Mui-expanded': {
            minHeight: '48px',
            '& .MuiAccordionSummary-expandIconWrapper': {
              transform: 'rotate(180deg)',
            },
          },
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            fontSize: { xs: '0.9rem', sm: '0.95rem' },
            lineHeight: 1.3,
            flexGrow: 1,
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails
        sx={{
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
          pt: 0,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
          }}
        >
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQItem; 