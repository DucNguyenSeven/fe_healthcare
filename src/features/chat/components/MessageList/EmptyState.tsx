import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export const EmptyState: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: 'transparent'
        }}
      >
        <SmartToyIcon
          sx={{
            fontSize: 40,
            color: 'primary.main',
            mb: 1,
            opacity: 0.7
          }}
        />
        
        <Typography
          variant="h6"
          sx={{
            mb: 0.5,
            color: 'text.primary',
            fontWeight: 'medium',
            textAlign: 'center',
            px: 2
          }}
        >
          Chào mừng đến với Trợ lý Sức khỏe AI
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: { xs: '100%', sm: '50ch' },
            lineHeight: 1.4,
            textAlign: 'center',
            px: 2
          }}
        >
          Tôi ở đây để giúp bạn với các câu hỏi về sức khỏe, lên lịch hẹn 
          và thông tin chăm sóc sức khỏe chung. Bắt đầu cuộc trò chuyện bằng cách nhập tin nhắn 
          hoặc chọn một trong các gợi ý dưới đây.
        </Typography>
      </Paper>
    </Box>
  );
}; 