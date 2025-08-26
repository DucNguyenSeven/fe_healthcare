import React from "react";
import { Box, Typography } from "@mui/material";

const HeroPanel = () => {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(25, 118, 210, 0.4)",
          zIndex: 1,
        },
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src="/assets/images/login_hero_doctor_patient.png"
        alt="Healthcare professionals with patient"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />
      {/* Content Container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Quote Text */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 2, sm: 3, md: 4 },
            maxWidth: { xs: "100%", sm: "90%", md: "80%", lg: "70%" },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 600,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
              mb: { xs: 1, sm: 1.5 },
              fontSize: {
                xs: "1rem",
                sm: "1.5rem",
                md: "2rem",
                lg: "2.5rem",
                xl: "3rem",
              },
              lineHeight: 1.2,
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            &quot;Yên tâm nhé, chúng tôi luôn ở bên khi bạn cần&quot;
          </Typography>
        </Box>

        {/* Description Text */}
        <Box
          sx={{
            textAlign: "center",
            maxWidth: { xs: "100%", sm: "90%", md: 600, lg: 700 },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "white",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)",
              fontSize: {
                xs: "0.875rem",
                sm: "1rem",
                md: "1.125rem",
                lg: "1.25rem",
              },
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            Đội ngũ y tế chuyên nghiệp, tận tâm với sứ mệnh chăm sóc sức khỏe
            toàn diện cho mọi người.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroPanel;
