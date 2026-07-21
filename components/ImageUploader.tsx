'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  onUpload: (url: string) => void;
  label?: string;
};

export default function ImageUploader({ onUpload, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setLastUploaded(null);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Please select image files only');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large — max 5MB`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file);

      if (uploadError) {
        setError(`Failed to upload ${file.name}`);
        continue;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      setLastUploaded(data.publicUrl);
      onUpload(data.publicUrl);
    }

    setUploading(false);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div>
      <label style={{
        display: 'block',
        border: '2px dashed #c4b5fd',
        borderRadius: '12px',
        padding: '1.25rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: '#faf8ff',
        transition: 'border-color 0.2s, background 0.2s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLLabelElement).style.borderColor = '#6c63ff';
          (e.currentTarget as HTMLLabelElement).style.background = '#f3f0ff';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLLabelElement).style.borderColor = '#c4b5fd';
          (e.currentTarget as HTMLLabelElement).style.background = '#faf8ff';
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>⏳</div>
            <p style={{ margin: 0, color: '#6c63ff', fontWeight: '600', fontSize: '14px' }}>
              Uploading...
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>📸</div>
            <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#1a1a2e', fontSize: '14px' }}>
              {label ?? 'Click to upload images'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              PNG, JPG, WEBP — max 5MB each — multiple allowed
            </p>
          </div>
        )}
      </label>

      {lastUploaded && !uploading && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
          ✅ Uploaded successfully — click above to add more
        </p>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>❌ {error}</p>
      )}
    </div>
  );
}