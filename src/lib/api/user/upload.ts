// REQUIRES JWT – token forwarded from cookie access_token
import type { UploadFile } from "@/lib/api/types";

export const UploadApi = {
  single: (file: File, folder = "HealthCare") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return fetch(`/api/user/upload/single`, { method: "POST", body: form })
      .then(async (res) => {
        if (!res.ok) throw new Error(`ApiError ${res.status}`);
        return (await res.json()) as UploadFile;
      });
  },

  multiple: (files: File[], folder = "HealthCare") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);
    return fetch(`/api/user/upload/multiple`, { method: "POST", body: form })
      .then(async (res) => {
        if (!res.ok) throw new Error(`ApiError ${res.status}`);
        return (await res.json()) as UploadFile;
      });
  },

  delete: (publicId: string) =>
    fetch(`/api/user/upload/${encodeURIComponent(publicId)}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`ApiError ${res.status}`);
        return res.text(); // "File deleted successfully"
      }),

  avatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`/api/user/upload/avatar`, { method: "POST", body: form })
      .then(async (res) => {
        if (!res.ok) throw new Error(`ApiError ${res.status}`);
        return (await res.json()) as UploadFile;
      });
  },

  document: (file: File, category = "general") => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    return fetch(`/api/user/upload/document`, { method: "POST", body: form })
      .then(async (res) => {
        if (!res.ok) throw new Error(`ApiError ${res.status}`);
        return (await res.json()) as UploadFile;
      });
  },
};
