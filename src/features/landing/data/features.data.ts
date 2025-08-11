export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string | null;
}

export const features: Feature[] = [
  {
    id: 1,
    title: "Hồ sơ bệnh án",
    description: "Quản lý kết quả xét nghiệm, phác đồ điều trị và tải xuống PDF báo cáo y tế một cách an toàn và tiện lợi.",
    icon: "/assets/icons/medical-record.svg",
    image: null, // Will be replaced with actual image
  },
  {
    id: 2,
    title: "Đặt lịch hẹn",
    description: "Đặt lịch khám với bác sĩ chuyên khoa thận, nhận nhắc nhở và quản lý lịch trình điều trị.",
    icon: "/assets/icons/appointment.svg",
    image: null,
  },
  {
    id: 3,
    title: "Theo dõi sức khỏe",
    description: "Theo dõi các chỉ số quan trọng như huyết áp, đường huyết, chức năng thận và nhận cảnh báo sớm.",
    icon: "/assets/icons/monitoring.svg",
    image: null,
  },
  {
    id: 4,
    title: "Quản lý thuốc",
    description: "Nhắc nhở uống thuốc đúng giờ, theo dõi tác dụng phụ và tương tác thuốc với bác sĩ.",
    icon: "/assets/icons/medication.svg",
    image: null,
  },
  {
    id: 5,
    title: "Giáo dục sức khỏe",
    description: "Truy cập thông tin y tế đáng tin cậy, video hướng dẫn và tài liệu về bệnh thận.",
    icon: "/assets/icons/education.svg",
    image: null,
  },
  {
    id: 6,
    title: "Hỗ trợ cộng đồng",
    description: "Kết nối với bệnh nhân khác, chia sẻ kinh nghiệm và nhận hỗ trợ từ cộng đồng.",
    icon: "/assets/icons/support.svg",
    image: null,
  },
]; 