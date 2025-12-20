import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  audioBuffer?: AudioBuffer;
  color?: string;
  height?: number;
}

export function WaveformDisplay({ audioBuffer, color = '#10b981', height = 60 }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const canvasHeight = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = canvasHeight / 2;

    ctx.clearRect(0, 0, width, canvasHeight);
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < width; i++) {
      const min = Math.min(...Array.from(data.slice(i * step, (i + 1) * step)));
      const max = Math.max(...Array.from(data.slice(i * step, (i + 1) * step)));
      
      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;

      if (i === 0) {
        ctx.moveTo(i, y1);
      }
      ctx.lineTo(i, y1);
      ctx.lineTo(i, y2);
    }

    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.stroke();

  }, [audioBuffer, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}
