import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadedDocument = {
  url: string;
  publicId: string;
};

export function isAllowedDocumentFile(file: File): { ok: true } | { ok: false; reason: string } {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return { ok: false, reason: "Only PDF, JPG, JPEG, PNG, and WEBP files are allowed." };
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { ok: false, reason: "File size must not exceed 5MB." };
  }
  return { ok: true };
}

export async function uploadDocumentToCloudinary(
  file: File,
  folder: string
): Promise<UploadedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer());

  // PDFs are uploaded as "raw" rather than "image" (what resource_type: "auto"
  // would pick). Cloudinary blocks inline delivery of PDFs stored as "image"
  // by default as an anti-XSS measure, which surfaces as an HTTP 401 when
  // opening the document URL. "raw" delivery isn't subject to that restriction.
  const resourceType = file.type === "application/pdf" ? "raw" : "image";

  return new Promise<UploadedDocument>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}
