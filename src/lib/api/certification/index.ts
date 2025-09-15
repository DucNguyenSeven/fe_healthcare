import api from "@/lib/api/client";
import type { MessageResponse } from "@/lib/api/types";

// Certification types based on API documentation
export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  yearIssued: number;
}

export interface AddCertificationRequest {
  name: string;
  issuingOrganization: string;
  yearIssued: number;
}

export interface UpdateCertificationRequest {
  name: string;
  issuingOrganization: string;
  yearIssued: number;
}

export interface BatchUpdateCertificationRequest {
  certifications: Certification[];
}

export const CertificationApi = {
  // 1. Thêm chứng chỉ mới
  add: (userId: string, payload: AddCertificationRequest) => {
    return api.post<MessageResponse<Certification>>(
      `/api/v1/doctors/addCertification/${encodeURIComponent(userId)}`, 
      payload
    ).then(res => {
      return res.data;
    }).catch(err => {
      throw err;
    });
  },

  // 2. Cập nhật chứng chỉ
  update: (userId: string, certificationId: string, payload: UpdateCertificationRequest) => {
    return api.put<MessageResponse<Certification>>(
      `/api/v1/doctors/updateCertification/${encodeURIComponent(userId)}/${encodeURIComponent(certificationId)}`, 
      payload
    ).then(res => {
      return res.data;
    }).catch(err => {
      throw err;
    });
  },

  // 3. Xóa chứng chỉ
  delete: (userId: string, certificationId: string) => {
    return api.delete<MessageResponse<string>>(
      `/api/v1/doctors/deleteCertification/${encodeURIComponent(userId)}/${encodeURIComponent(certificationId)}`
    ).then(res => {
      return res.data;
    }).catch(err => {
      throw err;
    });
  },

  // 4. Lấy danh sách chứng chỉ
  getList: (userId: string) => {
    return api.get<MessageResponse<Certification[]>>(
      `/api/v1/doctors/getCertifications/${encodeURIComponent(userId)}`
    ).then(res => {
      return res.data;
    }).catch(err => {
      throw err;
    });
  },

  // 5. Cập nhật toàn bộ chứng chỉ (Batch Update)
  batchUpdate: (doctorId: string, payload: BatchUpdateCertificationRequest) => {
    return api.put<MessageResponse<{ certifications: Certification[] }>>(
      `/api/v1/doctors/updateCertification/${encodeURIComponent(doctorId)}`, 
      payload
    ).then(res => {
      return res.data;
    }).catch(err => {
      throw err;
    });
  },
};
