import { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import Modal from './Modal';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  categoryTitle: string;
  locationContext: string;
}

// The query string for the embedded iframe (shows pins)
const searchQuery = encodeURIComponent(`${categoryTitle} near ${locationContext}`);
const mapUrl = `https://maps.google.com/maps?q=${searchQuery}&t=m&z=14&output=embed`;
  
// NEW: Direct turn-by-turn navigation link using the user's live location
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`;

export default function MapModal({ open, onClose, categoryTitle, locationContext }: MapModalProps) {
  const [zoomLevel, setZoomLevel] = useState(14);
  const mapUrl = `https://maps.google.com/maps?q=${searchQuery}&t=m&z=14&output=embed`;
  const encodedQuery = encodeURIComponent(`${categoryTitle} near ${locationContext}`);
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Live Map: ${categoryTitle} (${locationContext})`}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">Approximate, unverified facility results.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline">Close Map</button>
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Full Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs text-gray-600 dark:bg-slate-800 dark:text-gray-300">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-primary-500" /> Showing map results for: <strong>{locationContext}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
              className="rounded border border-gray-200 bg-white px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-700"
            >
              -
            </button>
            <span className="text-[11px]">Zoom</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
              className="rounded border border-gray-200 bg-white px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-700"
            >
              +
            </button>
          </div>
        </div>
	<div className="flex items-center gap-2">
            {/* New Directions Button */}
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-sm">
              <Navigation className="h-3.5 w-3.5" /> Get Directions
            </a>
            
            <a href={`https://www.google.com/maps/search/?api=1&query=${searchQuery}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline py-2 px-3 text-xs hidden sm:flex items-center justify-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Open Maps
            </a>
          </div>
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-900">
          <iframe
            title={`Map of ${categoryTitle}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Modal>
  );
}
