import { ChatUser, ChatConversation, ChatMessage } from '@/features/chat/types'

// Mock doctors data
export const mockDoctors: ChatUser[] = [
  {
    id: 'doctor-1',
    name: 'BS. Trần Minh Hoàng',
    avatar: '/api/placeholder/40/40',
    role: 'doctor',
    specialty: 'Thận học',
    isOnline: true
  },
  {
    id: 'doctor-2',
    name: 'BS. Lê Thị Mai',
    avatar: '/api/placeholder/40/40',
    role: 'doctor',
    specialty: 'Tim mạch',
    isOnline: false,
    lastSeen: '2024-01-15T10:30:00Z'
  },
  {
    id: 'doctor-3',
    name: 'BS. Nguyễn Văn Đức',
    avatar: '/api/placeholder/40/40',
    role: 'doctor',
    specialty: 'Nội tổng quát',
    isOnline: true
  }
]

// Mock patients data
export const mockPatients: ChatUser[] = [
  {
    id: 'patient-1',
    name: 'Nguyễn Văn An',
    avatar: '/api/placeholder/40/40',
    role: 'patient',
    isOnline: true
  },
  {
    id: 'patient-2',
    name: 'Trần Thị Bình',
    avatar: '/api/placeholder/40/40',
    role: 'patient',
    isOnline: false,
    lastSeen: '2024-01-15T09:15:00Z'
  },
  {
    id: 'patient-3',
    name: 'Lê Minh Chính',
    avatar: '/api/placeholder/40/40',
    role: 'patient',
    isOnline: true
  }
]

// Mock messages
export const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'doctor-1',
    content: 'Chào bạn! Tôi đã xem kết quả xét nghiệm của bạn. Chỉ số eGFR đã cải thiện so với lần trước.',
    timestamp: '2024-01-15T14:30:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'patient-1',
    content: 'Cảm ơn bác sĩ! Vậy tôi có cần điều chỉnh thuốc không ạ?',
    timestamp: '2024-01-15T14:32:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'doctor-1',
    content: 'Hiện tại bạn cứ duy trì liều như cũ. Nhớ uống đủ nước và hạn chế muối nhé.',
    timestamp: '2024-01-15T14:35:00Z',
    type: 'text',
    isRead: false
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'doctor-2',
    content: 'Kết quả siêu âm tim cho thấy chức năng tim đang ổn định. Bạn cần tái khám sau 3 tháng.',
    timestamp: '2024-01-15T10:20:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: 'patient-1',
    content: 'Dạ em cảm ơn bác sĩ. Em sẽ đặt lịch tái khám ạ.',
    timestamp: '2024-01-15T10:25:00Z',
    type: 'text',
    isRead: true
  }
]

// Mock conversations for patient view
export const mockPatientConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    participants: [mockDoctors[0]],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:35:00Z',
    isTyping: false
  },
  {
    id: 'conv-2',
    participants: [mockDoctors[1]],
    lastMessage: mockMessages[4],
    unreadCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:25:00Z',
    isTyping: false
  }
]

// Mock conversations for doctor view
export const mockDoctorConversations: ChatConversation[] = [
  {
    id: 'conv-3',
    participants: [mockPatients[0]],
    lastMessage: {
      id: 'msg-6',
      conversationId: 'conv-3',
      senderId: 'patient-1',
      content: 'Bác sĩ ơi, em cảm thấy hơi đau ở vùng thận. Em có cần đến khám không ạ?',
      timestamp: '2024-01-15T16:20:00Z',
      type: 'text',
      isRead: false
    },
    unreadCount: 1,
    createdAt: '2024-01-15T16:00:00Z',
    updatedAt: '2024-01-15T16:20:00Z',
    isTyping: false
  },
  {
    id: 'conv-4',
    participants: [mockPatients[1]],
    lastMessage: {
      id: 'msg-7',
      conversationId: 'conv-4',
      senderId: 'doctor-1',
      content: 'Cảm ơn bạn đã gửi kết quả xét nghiệm. Tôi sẽ xem và phản hồi trong hôm nay.',
      timestamp: '2024-01-15T15:45:00Z',
      type: 'text',
      isRead: true
    },
    unreadCount: 0,
    createdAt: '2024-01-15T15:30:00Z',
    updatedAt: '2024-01-15T15:45:00Z',
    isTyping: false
  }
]

// Helper function to get conversations by user role
export const getConversationsByRole = (role: 'doctor' | 'patient'): ChatConversation[] => {
  return role === 'doctor' ? mockDoctorConversations : mockPatientConversations
}

// Helper function to get messages by conversation ID
export const getMessagesByConversationId = (conversationId: string): ChatMessage[] => {
  return mockMessages.filter(msg => msg.conversationId === conversationId)
}