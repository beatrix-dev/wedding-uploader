"use client";
import { useEffect, useState } from "react";

export default function GuestGallery() {
  const [photos, setPhotos] = useState<{url: string, key: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUploads, setMyUploads] = useState<string[]>([]);

  useEffect(() => {
    // 1. Fetch photos with 'no-store' to ensure new uploads show up immediately
    fetch("/api/photos", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // Sort photos so the newest ones appear at the top
        setPhotos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gallery fetch error:", err);
        setLoading(false);
      });

    // 2. Load the list of "owned" keys from the phone's memory
    const saved = localStorage.getItem("my-wedding-uploads");
    if (saved) {
      setMyUploads(JSON.parse(saved));
    }
  }, []);

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const res = await fetch("/api/photos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        // Remove from the screen
        setPhotos((prev) => prev.filter((p) => p.key !== key));
        // Remove from local memory
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
        <p className="font-serif text-lg italic">Loading memories... ✨</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="flex flex-col items-center my-10">
        <h1 className="text-4xl font-serif text-black text-center">Our Wedding Gallery</h1>
        <div className="w-24 h-1 bg-black mt-4 rounded-full"></div>
      </div>
      
      {photos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 italic">No photos yet. Be the first to capture a moment! 📸</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo) => (
            <div 
              key={photo.key} 
              className="relative group break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-100"
            >
            <img 
              src={photo.url} 
              alt="Wedding moment"
              className="w-full h-auto min-h-[200px] object-cover block bg-gray-200"
              loading="lazy"
              onError={(e) => {
            // This will help you see if the URL is broken
              console.log("Image failed to load:", photo.url);
               }}
              />
              
              {/* DELETE BUTTON: Only visible if the phone 'owns' this UUID key */}
              {myUploads.includes(photo.key) && (
                <button
                  onClick={() => handleDelete(photo.key)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 p-2.5 rounded-full shadow-lg transition-all duration-200 z-10 active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
                  </svg>
                </button>
              )}

              {/* OWNERSHIP INDICATOR (Subtle) */}
              <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest text-white bg-black/40 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {myUploads.includes(photo.key) ? 'Your Photo ✅' : 'Guest Photo'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* BACK BUTTON */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <a 
          href="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-gray-800 transition-all"
        >
          ← Upload More
        </a>
      </div>
    </div>
  );
}