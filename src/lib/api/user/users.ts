import api from '../client';
import { UpdateUserRequest, MessageResponse, User, UploadFile } from '../types';

export const UsersApi = {
  // Cập nhật thông tin user
  update: (payload: UpdateUserRequest) => 
    api.put<MessageResponse<User>>('/api/v1/users/update', payload)
      .then(res => res.data),

  // Cập nhật avatar
  updateAvatar: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.put<MessageResponse<UploadFile>>(`/api/v1/users/update-avatar/${id}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};
