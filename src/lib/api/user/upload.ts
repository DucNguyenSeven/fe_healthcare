import api from '../client';
import { UploadFile, MessageResponse } from '../types';

export const UploadApi = {
  // Upload single file
  single: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<MessageResponse<UploadFile>>('/api/user/upload/single', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Upload multiple files
  multiple: (files: File[]) => {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    return api.post<MessageResponse<UploadFile[]>>('/api/user/upload/multiple', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Delete file
  delete: (publicId: string) => 
    api.delete<MessageResponse<any>>(`/api/user/upload/${publicId}`)
      .then(res => res.data),

  // Upload avatar
  avatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<UploadFile>(`/api/user/upload/avatar`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Upload document
  document: (file: File, type?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (type) form.append('type', type);
    return api.post<MessageResponse<UploadFile>>('/api/user/upload/document', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};
