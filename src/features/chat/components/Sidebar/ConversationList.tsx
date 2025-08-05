import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Box,
  Typography
} from '@mui/material';

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
}

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
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <List sx={{ p: 0, bgcolor: 'grey.50' }}>
      {conversations.map((conversation) => (
        <ListItem key={conversation.id} disablePadding>
          <ListItemButton
            selected={currentId === conversation.id}
            onClick={() => onSelect(conversation.id)}
            sx={{
              px: 1.5,
              py: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.main'
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <ListItemText
                primary={conversation.title}
                primaryTypographyProps={{
                  component: 'span',
                  noWrap: true,
                  variant: 'subtitle1',
                  sx: {
                    fontWeight: 600,
                    color: currentId === conversation.id ? 'primary.contrastText' : 'text.primary'
                  }
                }}
              />
              {conversation.lastMessage && (
                <ListItemText
                  primary={conversation.lastMessage}
                  primaryTypographyProps={{
                    component: 'span',
                    noWrap: true,
                    variant: 'body2',
                    sx: {
                      color: currentId === conversation.id ? 'primary.contrastText' : 'text.secondary',
                      lineHeight: 1.2
                    }
                  }}
                />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: currentId === conversation.id ? 'primary.contrastText' : 'text.disabled',
                  fontSize: '0.7rem',
                  mt: 0.5
                }}
              >
                {formatDate(conversation.updatedAt)}
              </Typography>
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};
