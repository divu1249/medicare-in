import type {
  Medication,
  DoseRecord,
  RefillEvent,
  PatientProfile,
  LabReport,
  VisitRecord,
  MedicalReport,
  LibraryArticle,
  AppSettings,
} from '@/types';

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function nowISO(): string {
  return new Date().toISOString();
}

export const defaultProfile: PatientProfile = {
  fullName: 'Aarav Sharma',
  patientId: 'MC-DEMO-1024',
  dateOfBirth: '1985-03-15',
  age: '40',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '24 MG Road, Bengaluru, Karnataka 560001',
  phone: '+91 98765 43210',
  email: 'aarav.sharma@example.com',
  emergencyContacts: [
    { id: 'ec1', name: 'Priya Sharma', relationship: 'Spouse', phone: '+91 98765 11111' },
    { id: 'ec2', name: 'Dr. Anil Mehta', relationship: 'Family Physician', phone: '+91 80 2345 6789' },
  ],
  allergies: ['Penicillin', 'Peanuts'],
  conditions: ['Hypertension', 'Type 2 Diabetes'],
  medicalAlerts: ['Carries an auto-injector for severe allergy'],
  providerName: 'Dr. Anil Mehta',
  providerSpecialty: 'General Physician',
  providerPhone: '+91 80 2345 6789',
  hospitalName: 'City Care Hospital (Sample)',
  hospitalAddress: '100 Brigade Road, Bengaluru 560025',
  caregiverName: 'Priya Sharma',
  caregiverPhone: '+91 98765 11111',
  additionalInfo: 'Prefers generic medicines. Mild lactose intolerance.',
};

export const defaultMedications: Medication[] = [
  {
    id: 'med1',
    name: 'Metformin',
    dosage: '500',
    unit: 'mg',
    times: ['08:00', '20:00'],
    frequency: 'Twice daily',
    duration: 'Ongoing',
    instructions: 'Take after meals with water.',
    startDate: todayISO(-120),
    endDate: '',
    quantity: 42,
    quantityPerDose: 1,
    lowStockThreshold: 10,
    expiryDate: todayISO(200),
    notes: 'For diabetes management.',
    pharmacy: 'Apollo Pharmacy (Sample)',
    createdAt: nowISO(),
  },
  {
    id: 'med2',
    name: 'Amlodipine',
    dosage: '5',
    unit: 'mg',
    times: ['09:00'],
    frequency: 'Once daily',
    duration: 'Ongoing',
    instructions: 'Take in the morning.',
    startDate: todayISO(-120),
    endDate: '',
    quantity: 7,
    quantityPerDose: 1,
    lowStockThreshold: 10,
    expiryDate: todayISO(180),
    notes: 'For blood pressure control.',
    pharmacy: 'Apollo Pharmacy (Sample)',
    createdAt: nowISO(),
  },
  {
    id: 'med3',
    name: 'Atorvastatin',
    dosage: '10',
    unit: 'mg',
    times: ['22:00'],
    frequency: 'Once daily at bedtime',
    duration: 'Ongoing',
    instructions: 'Take at night.',
    startDate: todayISO(-90),
    endDate: '',
    quantity: 25,
    quantityPerDose: 1,
    lowStockThreshold: 8,
    expiryDate: todayISO(150),
    notes: 'Cholesterol management.',
    pharmacy: 'MedPlus (Sample)',
    createdAt: nowISO(),
  },
];

export const defaultDoses: DoseRecord[] = (() => {
  const records: DoseRecord[] = [];
  for (let day = -6; day <= 0; day++) {
    const date = todayISO(day);
    defaultMedications.forEach((med) => {
      med.times.forEach((time) => {
        let status: DoseRecord['status'] = 'scheduled';
        if (day < 0) {
          status = Math.random() > 0.2 ? 'taken' : 'skipped';
        }
        records.push({
          id: `dose-${med.id}-${date}-${time}`,
          medicationId: med.id,
          medicationName: med.name,
          scheduledDate: date,
          scheduledTime: time,
          dosage: `${med.dosage} ${med.unit}`,
          status,
          confirmedAt: status === 'taken' ? nowISO() : null,
          monitoringStatus: 'scheduled',
          source: 'manual',
          note: '',
        });
      });
    });
  }
  return records;
})();

export const defaultRefills: RefillEvent[] = [
  { id: 'r1', medicationId: 'med1', medicationName: 'Metformin', date: todayISO(-30), quantity: 60, type: 'refill' },
  { id: 'r2', medicationId: 'med3', medicationName: 'Atorvastatin', date: todayISO(-20), quantity: 30, type: 'purchase' },
];

export const defaultLabReports: LabReport[] = [
  { id: 'lab1', date: todayISO(-45), testName: 'HbA1c', result: '7.1%', normalRange: '< 5.7%', status: 'abnormal', isSample: true },
  { id: 'lab2', date: todayISO(-45), testName: 'Blood Pressure', result: '138/86 mmHg', normalRange: '< 120/80 mmHg', status: 'abnormal', isSample: true },
  { id: 'lab3', date: todayISO(-45), testName: 'Total Cholesterol', result: '195 mg/dL', normalRange: '< 200 mg/dL', status: 'normal', isSample: true },
];

