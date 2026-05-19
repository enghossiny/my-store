'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  onUpload: (url: string) => void;
};

export default function ImageUploader({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    // Create unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, file);

    if (uploadError) {
      setError('Upload failed, please try again');
      setUploading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);

    setPreview(data.publicUrl);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      {/* Upload area */}
      <label style={{
        display: 'block',
        border: '2px dashed #c4b5fd',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: preview ? '#fff' : '#faf8ff',
        transition: 'border-color 0.2s',
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <p style={{ margin: 0, color: '#6c63ff', fontWeight: '600' }}>Uploading...</p>
          </div>
        ) : preview ? (
          <div>
            <img
              src={preview}
              alt="preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            />
            <p style={{ margin: 0, fontSize: '13px', color: '#6c63ff' }}>
              ✅ Uploaded — click to change
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📸</div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1a1a2e' }}>
              Click to upload image
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              PNG, JPG, WEBP — max 5MB
            </p>
          </div>
        )}
      </label>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  );
}