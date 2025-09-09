import api from "@/lib/api/client";
import type { MessageResponse, UpdateUserRequest, UserResponse } from "@/lib/api/types";

export const UsersApi = {
  update: (payload: UpdateUserRequest) => {
    console.log('API call to /api/v1/users/update with payload:', payload);
    return api.put<MessageResponse<UserResponse>>("/api/v1/users/update", payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      console.log('API response received:', res.data);
      return res.data;
    }).catch(err => {
      console.error('API call failed:', err);
      console.error('Error response:', err.response?.data);
      throw err;
    });
  },
  updateAvatar: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.put<MessageResponse<string>>(`/api/user/users/update-avatar/${encodeURIComponent(id)}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};
