import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Undo2, PenTool, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string | null) => void;
  width?: number;
  height?: number;
  label?: string;
  disabled?: boolean;
  existingSignature?: string | null;
}

/**
 * Signature pad component using HTML5 Canvas.
 * Supports mouse and touch drawing with smooth bezier curves.
 */
const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  width = 400,
  height = 160,
  label = 'Ký tên tại đây',
  disabled = false,
  existingSignature = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!existingSignature);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(width);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth - 2, width);
        setCanvasWidth(w);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width]);

  // Draw existing signature if provided
  useEffect(() => {
    if (existingSignature && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasWidth, height);
        ctx.drawImage(img, 0, 0, canvasWidth, height);
      };
      img.src = existingSignature;
    }
  }, [existingSignature, canvasWidth, height]);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      // Save state for undo
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokeHistory((prev) => [...prev.slice(-20), imageData]);

      const point = getCanvasPoint(e);
      lastPointRef.current = point;
      setIsDrawing(true);

      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#1a1a2e';
    },
    [disabled, getCanvasPoint]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      e.preventDefault();
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const point = getCanvasPoint(e);
      const last = lastPointRef.current;

      if (last) {
        // Smooth bezier curve
        const midX = (last.x + point.x) / 2;
        const midY = (last.y + point.y) / 2;
        ctx.quadraticCurveTo(last.x, last.y, midX, midY);
        ctx.stroke();
      }

      lastPointRef.current = point;
    },
    [isDrawing, disabled, getCanvasPoint]
  );

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  }, [isDrawing, onSignatureChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setStrokeHistory([]);
    onSignatureChange(null);
  }, [onSignatureChange]);

  const undoStroke = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || strokeHistory.length === 0) return;
    const lastState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));

    // Check if canvas is now blank
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isBlank = !imageData.data.some((ch, i) => i % 4 === 3 && ch !== 0);
    if (isBlank) {
      setHasSignature(false);
      onSignatureChange(null);
    } else {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  }, [strokeHistory, onSignatureChange]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-indigo-500" />
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {hasSignature && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <Check className="w-3 h-3" />
              Đã ký
            </span>
          )}
          <button
            type="button"
            onClick={undoStroke}
            disabled={disabled || strokeHistory.length === 0}
            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Hoàn tác nét cuối"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={disabled || !hasSignature}
            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Xóa chữ ký"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isDrawing
            ? 'border-indigo-400 bg-indigo-50/30'
            : hasSignature
            ? 'border-emerald-300 bg-white'
            : 'border-gray-300 bg-white hover:border-indigo-300'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth * 2}
          height={height * 2}
          style={{ width: canvasWidth, height, touchAction: 'none' }}
          className="block cursor-crosshair rounded-xl"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm select-none">
              ✍️ Dùng chuột hoặc ngón tay để ký
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureCanvas;
