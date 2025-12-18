// REQUIRES JWT – handled automatically via withCredentials and axios interceptor
import { api } from "@/lib/api/client";
import type { UploadFile } from "@/lib/api/types";

export const UploadApi = {
  single: (file: File, folder = "HealthCare") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return api.post<UploadFile>(`/api/user/upload/single`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  multiple: (files: File[], folder = "HealthCare") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);
    return api.post<UploadFile>(`/api/user/upload/multiple`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  delete: (publicId: string) =>
    api.delete<string>(`/api/user/upload/${encodeURIComponent(publicId)}`).then(res => res.data),

  avatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<UploadFile>(`/api/user/upload/avatar`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  document: (file: File, category = "general") => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    return api.post<UploadFile>(`/api/user/upload/document`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};
