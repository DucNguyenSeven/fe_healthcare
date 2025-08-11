import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  isUser = false 
}) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        a: props => (
          <Link 
            {...props} 
            target="_blank" 
            rel="noopener" 
            sx={{ color: isUser ? 'inherit' : 'primary.main' }} 
          />
        ),
        ul: ({...props}) => (
          <Box component="ul" sx={{pl: 3, mt: 0}} {...props} />
        ),
        li: ({...props}) => (
          <Box component="li" sx={{py: 0.25}} {...props} />
        ),
        h1: props => (
          <Typography variant="h6" gutterBottom sx={{ color: 'inherit' }} {...props} />
        ),
        h2: props => (
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'inherit' }} {...props} />
        ),
        h3: props => (
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'inherit' }} {...props} />
        ),
        h4: props => (
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />
        ),
        h5: props => (
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />
        ),
        h6: props => (
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />
        ),
        p: props => (
          <Typography variant="body2" gutterBottom sx={{ color: 'inherit', mb: 1 }} {...props} />
        ),
        strong: props => (
          <Box component="span" sx={{ fontWeight: 'bold', color: 'inherit' }} {...props} />
        ),
        em: props => (
          <Box component="span" sx={{ fontStyle: 'italic', color: 'inherit' }} {...props} />
        ),
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
      {content}
    </ReactMarkdown>
  );
};
