/**
 * Admin Payment Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 5
 */

import {
  PaymentStatus,
  type RevenueStatistics,
  type PaymentByDate,
  type Payment,
  type DateRangeParams,
} from '@/types/admin';

// ============================================
// MOCK DATA
// ============================================

const mockRevenueStatistics: RevenueStatistics = {
  totalRevenue: 150000000,
  paymentCount: 245,
  averagePaymentAmount: 612244.89,
};

const mockPaymentsByDate: PaymentByDate[] = [
  { date: '2025-12-01', revenue: 5000000, count: 8 },
  { date: '2025-12-02', revenue: 5500000, count: 9 },
  { date: '2025-12-03', revenue: 4800000, count: 7 },
  { date: '2025-12-04', revenue: 6200000, count: 10 },
  { date: '2025-12-05', revenue: 5900000, count: 9 },
  { date: '2025-12-06', revenue: 6500000, count: 11 },
  { date: '2025-12-07', revenue: 7200000, count: 12 },
];

const mockPayments: Payment[] = [
  {
    paymentId: 'PAY001',
    appointmentId: 'APT001',
    amount: 500000,
    status: PaymentStatus.PAID,
    paymentMethod: 'VNPAY',
    transactionId: 'TXN123456',
    paidAt: '2025-12-08T10:30:00',
    createdAt: '2025-12-08T10:00:00',
  },
  {
    paymentId: 'PAY002',
    appointmentId: 'APT002',
    amount: 750000,
    status: PaymentStatus.PAID,
    paymentMethod: 'MOMO',
    transactionId: 'TXN123457',
    paidAt: '2025-12-08T11:15:00',
    createdAt: '2025-12-08T10:45:00',
  },
  {
    paymentId: 'PAY003',
    appointmentId: 'APT003',
    amount: 600000,
    status: PaymentStatus.PAID,
    paymentMethod: 'VNPAY',
    transactionId: 'TXN123458',
    paidAt: '2025-12-08T14:20:00',
    createdAt: '2025-12-08T14:00:00',
  },
  {
    paymentId: 'PAY004',
    appointmentId: 'APT004',
    amount: 450000,
    status: PaymentStatus.PENDING,
    paymentMethod: 'VNPAY',
    transactionId: 'TXN123459',
    paidAt: '2025-12-08T15:00:00',
    createdAt: '2025-12-08T14:30:00',
  },
];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Revenue Statistics
 * Endpoint: GET /api/v1/payments/admin/revenue-statistics
 */
export async function getRevenueStatistics(
  params: DateRangeParams
): Promise<RevenueStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueStatistics', params);
  return mockRevenueStatistics;
}

/**
 * Get Revenue By Date
 * Endpoint: GET /api/v1/payments/admin/by-date
 */
export async function getRevenueByDate(
  params: DateRangeParams
): Promise<PaymentByDate[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueByDate', params);
  return mockPaymentsByDate;
}

/**
 * Get Payments By Appointments
 * Endpoint: POST /api/v1/payments/admin/by-appointments
 */
export async function getPaymentsByAppointments(
  appointmentIds: string[]
): Promise<Payment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getPaymentsByAppointments', appointmentIds);

  return mockPayments.filter((payment) =>
    appointmentIds.includes(payment.appointmentId)
  );
}

/**
 * Get Paid Payments By Date Range
 * Endpoint: GET /api/v1/payments/admin/paid
 */
export async function getPaidPayments(
  params: DateRangeParams
): Promise<Payment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getPaidPayments', params);

  return mockPayments.filter((payment) => payment.status === 'PAID');
}
