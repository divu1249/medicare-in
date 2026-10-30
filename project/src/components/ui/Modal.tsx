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
  const mapUrl = `https://maps.google.com/maps?q=${searchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] sm:max-h-[90vh]">
        
        {/* Mobile-responsive header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 gap-3">
          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{categoryTitle}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Near: {locationContext}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline py-2 px-3 text-xs flex-1 sm:flex-none flex items-center justify-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Open Maps App
            </a>
          </div>

          <button onClick={onClose} className="absolute right-3 top-4 sm:static rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors bg-white/80 dark:bg-slate-900/80 sm:bg-transparent backdrop-blur-sm">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Map Frame */}
        <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-800 min-h-[50vh]">
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