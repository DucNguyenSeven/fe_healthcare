/**
 * Admin Doctor Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 6
 */

import { UserStatus, type Doctor } from '@/types/admin';

// ============================================
// MOCK DATA
// ============================================

const mockDoctors: Doctor[] = [
  {
    userId: 'DOC001',
    username: 'dr.nguyenvana',
    email: 'dr.nguyenvana@hospital.vn',
    fullName: 'Dr. Nguyễn Văn A',
    phoneNumber: '0912345678',
    specialty: 'Nội khoa',
    experienceYears: 10,
    licenseNumber: 'BYT-123456',
    hospitalAffiliation: 'Bệnh viện Đa khoa Trung ương',
    bio: 'Bác sĩ chuyên khoa Nội, 10 năm kinh nghiệm...',
    rating: 4.8,
    totalReviews: 150,
    status: UserStatus.ACTIVE,
  },
  {
    userId: 'DOC002',
    username: 'dr.tranthib',
    email: 'dr.tranthib@hospital.vn',
    fullName: 'Dr. Trần Thị B',
    phoneNumber: '0923456789',
    specialty: 'Tim mạch',
    experienceYears: 12,
    licenseNumber: 'BYT-123457',
    hospitalAffiliation: 'Bệnh viện Tim Tân Bình',
    bio: 'Bác sĩ chuyên khoa Tim mạch, 12 năm kinh nghiệm...',
    rating: 4.9,
    totalReviews: 200,
    status: UserStatus.ACTIVE,
  },
  {
    userId: 'DOC003',
    username: 'dr.levanc',
    email: 'dr.levanc@hospital.vn',
    fullName: 'Dr. Lê Văn C',
    phoneNumber: '0934567890',
    specialty: 'Ngoại khoa',
    experienceYears: 15,
    licenseNumber: 'BYT-123458',
    hospitalAffiliation: 'Bệnh viện Chợ Rẫy',
    bio: 'Bác sĩ chuyên khoa Ngoại, 15 năm kinh nghiệm...',
    rating: 4.7,
    totalReviews: 180,
    status: UserStatus.ACTIVE,
  },
  {
    userId: 'DOC004',
    username: 'dr.phamthid',
    email: 'dr.phamthid@hospital.vn',
    fullName: 'Dr. Phạm Thị D',
    phoneNumber: '0945678901',
    specialty: 'Sản phụ khoa',
    experienceYears: 8,
    licenseNumber: 'BYT-123459',
    hospitalAffiliation: 'Bệnh viện Từ Dũ',
    bio: 'Bác sĩ chuyên khoa Sản phụ, 8 năm kinh nghiệm...',
    rating: 4.6,
    totalReviews: 120,
    status: UserStatus.ACTIVE,
  },
  {
    userId: 'DOC005',
    username: 'dr.hoangvane',
    email: 'dr.hoangvane@hospital.vn',
    fullName: 'Dr. Hoàng Văn E',
    phoneNumber: '0956789012',
    specialty: 'Nhi khoa',
    experienceYears: 9,
    licenseNumber: 'BYT-123460',
    hospitalAffiliation: 'Bệnh viện Nhi Đồng 1',
    bio: 'Bác sĩ chuyên khoa Nhi, 9 năm kinh nghiệm...',
    rating: 4.8,
    totalReviews: 160,
    status: UserStatus.ACTIVE,
  },
];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Doctors By IDs
 * Endpoint: POST /api/v1/doctors/admin/by-ids
 */
export async function getDoctorsByIds(doctorIds: string[]): Promise<Doctor[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getDoctorsByIds', doctorIds);

  return mockDoctors.filter((doctor) => doctorIds.includes(doctor.userId));
}
