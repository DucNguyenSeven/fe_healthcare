import { MockMedicalRecord } from '@/types/medical-record';

export const mockMedicalRecords: MockMedicalRecord[] = [
  {
    recordId: 'e44e7e9e-89fa-4889-81c7-2e4fa30c73f0',
    appointmentId: 'e44e7e9e-89fa-4889-81c7-2e4fa30c73f0',
    appointmentDate: '7/10/2025',
    doctorName: 'Nguyễn Văn Lượng',
    serviceName: 'Nội tổng quát',
    diagnosis: 'N18.4',
    symptoms: 'Uống thuốc đầu dần theo giờ • Theo dõi huyết áp hàng ngày • Hạn chế muối trong thức ăn • Tái khám sau 4 tuần • Liên hệ ngay nếu có triệu chứng bất thường...',
    treatment: 'Test',
    doctorNote: 'Dùng thuốc đúng liều lượng và thời gian. Nếu có tác dụng phụ, hãy liên hệ bác sĩ ngay tức.',
    followUpDate: '14/10/2025',
    createdAt: '2025-10-07',
    prescriptions: [
      {
        prescriptionId: '211e4b06-fadc-49c2-9b6a-49020a08dcb3',
        medicalName: 'Furosemide 40mg',
        dosage: '12',
        frequency: '{EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      },
      {
        prescriptionId: '351bba33-e55a-4a4f-b666-e442b34533b3',
        medicalName: 'Furosemide 40mg',
        dosage: '40',
        frequency: '{MORNING, AFTERNOON}',
        startDate: '2025-09-23',
        endDate: '2025-09-30',
        notes: 'Test 1'
      },
      {
        prescriptionId: '5acc5326-7dc0-439a-82bb-e8184ecd57a3',
        medicalName: 'Metformin 500mg',
        dosage: '12',
        frequency: '{MORNING, EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      },
      {
        prescriptionId: '9c95ad4f-9b69-4d77-af33-795ec093ec46',
        medicalName: 'Lisinopril 10mg',
        dosage: '23',
        frequency: '{MORNING, AFTERNOON, EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      },
      {
        prescriptionId: 'aa019be8-482c-45bf-824c-5ece2474fa02',
        medicalName: 'Amlodipine 5mg',
        dosage: '12',
        frequency: '{EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Tết'
      },
      {
        prescriptionId: 'e6813a28-0241-4378-b04f-66d592643266',
        medicalName: 'Amlodipine 5mg',
        dosage: '1',
        frequency: '{AFTERNOON}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      }
    ]
  },
  {
    recordId: '82df2519-fc74-4024-9205-bc41b1ad1317',
    appointmentId: '62f3f37d-9691-4c47-9d5e-9fb7e7c2f5a4',
    appointmentDate: '23/9/2025',
    doctorName: 'Nguyễn Văn Lượng',
    serviceName: 'Nội tiết',
    diagnosis: 'I12.9',
    symptoms: 'Uống thuốc đầu dần theo giờ',
    treatment: 'Test',
    doctorNote: 'Theo dõi đường huyết thường xuyên. Chế độ ăn low carb, tránh đồ ngọt.',
    followUpDate: '7/10/2025',
    createdAt: '2025-09-23',
    prescriptions: [
      {
        prescriptionId: 'a36baa24-71fb-4ff0-9f95-d8fee69a4bd4',
        medicalName: 'Lisinopril 10mg',
        dosage: '10',
        frequency: '{AFTERNOON, EVENING}',
        startDate: '2025-09-23',
        endDate: '2025-10-07',
        notes: 'Test'
      },
      {
        prescriptionId: 'afb616f2-c92c-45f4-b8bd-4e0807fb1c7f7',
        medicalName: 'Atorvastatin 20mg',
        dosage: '20',
        frequency: '{AFTERNOON, EVENING}',
        startDate: '2025-09-23',
        endDate: '2025-10-07',
        notes: 'Test'
      }
    ]
  },
  {
    recordId: '1de1731d-e6b8-4f4a-8342-595d3e01e0b5',
    appointmentId: '00347674-8a80-41f6-9c33-f8e5d8e0e5e5',
    appointmentDate: '30/9/2025',
    doctorName: 'Nguyễn Văn Lượng',
    serviceName: 'Thận - Tiết niệu',
    diagnosis: 'N18.4',
    symptoms: 'Thận - Tiết niệu',
    treatment: 'Test',
    doctorNote: 'Hạn chế protein, muối. Uống đủ nước. Tránh các thuốc gây tổn thương thận như NSAID.',
    followUpDate: '14/10/2025',
    createdAt: '2025-09-30',
    prescriptions: [
      {
        prescriptionId: '4bf27457-7607-443d-a546-04657167361',
        medicalName: 'Metformin 500mg',
        dosage: '12',
        frequency: '{AFTERNOON, MORNING, EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      },
      {
        prescriptionId: '51f20a8b-cfa1-4619-93d1-50965527ea7b',
        medicalName: 'Amlodipine 5mg',
        dosage: '12',
        frequency: '{MORNING, EVENING}',
        startDate: '2025-09-30',
        endDate: '2025-10-14',
        notes: 'Test'
      }
    ]
  }
];
