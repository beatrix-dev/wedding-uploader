"use client";

import { useState } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import Image from "next/image";

type UploadingFile = {
  id: string; 
  file: File;
  progress: number;
};

export default function Home() {
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter(); 

  const uploadFile = (file: File, uploadId: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file.size === 0) {
          reject("File is empty");
          return;
        }

        const res = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        
        const { uploadUrl, key } = await res.json(); 
  
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
  
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadId ? { ...u, progress: percentComplete } : u))
            );
          }
        };
  
        xhr.onload = () => {
          if (xhr.status === 200) {
            const existing = JSON.parse(localStorage.getItem("my-wedding-uploads") || "[]");
            if (!existing.includes(key)) {
              localStorage.setItem("my-wedding-uploads", JSON.stringify([...existing, key]));
            }
            resolve(true);
          } else {
            reject();
          }
        };
        
        xhr.onerror = () => reject();
        xhr.send(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  // Unified handler for when files are picked from either input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Optional: Limit to 10 photos to prevent browser crashes
    if (selectedFiles.length > 10) {
        alert("Please upload a maximum of 10 photos at a time.");
        return;
    }

    setSuccess(false);
    
    const newUploads = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0 
    }));
    
    setUploads((prev) => [...prev, ...newUploads]);

    try {
      for (const item of newUploads) {
        await uploadFile(item.file, item.id);
      }
      setSuccess(true);
      setTimeout(() => { router.push("/gallery"); }, 2000);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-10">
      
      <div className="max-w-md w-full bg-white border-2 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] p-8 text-center">
        
        <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-black shadow-sm bg-gray-100">
          <Image 
            src="/robynandromano.jpeg" 
            alt="Moses and Spouse" 
            fill 
            className="object-cover object-[center_30%]" 
            priority 
          />
        </div>

        <h1 className="text-3xl font-bold mb-1 text-black uppercase tracking-widest">Moses Wedding 💍</h1>
        <p className="text-gray-500 mb-8 font-light italic">Capture a moment for our digital guestbook</p>

        {/* HIDDEN INPUTS */}
        {/* Input 1: Forced Camera */}
        <input 
          id="camera-input"
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileChange}
        />
        {/* Input 2: Photo Library (Multiple) */}
        <input 
          id="gallery-input"
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden" 
          onChange={handleFileChange}
        />

        {/* CUSTOM BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => document.getElementById('camera-input')?.click()}
            className="flex flex-col items-center justify-center border-2 border-black rounded-2xl p-6 hover:bg-stone-50 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-5xl mb-3">📸</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Snap Now</span>
          </button>

          <button
            onClick={() => document.getElementById('gallery-input')?.click()}
            className="flex flex-col items-center justify-center border-2 border-black rounded-2xl p-6 hover:bg-stone-50 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-5xl mb-3">🖼️</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Gallery</span>
          </button>
        </div>

        {/* PROGRESS LIST */}
        {uploads.length > 0 && (
          <div className="mt-8 space-y-3">
            {uploads.map((u) => (
              <div key={u.id} className="text-left">
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