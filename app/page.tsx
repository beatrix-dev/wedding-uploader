"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link"; // Required for the button
import { useRouter } from "next/navigation"; // Required for the auto-redirect

type UploadingFile = {
  file: File;
  progress: number;
};

export default function Home() {
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter(); // Initialize the "navigation helper"

  // Helper function to handle S3 upload with progress
  const uploadFile = (file: File) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const { uploadUrl } = await res.json();

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.file === file ? { ...u, progress: percentComplete } : u))
            );
          }
        };

        xhr.onload = () => (xhr.status === 200 ? resolve(true) : reject());
        xhr.onerror = () => reject();
        xhr.send(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setSuccess(false);

    const newUploads = acceptedFiles.map((file) => ({
      file,
      progress: 0,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    try {
      await Promise.all(acceptedFiles.map((file) => uploadFile(file)));
      setSuccess(true);
      
      // OPTIONAL: Automatically send them to the gallery after 2 seconds
      setTimeout(() => {
        router.push("/gallery");
      }, 2000);

    } catch (error) {
      console.error("Upload failed", error);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 text-center">
        <h1 className="text-2xl font-semibold mb-1">Moses Wedding 💍</h1>
        <p className="text-gray-500 mb-6">Upload your memories from our special day</p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition
            ${isDragActive ? "border-rose-400 bg-rose-50" : "border-gray-300"}
          `}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">📸 Tap or drop photos here</p>
        </div>

        {uploads.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploads.map((u, i) => (
              <div key={i} className="text-left">
                <p className="text-sm truncate font-medium text-gray-700">{u.file.name}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div
                    className="bg-rose-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {success && (
          <p className="mt-6 text-green-600 font-medium animate-bounce">
            🎉 Upload complete — Taking you to the gallery...
          </p>
        )}
      </div>

      {/* VIEW GALLERY BUTTON - Placed outside the white box for a clean look */}
      <div className="mt-8 text-center">
        <Link 
          href="/gallery" 
          className="inline-block bg-white text-rose-400 border border-rose-400 px-8 py-3 rounded-full font-medium hover:bg-rose-400 hover:text-white transition-all shadow-sm"
        >
          View Guest Gallery ✨
        </Link>
      </div>
    </main>
  );
}