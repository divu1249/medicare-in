import { useState } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import Modal from './Modal';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  categoryTitle: string;
  locationContext: string;
  /** Search term sent to the map (e.g. "emergency hospital"). Falls back to the title. */
  query?: string;
}

export default function MapModal({ open, onClose, categoryTitle, locationContext, query: searchTerm }: MapModalProps) {
  const [zoomLevel, setZoomLevel] = useState(14);

  // All values derived from props live INSIDE the component (module scope has no access to props).
  const query = encodeURIComponent(`${searchTerm || categoryTitle} near ${locationContext}`);
  const embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Live Map: ${categoryTitle}`}
      size="xl"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">Approximate, unverified results. Opening a map does not contact anyone.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline">Close</button>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Navigation className="mr-1.5 h-4 w-4" /> Get Directions
            </a>
            <a href={externalMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline hidden sm:inline-flex">
              <ExternalLink className="mr-1.5 h-4 w-4" /> Open Maps
            </a>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-emerald-600" /> Results near: <strong>{locationContext}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Zoom out" onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
              className="rounded border border-slate-200 bg-white px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-700">-</button>
            <span className="text-[11px]">Zoom</span>
            <button type="button" aria-label="Zoom in" onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
              className="rounded border border-slate-200 bg-white px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-700">+</button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Opening this map sends the search and location text above to Google Maps. Facility data is not verified in real time.
        </p>
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
          {!navigator.onLine && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              You appear to be offline. Maps need an internet connection. For emergencies, dial 112.
            </div>
          )}
          <iframe
            title={`Map of ${categoryTitle}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Modal>
  );
}
