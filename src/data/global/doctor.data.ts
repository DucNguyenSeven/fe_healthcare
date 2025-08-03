export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    description: string;
    experience: string;
    rating: number;
    patients: number;
    image: string | null;
  }
  
  export const doctorList: Doctor[] = [
    {
      id: 1,
      name: "Dr. Nguyễn Văn Huy",
      specialty: "Thận nhân tạo",
      description: "Chuyên gia hàng đầu về thẩm phân và ghép thận với hơn 15 năm kinh nghiệm",
      experience: "15+ năm",
      rating: 4.9,
      patients: 1200,
      image: null
    },
    {
      id: 2,
      name: "Dr. Trần Thị Mai",
      specialty: "Nội tiết",
      description: "Chuyên gia điều trị bệnh tiểu đường và rối loạn chuyển hóa",
      experience: "12+ năm",
      rating: 4.8,
      patients: 950,
      image: null
    },
    {
      id: 3,
      name: "Dr. Lê Văn Nam",
      specialty: "Tim mạch",
      description: "Chuyên gia tim mạch với kinh nghiệm điều trị bệnh tim mạch",
      experience: "18+ năm",
      rating: 4.9,
      patients: 1500,
      image: null
    },
    {
      id: 4,
      name: "Dr. Phạm Thị Lan",
      specialty: "Nhi khoa",
      description: "Bác sĩ nhi khoa chuyên điều trị các bệnh lý ở trẻ em",
      experience: "10+ năm",
      rating: 4.7,
      patients: 800,
      image: null
    },
    {
      id: 5,
      name: "Dr. Hoàng Văn Thành",
      specialty: "Phẫu thuật",
      description: "Chuyên gia phẫu thuật với kinh nghiệm trong nhiều lĩnh vực",
      experience: "20+ năm",
      rating: 4.9,
      patients: 2000,
      image: null
    },
    {
      id: 6,
      name: "Dr. Vũ Thị Hương",
      specialty: "Da liễu",
      description: "Chuyên gia da liễu điều trị các bệnh về da và thẩm mỹ",
      experience: "8+ năm",
      rating: 4.6,
      patients: 650,
      image: null
    },
    {
      id: 7,
      name: "Dr. Nguyễn Văn Huy",
      specialty: "Thận nhân tạo",
      description: "Chuyên gia hàng đầu về thẩm phân và ghép thận với hơn 15 năm kinh nghiệm",
      experience: "15+ năm",
      rating: 4.9,
      patients: 1200,
      image: null
    },
    {
      id: 8,
      name: "Dr. Nguyễn Văn Huy",
      specialty: "Thận nhân tạo",
      description: "Chuyên gia hàng đầu về thẩm phân và ghép thận với hơn 15 năm kinh nghiệm",
      experience: "15+ năm",
      rating: 4.9,
      patients: 1200,
      image: null
    }
  ]; 