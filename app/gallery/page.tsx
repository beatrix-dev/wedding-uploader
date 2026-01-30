"use client";
import { useEffect, useState } from "react";

export default function GuestGallery() {
  const [photos, setPhotos] = useState<{url: string, key: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUploads, setMyUploads] = useState<string[]>([]);

  useEffect(() => {
    // 1. Fetch photos
    fetch("/api/photos")
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      });

    // 2. Check local memory for "owned" photos
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
        setPhotos((prev) => prev.filter((p) => p.key !== key));
        // Update local memory too
        const updated = myUploads.filter(k => k !== key);
        setMyUploads(updated);
        localStorage.setItem("my-wedding-uploads", JSON.stringify(updated));
      } else {
        alert("Failed to delete. It might be protected.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div className="text-center p-20">Loading memories... ✨</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-serif text-center my-10">Our Wedding Gallery</h1>
      
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <div key={photo.key} className="relative group break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-black">
            <img 
              src={photo.url} 
              alt="Wedding guest upload"
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
            
            {/* DELETE BUTTON: Only visible to the uploader */}
            {myUploads.includes(photo.key) && (
              <button
                onClick={() => handleDelete(photo.key)}
                className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 p-2 rounded-full shadow-md transition-colors"
                title="Delete your photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {photos.length === 0 && (
        <p className="text-center text-gray-500">No photos yet. Be the first to upload! 📸</p>
      )}
    </div>
  );
}