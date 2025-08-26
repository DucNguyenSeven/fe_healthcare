import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Box,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Doctor {
  name: string;
  specialty: string;
  description: string;
  experience: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const { name, specialty, description, experience } = doctor;

  // Extract initials from doctor's name
  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

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
        minHeight: "320px",
        maxHeight: "380px",
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          p: { xs: 2, sm: 2.5 },
          "&:last-child": {
            pb: { xs: 2, sm: 2.5 },
          },
        }}
      >
        {/* Circular Avatar */}
        <Avatar
          sx={{
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            backgroundColor: "primary.main",
            color: "white",
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            mb: 2,
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          }}
        >
          {getInitials(name)}
        </Avatar>

        {/* Doctor Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 1,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.2,
          }}
        >
          {name}
        </Typography>

        {/* Specialty */}
        <Chip
          label={specialty}
          sx={{
            backgroundColor: "primary.light",
            color: "primary.main",
            fontWeight: 500,
            mb: 1.5,
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
            height: { xs: 24, sm: 28 },
          }}
        />

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.4,
            flexGrow: 1,
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
            mb: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>

        {/* Experience */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            color: "text.secondary",
          }}
        >
          <AccessTimeIcon
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              mr: 0.5,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.8rem" },
              fontWeight: 500,
            }}
          >
            {experience}
          </Typography>
        </Box>

        {/* CTA Button */}
        <Button
          variant="contained"
          size="small"
          sx={{
            width: "100%",
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
            fontWeight: 500,
          }}
        >
          Đặt lịch khám
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
