export interface Feedback {
    id: number;
    name: string;
    title: string;
    avatar: string | null;
    rating: number;
    feedback: string;
    date: string;
  }
  
  export const feedbackData: Feedback[] = [
    {
      id: 1,
      name: 'Nguyễn Thị Hương',
      title: 'Chị',
      avatar: null,
      rating: 5,
      feedback: 'Dịch vụ rất tốt! Bác sĩ tận tâm và chuyên nghiệp. Tôi đã được chăm sóc rất chu đáo trong suốt quá trình điều trị.',
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Trần Văn Minh',
      title: 'Anh',
      avatar: null,
      rating: 5,
      feedback: 'Hệ thống quản lý sức khỏe rất tiện lợi. Tôi có thể theo dõi các chỉ số sức khỏe một cách dễ dàng và chính xác.',
      date: '2024-01-10'
    },
    {
      id: 3,
      name: 'Lê Thị Lan',
      title: 'Cô',
      avatar: null,
      rating: 4,
      feedback: 'Đội ngũ y tế rất nhiệt tình và có chuyên môn cao. Tôi cảm thấy an tâm khi được điều trị tại đây.',
      date: '2024-01-08'
    },
    {
      id: 4,
      name: 'Phạm Văn Đức',
      title: 'Ông',
      avatar: null,
      rating: 5,
      feedback: 'Cơ sở vật chất hiện đại, bác sĩ giỏi. Tôi đã khỏi bệnh nhanh chóng nhờ sự chăm sóc tận tâm của đội ngũ y tế.',
      date: '2024-01-05'
    },
    // {
    //   id: 5,
    //   name: 'Hoàng Thị Mai',
    //   title: 'Chị',
    //   avatar: null,
    //   rating: 5,
    //   feedback: 'Dịch vụ khám chữa bệnh rất tốt, thời gian chờ ngắn. Bác sĩ giải thích rõ ràng về tình trạng bệnh và phương pháp điều trị.',
    //   date: '2024-01-03'
    // },
    // {
    //   id: 6,
    //   name: 'Vũ Văn Thành',
    //   title: 'Anh',
    //   avatar: null,
    //   rating: 4,
    //   feedback: 'Hệ thống đặt lịch online rất tiện lợi. Tôi không cần phải xếp hàng chờ đợi lâu như trước đây.',
    //   date: '2024-01-01'
    // }
  ]; 