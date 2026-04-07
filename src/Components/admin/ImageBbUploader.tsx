"use client";

import { useState } from "react";

type ImageBbUploaderProps = {
  onUploaded?: (url: string) => void;
};

type ImageBbResponse = {
  data?: {
    url?: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
  success?: boolean;
};

export default function ImageBbUploader({ onUploaded }: Readonly<ImageBbUploaderProps>) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!apiKey.trim()) {
      setError("ImageBB API key is required.");
      return;
    }

    if (!file) {
      setError("Please choose an image file.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey.trim())}`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ImageBbResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Image upload failed.");
      }

      const url = payload.data?.display_url || payload.data?.url;
      if (!url) {
        throw new Error("Image URL was not returned by ImageBB.");
      }

      setUploadedUrl(url);
      onUploaded?.(url);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Image upload failed.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
      <h3 className="text-sm font-semibold text-on-surface">ImageBB Uploader</h3>
      <div className="mt-3 space-y-3">
        {apiKey ? null : <p className="text-xs text-red-500">Set NEXT_PUBLIC_IMGBB_API_KEY in .env to upload images.</p>}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        <button
          type="button"
          onClick={() => {
            void handleUpload();
          }}
          disabled={isUploading}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {uploadedUrl ? (
        <div className="mt-3 rounded-xl border border-outline-variant/40 bg-surface p-3 text-xs text-on-surface-variant">
          <p className="font-semibold text-on-surface">Uploaded URL</p>
          <p className="mt-1 break-all">{uploadedUrl}</p>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