export const defaultVisits: VisitRecord[] = [
  { id: 'v1', date: todayISO(-50), doctor: 'Dr. Anil Mehta', reason: 'Routine diabetes review', notes: 'Adjusted Metformin schedule. Review in 3 months.', isSample: true },
  { id: 'v2', date: todayISO(-120), doctor: 'Dr. Kavita Rao', reason: 'Hypertension follow-up', notes: 'Amlodipine continued. BP logging advised.', isSample: true },
];

export const defaultReports: MedicalReport[] = [
  {
    id: 'rep1',
    reportId: 'RPT-2025-0001',
    type: 'Medication List and Schedule',
    title: 'Current Medication List',
    generatedDate: todayISO(-7),
    dateRange: 'Last 30 days',
    sections: ['Patient Information', 'Medications', 'Schedules'],
    data: 'Sample report generated from local records.',
  },
];

export const defaultSettings: AppSettings = {
  theme: 'system',
  reminderEnabled: true,
  reminderLeadMinutes: 5,
  snoozeMinutes: 10,
  cameraEnabled: false,
  monitoringWindowMinutes: 10,
  notificationsEnabled: false,
  defaultReportType: 'Complete Patient Medical Summary',
};

export const libraryArticles: LibraryArticle[] = [
  {
    id: 'art1',
    title: 'Understanding Type 2 Diabetes',
    category: 'Chronic Diseases',
    summary: 'Learn how type 2 diabetes affects the body and how it is managed.',
    content:
      'Type 2 diabetes is a chronic condition that affects the way the body processes blood sugar (glucose). With type 2 diabetes, the body either resists the effects of insulin or does not produce enough insulin to maintain normal glucose levels.\n\nManagement focuses on diet, physical activity, monitoring blood glucose, and medications as prescribed. Regular follow-ups with a healthcare provider are essential.\n\nThis article is for general education only and is not a substitute for professional medical advice.',
    source: 'Adapted from general public-health education material.',
    publishedDate: '2024-01-15',
    tags: ['diabetes', 'chronic', 'blood sugar'],
    offline: true,
  },
  {
    id: 'art2',
    title: 'Medication Adherence: Why It Matters',
    category: 'Medication Safety',
    summary: 'Taking medicines as prescribed improves outcomes and prevents complications.',
    content:
      'Medication adherence means taking your medicines exactly as prescribed — the right dose, at the right time, in the right way. Poor adherence can lead to worsening symptoms, hospitalisation, and treatment failure.\n\nTips: keep a schedule, use reminders, understand your medicines, and talk to your doctor about side effects before stopping.',
    source: 'General medication-safety education.',
    publishedDate: '2024-02-01',
    tags: ['adherence', 'medication', 'safety'],
    offline: true,
  },
  {
    id: 'art3',
    title: 'High Blood Pressure: The Basics',
    category: 'Chronic Diseases',
    summary: 'What hypertension is, why it matters, and how it is managed.',
    content:
      'Hypertension (high blood pressure) rarely causes symptoms but significantly increases the risk of heart disease and stroke. Management includes lifestyle changes and, when prescribed, medication.\n\nRegular monitoring and follow-up with your healthcare provider are important.',
    source: 'General public-health education material.',
    publishedDate: '2024-02-10',
    tags: ['hypertension', 'heart', 'chronic'],
    offline: true,
  },
  {
    id: 'art4',
    title: 'CPR Awareness',
    category: 'First Aid',
    summary: 'Basic awareness of CPR steps. Call emergency services immediately.',
    content:
      'If someone is unresponsive and not breathing normally:\n1. Call your local emergency number immediately (e.g., 112, 911, 102).\n2. Begin chest compressions: push hard and fast in the centre of the chest at 100-120 compressions per minute.\n3. If trained, give rescue breaths in a 30:2 ratio.\n4. Use an AED if one is available and follow its instructions.\n\nThis is educational information. Take a certified first-aid course for hands-on training.',
    source: 'Adapted from widely published emergency-care guidance.',
    publishedDate: '2024-03-01',
    tags: ['CPR', 'emergency', 'first aid'],
    offline: true,
  },
  {
    id: 'art5',
    title: 'Choking: First Aid Steps',
    category: 'First Aid',
    summary: 'Recognise choking and know the basic response.',
    content:
      'If someone is choking and cannot breathe, cough, or speak:\n1. Encourage them to cough if they can.\n2. Give 5 back blows between the shoulder blades.\n3. Give 5 abdominal thrusts (Heimlich manoeuvre) above the navel.\n4. Alternate back blows and abdominal thrusts.\n5. Call emergency services if the object is not dislodged.\n\nThis is educational information, not a substitute for certified training.',
    source: 'Adapted from general first-aid guidance.',
    publishedDate: '2024-03-05',
    tags: ['choking', 'first aid', 'emergency'],
    offline: true,
  },
  {
    id: 'art6',
    title: 'Seizure First Aid',
    category: 'First Aid',
    summary: 'How to help someone having a seizure safely.',
    content:
      'During a seizure:\n1. Stay calm and time the seizure.\n2. Protect the person from injury — clear the area, cushion the head.\n3. Do not restrain them or put anything in their mouth.\n4. Once shaking stops, gently roll them onto their side (recovery position).\n5. Call emergency services if the seizure lasts more than 5 minutes, repeats, or it is their first seizure.',
    source: 'Adapted from general first-aid guidance.',
    publishedDate: '2024-03-10',
    tags: ['seizure', 'first aid', 'emergency'],
    offline: true,
  },
  {
    id: 'art7',
    title: 'Medication Safety Tips',
    category: 'Medication Safety',
    summary: 'Store, take, and dispose of medicines safely.',
    content:
      'Keep medicines in their original containers, store them as directed (some need refrigeration), keep them away from children, and never share prescription medicines. Dispose of expired medicines at a pharmacy take-back programme when available.',
    source: 'General medication-safety education.',
    publishedDate: '2024-01-20',
    tags: ['safety', 'storage', 'medication'],
    offline: true,
  },
  {
    id: 'art8',
    title: 'Emergency Preparedness Checklist',
    category: 'Emergency Preparedness',
    summary: 'Be ready for medical emergencies at home.',
    content:
      'Keep a list of emergency contacts, known allergies, current medications, and medical conditions in an accessible place. Maintain a basic first-aid kit. Know your local emergency number. Consider wearing a medical alert tag for serious conditions.',
    source: 'General emergency-preparedness guidance.',
    publishedDate: '2024-01-05',
    tags: ['emergency', 'preparedness', 'safety'],
    offline: true,
  },
  {
    id: 'art9',
    title: 'Recovery Position',
    category: 'First Aid',
    summary: 'How to place an unconscious but breathing person safely.',
    content:
      'The recovery position helps keep the airway open in an unconscious person who is breathing:\n1. Kneel beside the person.\n2. Place the arm nearest you at a right angle.\n3. Bring the far arm across the chest.\n4. Pull the far knee up.\n5. Gently roll the person toward you onto their side.\n6. Tilt the head back to keep the airway open.\n7. Monitor breathing until help arrives.',
    source: 'Adapted from general first-aid guidance.',
    publishedDate: '2024-03-15',
    tags: ['recovery position', 'first aid'],
    offline: true,
  },
  {
    id: 'art10',
    title: 'General Health and Wellness',
    category: 'General Health',
    summary: 'Basic pillars of a healthy lifestyle.',
    content:
      'Key pillars of wellness include a balanced diet, regular physical activity, adequate sleep, stress management, avoiding tobacco, limiting alcohol, and keeping up with recommended health check-ups.',
    source: 'General health-education material.',
    publishedDate: '2024-01-01',
    tags: ['wellness', 'lifestyle', 'health'],
    offline: true,
  },
];

