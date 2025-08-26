import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface FeedbackCardProps {
  name: string;
  avatar?: string;
  title: string;
  feedback: string;
  rating: number;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  name,
  avatar,
  title,
  feedback,
  rating,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
        borderRadius: 3,
        overflow: "hidden",
        minHeight: "280px",
        maxHeight: "320px",
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 2.5 },
          "&:last-child": {
            pb: { xs: 2, sm: 2.5 },
          },
        }}
      >
        {/* Header with Avatar, Name, Title, and Rating */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 2,
            gap: 2,
          }}
        >
          <Avatar
            src={avatar}
            sx={{
              width: 56,
              height: 56,
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "1.5rem",
            }}
          >
            {avatar ? null : <PersonIcon />}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 0.5,
                fontSize: "0.75rem",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                lineHeight: 1.2,
              }}
            >
              {name}
            </Typography>

            <Rating
              value={rating}
              readOnly
              size="small"
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#ffc107",
                },
                "& .MuiRating-iconEmpty": {
                  color: "#e0e0e0",
                },
              }}
            />
          </Box>
        </Box>

        {/* Feedback Content */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            flexGrow: 1,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            fontStyle: "italic",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            textAlign: "justify",
          }}
        >
          &quot;{feedback}&quot;
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
