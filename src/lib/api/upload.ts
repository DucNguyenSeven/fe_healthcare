import api from "./client";

export const api_url_upload = "api/v1/upload";

export interface UploadResponse {
    imageUrls: string[];
    publicIds: string[];
}

export const uploadMultipleImage = async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    const result = await api.post<UploadResponse>(`${api_url_upload}/multiple`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return result.data;
};