"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import Image from "next/image";

type UploadingFile = {
  file: File;
  progress: number;
};

export default function Home() {
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter(); 

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
    const newUploads = acceptedFiles.map((file) => ({ file, progress: 0 }));
    setUploads((prev) => [...prev, ...newUploads]);

    try {
      await Promise.all(acceptedFiles.map((file) => uploadFile(file)));
      setSuccess(true);
      setTimeout(() => { router.push("/gallery"); }, 2000);
    } catch (error) {
      console.error("Upload failed", error);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    // ADD THESE TWO LINES BELOW:
    useFsAccessApi: false, 
    inputProps: { capture: "environment" } as any
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4">
      {/* The White Card */}
      <div className="max-w-md w-full bg-white border-2 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] p-8 text-center">
        
        {/* PROFILE PICTURE SECTION */}
        <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-rose-100 shadow-sm">
          <Image 
            src="/20241207_104607.jpeg" 
            alt="Moses and Spouse" 
            fill 
            className="object-cover object-[center_20%]" 
            priority // This helps the image load faster on mobile
          />
        </div>

        <h1 className="text-2xl font-semibold mb-1 text-gray-800"> Moses Wedding 💍</h1>
        <p className="text-gray-500 mb-6 font-light">Upload your memories from our special day</p>

        {/* UPLOAD BOX */}
        <div
  {...getRootProps()}
  className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all
    ${isDragActive ? "border-black bg-stone-50" : "border-gray-300 hover:border-black"}
  `}
>
  <input {...getInputProps()} />
  
  <div className="flex flex-col items-center gap-4">
    {/* TWO OPTIONS UI */}
    <div className="flex justify-center gap-8 mb-2">
      <div className="flex flex-col items-center">
        <span className="text-4xl mb-2">📸</span>
        <span className="text-xs font-bold uppercase tracking-tighter text-black">Snap Now</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-4xl mb-2">🖼️</span>
        <span className="text-xs font-bold uppercase tracking-tighter text-black"> Upload From Gallery</span>
      </div>
    </div>

    <p className="text-gray-500 text-sm font-light italic">
      {isDragActive ? "Drop them here!" : "Tap to capture or choose memories"}
    </p>
  </div>
</div>

        {/* PROGRESS LIST */}
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
          <p className="mt-6 text-green-600 font-medium animate-pulse">
            🎉 Upload complete! Taking you to the gallery...
          </p>
        )}
      </div>

      {/* VIEW GALLERY BUTTON */}
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