import { X, MapPin, ExternalLink } from 'lucide-react';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  categoryTitle: string;
  locationContext: string;
}

export default function MapModal({ open, onClose, categoryTitle, locationContext }: MapModalProps) {
  if (!open) return null;

  const searchQuery = encodeURIComponent(`${categoryTitle} near ${locationContext}`);
  const mapUrl = `https://www.google.com/maps?q=${searchQuery}&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{categoryTitle}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Searching near: {locationContext}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={externalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline py-1.5 px-3 text-xs hidden sm:flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in Maps App
            </a>
            <button 
              onClick={onClose} 
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Map Frame */}
        <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-800 min-h-[50vh] sm:min-h-[60vh]">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            title={`Map showing ${categoryTitle}`}
          />
        </div>
      </div>
    </div>
  );
}