export const healthAdvisorResponses: { keywords: string[]; response: string; links: string[] }[] = [
  {
    keywords: ['diabetes', 'blood sugar', 'glucose'],
    response:
      'Type 2 diabetes affects how your body processes blood sugar. Management typically includes a balanced diet, regular activity, blood-sugar monitoring, and medicines as prescribed by your doctor. Always follow your healthcare provider’s guidance and never change your prescribed dose on your own.',
    links: ['art1'],
  },
  {
    keywords: ['blood pressure', 'hypertension', 'bp'],
    response:
      'High blood pressure often has no symptoms but increases the risk of heart disease. Lifestyle changes and prescribed medication can help. Monitor regularly as advised and consult your doctor.',
    links: ['art3'],
  },
  {
    keywords: ['medication', 'adherence', 'medicine'],
    response:
      'Taking medicines exactly as prescribed is one of the most important factors in treatment success. Use reminders, maintain a schedule, and speak to your doctor if you experience side effects before stopping any medicine.',
    links: ['art2', 'art7'],
  },
  {
    keywords: ['cholesterol', 'statins', 'lipid'],
    response:
      'Cholesterol management usually involves dietary changes, exercise, and sometimes prescribed medicines. Follow your healthcare provider’s plan and get regular lab checks as recommended.',
    links: ['art10'],
  },
  {
    keywords: ['cpr', 'emergency', 'first aid', 'choking', 'seizure'],
    response:
      'In an emergency, always contact your local emergency number first. For educational guidance on CPR, choking, and seizure first aid, see our first-aid articles. Taking a certified first-aid course is strongly recommended.',
    links: ['art4', 'art5', 'art6'],
  },
  {
    keywords: ['allergy', 'allergic'],
    response:
      'Allergies can range from mild to life-threatening. Keep a record of known allergens, carry any prescribed emergency medication (such as an auto-injector), and inform your caregivers. Seek immediate emergency help for severe reactions.',
    links: ['art8'],
  },
];

export const suggestedHealthQuestions = [
  'How can I manage type 2 diabetes?',
  'Why is medication adherence important?',
  'What should I know about high blood pressure?',
  'What are basic CPR steps?',
  'How do I help someone who is choking?',
];
