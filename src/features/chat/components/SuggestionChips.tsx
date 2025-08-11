import React from 'react';
import { Box, Chip } from '@mui/material';
import { defaultSuggestions } from '../data/suggestion.data';

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  onSelect, 
  visible 
}) => {
  if (!visible) return null;

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'nowrap',
          justifyContent: 'flex-start',
          maxWidth: '100%',
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}
      >
        {defaultSuggestions.map((suggestion, index) => (
          <Chip
            key={suggestion.id}
            label={suggestion.text}
            variant="outlined"
            size="medium"
            onClick={() => onSelect(suggestion.text)}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              bgcolor: index === 0 ? '#DBEAFE' : '#F3F4F6',
              color: index === 0 ? '#1E40AF' : '#374151',
              border: 'none',
              '&:hover': {
                bgcolor: '#DBEAFE',
                color: '#1E40AF'
              },
              '&:active': {
                bgcolor: '#BFDBFE',
                color: '#1E40AF'
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
}; 