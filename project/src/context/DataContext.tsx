import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Medication,
  DoseRecord,
  RefillEvent,
  PatientProfile,
  LabReport,
  VisitRecord,
  MedicalReport,
  Bookmark,
  ChatMessage,
  AppSettings,
  DoseStatus,
} from '@/types';
import {
  defaultProfile,
  defaultMedications,
  defaultDoses,
  defaultRefills,
  defaultLabReports,
  defaultVisits,
  defaultReports,
  defaultSettings,
} from '@/data/demoData';
import { getTheme, setTheme } from '@/lib/theme';

const KEYS = {
  profile: 'medicare-profile',
  medications: 'medicare-medications',
  doses: 'medicare-doses',
  refills: 'medicare-refills',
  labs: 'medicare-labs',
  visits: 'medicare-visits',
  reports: 'medicare-reports',
  bookmarks: 'medicare-bookmarks',
  chat: 'medicare-chat',
  settings: 'medicare-settings',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or blocked */
  }
}

export interface DataContextValue {
  profile: PatientProfile;
  setProfile: (p: PatientProfile) => void;
  medications: Medication[];
  addMedication: (m: Medication) => void;
  updateMedication: (m: Medication) => void;
  deleteMedication: (id: string) => void;
  doses: DoseRecord[];
  addDose: (d: DoseRecord) => void;
  updateDose: (id: string, patch: Partial<DoseRecord>) => void;
  setDoseStatus: (id: string, status: DoseStatus, source?: DoseRecord['source']) => void;
  refills: RefillEvent[];
  addRefill: (r: RefillEvent) => void;
  labs: LabReport[];
  visits: VisitRecord[];
  reports: MedicalReport[];
  addReport: (r: MedicalReport) => void;
  bookmarks: Bookmark[];
  toggleBookmark: (articleId: string) => void;
  chat: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PatientProfile>(() => load(KEYS.profile, defaultProfile));
  const [medications, setMedications] = useState<Medication[]>(() => load(KEYS.medications, defaultMedications));
  const [doses, setDoses] = useState<DoseRecord[]>(() => load(KEYS.doses, defaultDoses));
  const [refills, setRefills] = useState<RefillEvent[]>(() => load(KEYS.refills, defaultRefills));
  const [labs] = useState<LabReport[]>(() => load(KEYS.labs, defaultLabReports));
  const [visits] = useState<VisitRecord[]>(() => load(KEYS.visits, defaultVisits));
  const [reports, setReports] = useState<MedicalReport[]>(() => load(KEYS.reports, defaultReports));
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => load(KEYS.bookmarks, []));
  const [chat, setChat] = useState<ChatMessage[]>(() => load(KEYS.chat, []));
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...defaultSettings, ...load(KEYS.settings, {}) as Partial<AppSettings> }));

  useEffect(() => save(KEYS.profile, profile), [profile]);
  useEffect(() => save(KEYS.medications, medications), [medications]);
  useEffect(() => save(KEYS.doses, doses), [doses]);
  useEffect(() => save(KEYS.refills, refills), [refills]);
  useEffect(() => save(KEYS.reports, reports), [reports]);
  useEffect(() => save(KEYS.bookmarks, bookmarks), [bookmarks]);
  useEffect(() => save(KEYS.chat, chat), [chat]);
  useEffect(() => save(KEYS.settings, settings), [settings]);

  const setProfile = useCallback((p: PatientProfile) => setProfileState(p), []);

  const addMedication = useCallback((m: Medication) => setMedications((prev) => [...prev, m]), []);
  const updateMedication = useCallback((m: Medication) => setMedications((prev) => prev.map((x) => (x.id === m.id ? m : x))), []);
  const deleteMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((x) => x.id !== id));
    setDoses((prev) => prev.filter((d) => d.medicationId !== id));
  }, []);

  const addDose = useCallback((d: DoseRecord) => setDoses((prev) => [...prev, d]), []);
  const updateDose = useCallback((id: string, patch: Partial<DoseRecord>) =>
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))), []);
  const setDoseStatus = useCallback((id: string, status: DoseStatus, source: DoseRecord['source'] = 'manual') =>
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, status, source, confirmedAt: status === 'taken' ? new Date().toISOString() : null } : d))), []);

  const addRefill = useCallback((r: RefillEvent) => setRefills((prev) => [...prev, r]), []);

  const addReport = useCallback((r: MedicalReport) => setReports((prev) => [r, ...prev]), []);

  const toggleBookmark = useCallback((articleId: string) =>
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.articleId === articleId);
      return exists ? prev.filter((b) => b.articleId !== articleId) : [...prev, { id: `bm-${Date.now()}`, articleId, savedDate: new Date().toISOString() }];
    }), []);

  const addChatMessage = useCallback((m: ChatMessage) => setChat((prev) => [...prev, m]), []);
  const clearChat = useCallback(() => setChat([]), []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.theme) setTheme(patch.theme);
      return next;
    });
  }, []);

  const resetDemoData = useCallback(() => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setProfileState(defaultProfile);
    setMedications(defaultMedications);
    setDoses(defaultDoses);
    setRefills(defaultRefills);
    setReports(defaultReports);
    setBookmarks([]);
    setChat([]);
    setSettings(defaultSettings);
    setTheme(defaultSettings.theme);
  }, []);

  const value: DataContextValue = {
    profile,
    setProfile,
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    doses,
    addDose,
    updateDose,
    setDoseStatus,
    refills,
    addRefill,
    labs,
    visits,
    reports,
    addReport,
    bookmarks,
    toggleBookmark,
    chat,
    addChatMessage,
    clearChat,
    settings,
    updateSettings,
    resetDemoData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export { getTheme };
