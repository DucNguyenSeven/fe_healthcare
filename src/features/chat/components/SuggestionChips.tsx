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
    <Box
      sx={{
        p: 1,
        display: 'flex',
        gap: 0.5,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%'
      }}
    >
      {defaultSuggestions.map((suggestion) => (
        <Chip
          key={suggestion.id}
          label={suggestion.text}
          variant="outlined"
          size="small"
          onClick={() => onSelect(suggestion.text)}
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 9999,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            fontSize: '0.7rem',
            maxWidth: '100%',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }
          }}
        />
      ))}
    </Box>
  );
}; 