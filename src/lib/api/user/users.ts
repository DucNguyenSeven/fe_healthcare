import { apiFetch } from "@/lib/api/client";
import type { MessageResponse, UpdateUserRequest, UserResponse } from "@/lib/api/types";

export const UsersApi = {
  update: (payload: UpdateUserRequest) =>
    apiFetch<MessageResponse<UserResponse>>("/api/user/users/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateAvatar: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`/api/user/users/update-avatar/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: form, // IMPORTANT: do NOT set content-type header; browser will set boundary.
    }).then(async (res) => {
      if (!res.ok) throw new Error(`ApiError ${res.status}`);
      return (await res.json()) as MessageResponse<string>;
    });
  },
};
