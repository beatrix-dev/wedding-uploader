"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function GuestGallery() {
  const [photos, setPhotos] = useState<{url: string, key: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos") // This calls the API we wrote to list S3 objects
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-20">Loading memories... ✨</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-serif text-center my-10">Our Wedding Gallery</h1>
      
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <div key={photo.key} className="break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform">
            <img 
              src={photo.url} 
              alt="Wedding guest upload"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      {photos.length === 0 && (
        <p className="text-center text-gray-500">No photos yet. Be the first to upload! 📸</p>
      )}
    </div>
  );
}