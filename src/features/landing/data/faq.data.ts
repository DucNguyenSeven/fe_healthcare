export interface FAQ {
    id: number;
    question: string;
    answer: string;
  }
  
  export const faqData: FAQ[] = [
    {
      id: 1,
      question: "Tôi có thể đặt lịch tái khám như thế nào?",
      answer: "Bạn có thể đặt lịch tái khám dễ dàng thông qua ứng dụng Healthcare+. Chỉ cần chọn bác sĩ, thời gian phù hợp và xác nhận lịch hẹn. Hệ thống sẽ gửi thông báo nhắc nhở trước ngày khám và cho phép bạn hủy hoặc thay đổi lịch hẹn khi cần thiết."
    },
    {
      id: 2,
      question: "Chatbot AI hoạt động ra sao?",
      answer: "Trợ lý AI của chúng tôi được huấn luyện bởi các chuyên gia thận học. AI có thể tư vấn chế độ ăn, phân tích chỉ số xét nghiệm, nhắc nhở uống thuốc và trả lời các câu hỏi thường gặp về bệnh thận. Tuy nhiên, AI chỉ hỗ trợ thông tin và không thay thế chẩn đoán của bác sĩ."
    },
    {
      id: 3,
      question: "Dữ liệu sức khỏe của tôi có an toàn không?",
      answer: "Chúng tôi cam kết bảo vệ quyền riêng tư và bảo mật thông tin của bạn. Tất cả dữ liệu được mã hóa end-to-end, tuân thủ các tiêu chuẩn bảo mật y tế quốc tế. Chỉ có bạn và bác sĩ được ủy quyền mới có thể truy cập thông tin cá nhân."
    },
    {
      id: 4,
      question: "Tôi có thể sử dụng ứng dụng trên nhiều thiết bị không?",
      answer: "Có, ứng dụng Healthcare+ đồng bộ dữ liệu trên tất cả thiết bị của bạn. Bạn có thể đăng nhập từ điện thoại, máy tính bảng hoặc máy tính để truy cập thông tin sức khỏe và quản lý lịch hẹn một cách thuận tiện."
    },
    {
      id: 5,
      question: "Làm thế nào để liên hệ hỗ trợ khách hàng?",
      answer: "Đội ngũ hỗ trợ khách hàng của chúng tôi sẵn sàng hỗ trợ 24/7. Bạn có thể liên hệ qua chat trong ứng dụng, email hoặc hotline. Chúng tôi cam kết phản hồi trong vòng 2 giờ làm việc."
    }
  ]; 