import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, title, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 truncate">
              {title || 'Image Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="maths-attachment.png"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Open full size"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-950">
          <img
            src={imageUrl}
            alt={title || 'Attached diagram'}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
          />
        </div>
      </div>
    </div>
  );
};
