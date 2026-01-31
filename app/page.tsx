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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 15) {
        alert("Please upload a maximum of 15 photos at a time.");
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
    // Restored the pastel gradient background
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-10">
      
      {/* Main White Card with sharp black shadow */}
      <div className="max-w-md w-full bg-white border-2 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
        
        <h1 className="text-3xl font-black mb-1 text-black uppercase tracking-widest">Moses Wedding</h1>
        <p className="text-gray-500 mb-6 font-medium italic">Share your perspective of our day</p>

        {/* FEATURE PHOTO: Acting as a visual anchor */}
        <div className="relative group w-full aspect-square rounded-[30px] overflow-hidden border-2 border-black mb-6 shadow-inner bg-gray-200">
            <Image 
                src="/robynandromano.jpeg" 
                alt="The Happy Couple" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority 
            />
            
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center">
                <p className="text-white font-bold text-[10px] uppercase tracking-[0.3em] drop-shadow-md">Capture the magic</p>
            </div>
        </div>

        {/* HIDDEN INPUTS */}
        <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input id="gallery-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

        {/* BUTTON GRID */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => document.getElementById('camera-input')?.click()}
            className="flex flex-col items-center justify-center border-2 border-black rounded-2xl py-5 hover:bg-black hover:text-white transition-all active:scale-95 bg-white"
          >
            <span className="text-3xl mb-1">📸</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Snap Now</span>
          </button>

          <button
            onClick={() => document.getElementById('gallery-input')?.click()}
            className="flex flex-col items-center justify-center border-2 border-black rounded-2xl py-5 hover:bg-black hover:text-white transition-all active:scale-95 bg-white"
          >
            <span className="text-3xl mb-1">🖼️</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
          </button>
        </div>

        {/* PROGRESS LIST */}
        {uploads.length > 0 && (
          <div className="mt-8 space-y-3 bg-stone-50/50 p-4 rounded-2xl border border-black/5">
            {uploads.map((u) => (
              <div key={u.id} className="text-left">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] truncate font-bold uppercase text-gray-400 max-w-[150px]">{u.file.name}</p>
                    <p className="text-[9px] font-black text-black">{u.progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-black h-1 rounded-full transition-all duration-300" style={{ width: `${u.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-black rounded-2xl animate-pulse">
            <p className="text-white text-xs font-black uppercase tracking-widest">
              ✨ Memories Uploaded!
            </p>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="mt-10">
        <Link 
          href="/gallery" 
          className="text-black font-black text-sm uppercase tracking-[0.3em] border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
        >
          View Gallery
        </Link>
      </div>
    </main>
  );
}