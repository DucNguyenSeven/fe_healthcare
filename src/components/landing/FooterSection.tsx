"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Link,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { footerLinks, contactInfo, socialLinks, bottomBarLinks } from '../../data/global/footer.data';
import { useRouter } from 'next/navigation';

const FooterSection: React.FC = () => {
  const router = useRouter();

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'facebook':
        return <Facebook />;
      case 'twitter':
        return <Twitter />;
      case 'instagram':
        return <Instagram />;
      default:
        return null;
    }
  };

  const getContactIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone':
        return <Phone />;
      case 'email':
        return <Email />;
      case 'location_on':
        return <LocationOn />;
      default:
        return null;
    }
  };

  const handleRegister = () => {
    console.log('Footer register button clicked');
    router.push('/register');
  };

  const handleLogin = () => {
    console.log('Footer login button clicked');
    router.push('/login');
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0B1220',
        color: '#ffffff',
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Column 1: Logo + Description + Social Icons */}
          <Box>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    mb: 2,
                  }}
                >
                  Healthcare+
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#E0E0E0',
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  Nền tảng chăm sóc sức khỏe toàn diện, kết nối bệnh nhân với các bác sĩ chuyên môn cao.
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={2}>
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    sx={{
                      color: '#E0E0E0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#ffffff',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {getSocialIcon(social.icon)}
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Column 2: Navigation Links */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                mb: 3,
              }}
            >
              Liên kết
            </Typography>
            <Stack spacing={2}>
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  sx={{
                    color: '#E0E0E0',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Column 3: Contact Info */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                mb: 3,
              }}
            >
              Liên hệ
            </Typography>
            <Stack spacing={2}>
              {contactInfo.map((contact, index) => (
                <Link
                  key={index}
                  href={contact.href}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#E0E0E0',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {getContactIcon(contact.icon)}
                  <Typography variant="body2">
                    {contact.text}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Column 4: CTA */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                mb: 3,
              }}
            >
              Bắt đầu ngay
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#E0E0E0',
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Tham gia cùng chúng tôi để trải nghiệm dịch vụ chăm sóc sức khỏe tốt nhất.
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
                onClick={handleRegister}
              >
                Đăng ký
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#E0E0E0',
                  color: '#E0E0E0',
                  '&:hover': {
                    borderColor: '#ffffff',
                    color: '#ffffff',
                  },
                }}
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Divider sx={{ borderColor: '#2A3441', mb: 3 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#E0E0E0',
            }}
          >
            © 2024 Healthcare+. Tất cả quyền được bảo lưu.
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            sx={{
              flexWrap: 'wrap',
            }}
          >
            {bottomBarLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                sx={{
                  color: '#E0E0E0',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: '#ffffff',
                  },
                }}
              >
                {link.name}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default FooterSection; 