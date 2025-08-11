import React from 'react';
import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface NewConversationBtnProps {
  onClick: () => void;
}

export const NewConversationBtn: React.FC<NewConversationBtnProps> = ({ onClick }) => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'white'
      }}
    >
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          bgcolor: '#EFF6FF',
          color: '#2563EB',
          '&:hover': {
            bgcolor: '#DBEAFE',
          },
          boxShadow: 'none',
          border: 'none'
        }}
      >
        Cuộc trò chuyện mới
      </Button>
    </Box>
  );
}; 