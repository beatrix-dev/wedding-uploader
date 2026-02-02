"use client";
import { useEffect, useState } from "react";

export default function GuestGallery() {
  const [photos, setPhotos] = useState<{url: string, key: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUploads, setMyUploads] = useState<string[]>([]);
  
  // LIGHTBOX STATE
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/photos", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gallery fetch error:", err);
        setLoading(false);
      });

    const saved = localStorage.getItem("my-wedding-uploads");
    if (saved) {
      setMyUploads(JSON.parse(saved));
    }
  }, []);

  const handleDelete = async (e: React.MouseEvent, key: string) => {
    e.stopPropagation(); // Prevent the lightbox from opening when clicking delete
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const res = await fetch("/api/photos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.key !== key));
        const updated = myUploads.filter(k => k !== key);
        setMyUploads(updated);
        localStorage.setItem("my-wedding-uploads", JSON.stringify(updated));
      } else {
        alert("Could not delete. You might not have permission.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="font-serif text-lg italic text-black">Loading memories... ✨</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20 bg-stone-50 min-h-screen">
      <div className="flex flex-col items-center my-10">
        <h1 className="text-4xl font-serif text-black text-center uppercase tracking-tighter">Guest Gallery</h1>
        <div className="w-16 h-0.5 bg-black mt-2 opacity-20"></div>
      </div>
      
      {photos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 italic">No photos yet. Be the first! 📸</p>
        </div>
      ) : (
        /* 3-COLUMN GRID: aspect-square ensures a clean look */
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.key} 
              onClick={() => setSelectedPhoto(photo.url)}
              className="relative aspect-square cursor-pointer overflow-hidden bg-gray-200 group active:scale-95 transition-transform"
            >
              <img 
                src={photo.url} 
                alt="Wedding moment"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* DELETE BUTTON */}
              {myUploads.includes(photo.key) && (
                <button
                  onClick={(e) => handleDelete(e, photo.key)}
                  className="absolute top-2 right-2 bg-white/80 text-black p-1.5 rounded-full shadow-md z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close indicator for guests */}
          <div className="absolute top-6 right-6 text-white/70 text-sm font-bold tracking-widest uppercase">
            Close ✕
          </div>
          
          <img 
            src={selectedPhoto} 
            alt="Full screen view" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-200"
          />
        </div>
      )}

      {/* BACK BUTTON */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <a 
          href="/" 
          className="bg-black text-white px-10 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          ← Capture More
        </a>
      </div>
    </div>
  );
}