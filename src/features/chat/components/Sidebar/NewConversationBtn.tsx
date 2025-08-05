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
        p: 1.5,
        pt: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        bgcolor: 'grey.50',
        zIndex: 1
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onClick}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'medium'
        }}
      >
        Cuộc trò chuyện mới
      </Button>
    </Box>
  );
}; 