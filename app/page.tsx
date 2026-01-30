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
        
        // 1. Capture the 'key' sent back by the API
        const { uploadUrl, key } = await res.json(); 
  
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
  
        // ... (keep your progress logic)
  
        xhr.onload = () => {
          if (xhr.status === 200) {
            // 2. SAVE THE KEY (uuid-filename.jpg), NOT THE ORIGINAL FILE NAME
            const existing = JSON.parse(localStorage.getItem("my-wedding-uploads") || "[]");
            localStorage.setItem("my-wedding-uploads", JSON.stringify([...existing, key]));
            
            resolve(true);
          } else {
            reject();
          }
        };
        // ... rest of the function
        
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
      // Give them a second to see the success message before redirecting
      setTimeout(() => { router.push("/gallery"); }, 2000);
    } catch (error) {
      console.error("Upload failed", error);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-10">
      
      {/* The B&W Theme Card */}
      <div className="max-w-md w-full bg-white border-2 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] p-8 text-center">
        
        {/* PROFILE PICTURE SECTION */}
        <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-black shadow-sm bg-gray-100">
          <Image 
            src="/robynandromano.jpeg" 
            alt="Moses and Spouse" 
            fill 
            className="object-cover object-[center_20%]" 
            priority 
          />
        </div>

        <h1 className="text-3xl font-bold mb-1 text-black uppercase tracking-widest">Moses Wedding 💍</h1>
        <p className="text-gray-500 mb-8 font-light italic">Capture a moment for our digital guestbook</p>

        {/* UPLOAD BOX */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all
            ${isDragActive ? "border-black bg-stone-50 scale-95" : "border-gray-300 hover:border-black"}
          `}
        >
          {/* capture="environment" forces the camera option on mobile */}
          <input {...getInputProps({ capture: "environment" })} />
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-10">
              <div className="flex flex-col items-center group">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-black">Snap Now</span>
              </div>
              
              <div className="flex flex-col items-center group">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-black">From Gallery</span>
              </div>
            </div>

            <p className="text-gray-400 text-xs font-medium">
              {isDragActive ? "Release to upload" : "Tap to capture or select photos"}
            </p>
          </div>
        </div>

        {/* PROGRESS LIST */}
        {uploads.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploads.map((u, i) => (
              <div key={i} className="text-left">
                <p className="text-[10px] truncate font-bold uppercase text-gray-400">{u.file.name}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-black h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {success && (
          <div className="mt-6 p-3 bg-green-50 rounded-xl">
            <p className="text-green-600 text-sm font-bold uppercase tracking-tighter animate-pulse">
              🎉 Memories Saved! Redirecting...
            </p>
          </div>
        )}
      </div>

      {/* VIEW GALLERY BUTTON */}
      <div className="mt-8 text-center">
        <Link 
          href="/gallery" 
          className="inline-block bg-black text-white px-10 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
        >
          View Guest Gallery ✨
        </Link>
      </div>
    </main>
  );
}