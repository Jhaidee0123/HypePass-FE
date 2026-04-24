import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

type Props = {
  active: boolean;
  onDecode: (value: string) => void;
  onError?: (msg: string) => void;
};

/**
 * Minimal QR scanner using the browser camera + jsqr. Runs a requestAnimationFrame
 * loop reading a hidden <canvas>. Stops when `active=false` or when the parent
 * cancels the component. Camera permission is requested on mount.
 */
const QrScanner: React.FC<Props> = ({ active, onDecode, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        v.setAttribute('playsinline', 'true');
        await v.play();
        setReady(true);
        tick();
      } catch (err: any) {
        onError?.(err?.message ?? 'camera_error');
      }
    };

    const tick = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.readyState !== v.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, c.width, c.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code?.data) {
        onDecode(code.data);
        return; // parent is expected to set active=false after a decode
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    void start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setReady(false);
    };
  }, [active, onDecode, onError]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        maxWidth: 420,
        margin: '0 auto 16px',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#000',
        border: '1px solid #34312c',
      }}
    >
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: ready ? 'block' : 'none',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bfbab1',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Accediendo a la cámara…
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          inset: '15%',
          border: '2px solid #d7ff3a',
          borderRadius: 8,
          pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
        }}
      />
    </div>
  );
};

export default QrScanner;
