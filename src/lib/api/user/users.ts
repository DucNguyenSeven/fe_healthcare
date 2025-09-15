import api from "@/lib/api/client";
import type { MessageResponse, UpdateUserRequest, UserResponse } from "@/lib/api/types";

export const UsersApi = {
  update: (payload: UpdateUserRequest) => {
    return api.put<MessageResponse<UserResponse>>("/api/v1/users/update", payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      return res.data;
    }).catch(err => {
      // API call failed
      throw err;
    });
  },
  updateAvatar: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.put<MessageResponse<string>>(`/api/v1/users/update-avatar/${encodeURIComponent(id)}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};
