import React from "react";
import Image from "next/image";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  image,
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
        minHeight: "240px", // Reduced to match container
        maxHeight: "280px", // Reduced to match container
      }}
    >
      {/* Image placeholder */}
      <CardMedia
        component="div"
        sx={{
          height: 90, // Further reduced from 100 to 90
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: "#e3f2fd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem", // Further reduced from 1.75rem
            }}
          >
            🏥
          </Box>
        )}

        {/* Icon overlay in top-left corner */}
        <Box
          sx={{
            position: "absolute",
            top: 6, // Further reduced from 8
            left: 6, // Further reduced from 8
            width: 32, // Further reduced from 36
            height: 32, // Further reduced from 36
            backgroundColor: "primary.main",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            color: "white",
          }}
        >
          {typeof icon === "string" && icon.startsWith("<svg") ? (
            <div
              dangerouslySetInnerHTML={{ __html: icon }}
              style={{
                width: "16px", // Further reduced from 18px
                height: "16px", // Further reduced from 18px
                color: "white",
              }}
            />
          ) : (
            <Image
              src={icon}
              alt={title}
              width={16}
              height={16}
              style={{
                filter: "brightness(0) invert(1)",
              }}
            />
          )}
        </Box>
      </CardMedia>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 1.5, sm: 2 }, // Further reduced from 2,2.5
          "&:last-child": {
            pb: { xs: 1.5, sm: 2 }, // Further reduced from 2,2.5
          },
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 0.75, // Further reduced from 1
            fontSize: { xs: "0.9rem", sm: "0.95rem" }, // Further reduced
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.4, // Further reduced from 1.5
            flexGrow: 1,
            fontSize: { xs: "0.75rem", sm: "0.8rem" }, // Further reduced
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
