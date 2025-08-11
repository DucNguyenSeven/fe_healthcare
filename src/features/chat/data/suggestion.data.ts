export interface SuggestionChip {
  id: string;
  text: string;
  category: 'health' | 'appointment' | 'general';
}

export const defaultSuggestions: SuggestionChip[] = [
  {
    id: '1',
    text: 'Làm thế nào để tôi đặt lịch hẹn?',
    category: 'appointment'
  },
  {
    id: '2',
    text: 'Các triệu chứng của bệnh suy thận mạn tính?',
    category: 'health'
  },
  {
    id: '3',
    text: 'Làm thế nào để tôi truy cập hồ sơ y tế của mình?',
    category: 'general'
  },
  // {
  //   id: '4',
  //   text: 'Tôi nên làm gì trước cuộc hẹn?',
  //   category: 'appointment'
  // },
  // {
  //   id: '5',
  //   text: 'Làm thế nào để tôi liên hệ với bác sĩ của mình?',
  //   category: 'general'
  // }
]; 