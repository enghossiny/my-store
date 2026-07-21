'use client';

import { useState } from 'react';

type Props = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const hasImages = images && images.length > 0;

  return (
    <>
      {/* Zoom modal */}
      {zoomed && hasImages && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setZoomed(false)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', borderRadius: '999px',
              width: '40px', height: '40px',
              cursor: 'pointer', fontSize: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); }}
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                borderRadius: '999px', width: '44px', height: '44px',
                cursor: 'pointer', fontSize: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
          )}

          <img
            src={images[selected]}
            alt={name}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              objectFit: 'contain', borderRadius: '12px',
            }}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); }}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                borderRadius: '999px', width: '44px', height: '44px',
                cursor: 'pointer', fontSize: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: '1.5rem',
              left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.5)', color: '#fff',
              padding: '6px 16px', borderRadius: '999px', fontSize: '13px',
            }}>
              {selected + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      <div>
        {/* Main image */}
        <div
          onClick={() => hasImages && setZoomed(true)}
          style={{
            width: '100%', aspectRatio: '1',
            background: 'linear-gradient(135deg, #f8f7ff, #ede9ff)',
            borderRadius: '20px', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '80px', marginBottom: '12px',
            cursor: hasImages ? 'zoom-in' : 'default',
            position: 'relative',
            border: '1px solid #f3f4f6',
            boxShadow: '0 8px 30px rgba(108,99,255,0.1)',
          }}
        >
          {hasImages ? (
            <>
              <img
                src={images[selected]}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Zoom hint */}
              <div style={{
                position: 'absolute', bottom: '12px', right: '12px',
                background: 'rgba(0,0,0,0.5)', color: '#fff',
                borderRadius: '8px', padding: '4px 10px',
                fontSize: '12px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                🔍 {images.length > 1 ? `1/${images.length}` : 'Zoom'}
              </div>

              {/* Arrows for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); }}
                    style={{
                      position: 'absolute', left: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none', borderRadius: '999px',
                      width: '36px', height: '36px',
                      cursor: 'pointer', fontSize: '18px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >‹</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); }}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none', borderRadius: '999px',
                      width: '36px', height: '36px',
                      cursor: 'pointer', fontSize: '18px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >›</button>
                </>
              )}
            </>
          ) : (
            <span>🛍️</span>
          )}
        </div>

        {/* Thumbnails */}
        {images && images.length > 1 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`,
            gap: '8px',
          }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px', overflow: 'hidden',
                  cursor: 'pointer',
                  border: selected === i
                    ? '3px solid #6c63ff'
                    : '2px solid #e5e7eb',
                  transition: 'all 0.2s',
                  boxShadow: selected === i ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                  transform: selected === i ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <img
                  src={img}
                  alt={`${name} ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Dot indicators for mobile */}
        {images && images.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: '6px', marginTop: '12px',
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  width: selected === i ? '20px' : '8px',
                  height: '8px', borderRadius: '999px', border: 'none',
                  background: selected === i ? '#6c63ff' : '#e5e7eb',
                  cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}