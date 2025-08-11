import { api } from "@/lib/api/client";
import type { MessageResponse, UpdateUserRequest, UserResponse } from "@/lib/api/types";

export const UsersApi = {
  update: (payload: UpdateUserRequest) =>
    api.put<MessageResponse<UserResponse>>("/api/user/users/update", payload).then(res => res.data),
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
