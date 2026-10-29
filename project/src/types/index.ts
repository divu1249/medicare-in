export type DoseStatus =
  | 'scheduled'
  | 'taken'
  | 'skipped'
  | 'not_confirmed'
  | 'missed';

export type MonitoringStatus =
  | 'scheduled'
  | 'monitoring'
  | 'waiting'
  | 'movement_detected'
  | 'review'
  | 'confirmed'
  | 'not_confirmed'
  | 'missed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  times: string[];
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  quantity: number;
  quantityPerDose: number;
  lowStockThreshold: number;
  expiryDate: string;
  notes: string;
  pharmacy: string;
  createdAt: string;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledDate: string;
  scheduledTime: string;
  dosage: string;
  status: DoseStatus;
  confirmedAt: string | null;
  monitoringStatus: MonitoringStatus;
  source: 'manual' | 'camera' | 'simulated';
  note: string;
}

export interface RefillEvent {
  id: string;
  medicationId: string;
  medicationName: string;
  date: string;
  quantity: number;
  type: 'purchase' | 'refill' | 'update';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientProfile {
  fullName: string;
  patientId: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
  phone: string;
  email: string;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  conditions: string[];
  medicalAlerts: string[];
  providerName: string;
  providerSpecialty: string;
  providerPhone: string;
  hospitalName: string;
  hospitalAddress: string;
  caregiverName: string;
  caregiverPhone: string;
  additionalInfo: string;
}

export interface LabReport {
  id: string;
  date: string;
  testName: string;
  result: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'pending';
  isSample: boolean;
}

export interface VisitRecord {
  id: string;
  date: string;
  doctor: string;
  reason: string;
  notes: string;
  isSample: boolean;
}

export interface MedicalReport {
  id: string;
  reportId: string;
  type: string;
  title: string;
  generatedDate: string;
  dateRange: string;
  sections: string[];
  data: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  source: string;
  publishedDate: string;
  tags: string[];
  offline: boolean;
}

export interface Bookmark {
  id: string;
  articleId: string;
  savedDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  reminderEnabled: boolean;
  reminderLeadMinutes: number;
  snoozeMinutes: number;
  cameraEnabled: boolean;
  monitoringWindowMinutes: number;
  notificationsEnabled: boolean;
  defaultReportType: string;
}
