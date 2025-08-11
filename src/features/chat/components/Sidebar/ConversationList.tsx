import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Box,
  Typography
} from '@mui/material';
import { Conversation } from '../../../../hooks/useConversations';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentId,
  onSelect
}) => {
  return (
    <Box sx={{ p: 2, bgcolor: 'white' }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: '#333',
          mb: 1.5,
          fontSize: '0.9rem'
        }}
      >
        Đoạn chat
      </Typography>
      
      <List sx={{ p: 0 }}>
        {conversations.map((conversation) => (
          <ListItem key={conversation.id} disablePadding>
                          <ListItemButton
                selected={currentId === conversation.id}
                onClick={() => onSelect(conversation.id)}
                sx={{
                  px: 1.5,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#F3F4F6',
                    color: '#2563EB',
                    '&:hover': {
                      bgcolor: '#F3F4F6'
                    }
                  },
                  '&:hover': {
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
              <ListItemText
                primary={conversation.title}
                primaryTypographyProps={{
                  component: 'span',
                  noWrap: true,
                  variant: 'body2',
                  sx: {
                    fontWeight: 500,
                    color: currentId === conversation.id ? '#1976D2' : '#333',
                    fontSize: '0.875rem',
                    lineHeight: 1.4
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

      </List>
    </Box>
  );
};
