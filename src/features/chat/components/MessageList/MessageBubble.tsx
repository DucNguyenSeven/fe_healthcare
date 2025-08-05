import React from 'react';
import { Box, Typography, Avatar, Paper, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { ChatMessage } from '../../../../hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 1.5
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 0.75,
          maxWidth: '75%'
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'grey.300',
            color: isUser ? 'white' : 'grey.700',
            width: 28,
            height: 28,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {isUser ? 'U' : 'AI'}
        </Avatar>
        
        <Paper
          sx={{
            maxWidth: '80%',
            p: 2,
            borderRadius: 4,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? '#fff' : 'text.primary',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8,
              [isUser ? 'right' : 'left']: -6,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '6px 6px 6px 0',
              borderColor: isUser 
                ? 'transparent transparent transparent primary.main'
                : 'transparent grey.100 transparent transparent',
              transform: isUser ? 'rotate(0deg)' : 'rotate(180deg)'
            }
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              a: props => <Link {...props} target="_blank" rel="noopener" sx={{ color: isUser ? 'inherit' : 'primary.main' }} />,
              ul: ({...props}) => <Box component="ul" sx={{pl: 3, mt: 0}} {...props} />,
              li: ({...props}) => <Box component="li" sx={{py: 0.25}} {...props} />,
              h1: props => <Typography variant="h6" gutterBottom sx={{ color: 'inherit' }} {...props} />,
              h2: props => <Typography variant="subtitle1" gutterBottom sx={{ color: 'inherit' }} {...props} />,
              h3: props => <Typography variant="subtitle2" gutterBottom sx={{ color: 'inherit' }} {...props} />,
              h4: props => <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />,
              h5: props => <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />,
              h6: props => <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />,
              p: props => <Typography variant="body2" gutterBottom sx={{ color: 'inherit', mb: 1 }} {...props} />,
              strong: props => <Box component="span" sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />,
              em: props => <Box component="span" sx={{ fontStyle: 'italic', color: 'inherit' }} {...props} />,
              code: props => (
                <Box
                  component="code"
                  sx={{
                    bgcolor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.875em',
                    color: 'inherit'
                  }}
                  {...props}
                />
              ),
              pre: props => (
                <Box
                  component="pre"
                  sx={{
                    bgcolor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875em',
                    color: 'inherit',
                    my: 1
                  }}
                  {...props}
                />
              ),
              blockquote: props => (
                <Box
                  component="blockquote"
                  sx={{
                    borderLeft: 3,
                    borderColor: isUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                    pl: 2,
                    ml: 0,
                    my: 1,
                    fontStyle: 'italic',
                    color: 'inherit'
                  }}
                  {...props}
                />
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
          
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.75rem',
              color: 'inherit'
            }}
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
