import { jsPDF } from 'jspdf';
import type { PatientProfile, Medication, DoseRecord, RefillEvent, LabReport, VisitRecord } from '@/types';

const TEAL: [number, number, number] = [13, 148, 136];
const DARK: [number, number, number] = [30, 41, 59];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT_GRAY: [number, number, number] = [229, 231, 235];

function header(doc: jsPDF, title: string, patientName: string) {
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MediCare AI', 16, 13);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 16, 21);
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.text(`Patient: ${patientName}`, 200, 13, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 21, { align: 'right' });
}

function footer(doc: jsPDF, docId: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(16, 280, 194, 280);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('DEMO - Not an official medical record. For prototype demonstration only.', 16, 286);
    doc.text(`${docId} | Page ${i} of ${pageCount}`, 194, 286, { align: 'right' });
  }
}

function sectionHeading(doc: jsPDF, y: number, text: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEAL);
  doc.text(text, 16, y);
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(16, y + 1.5, 194, y + 1.5);
  return y + 8;
}

function keyValue(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`${label}:`, 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  const val = value || 'Not provided';
  const lines = doc.splitTextToSize(val, 120);
  doc.text(lines, 60, y);
  return y + Math.max(6, lines.length * 5);
}

function table(doc: jsPDF, y: number, headers: string[], rows: string[][]): number {
  const colWidths = [178 / headers.length];
  const allSame = headers.length > 0;
  const widths = headers.map((_, i) => 178 / headers.length);

  doc.setFillColor(...TEAL);
  doc.rect(16, y - 5, 178, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  let x = 16;
  headers.forEach((h, i) => {
    doc.text(h, x + 1, y + 0.5);
    x += widths[i];
  });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  let cy = y + 8;
  rows.forEach((row, ri) => {
    if (cy > 270) {
      doc.addPage();
      cy = 20;
    }
    if (ri % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(16, cy - 5, 178, 8, 'F');
    }
    let cx = 16;
    row.forEach((cell, i) => {
      const lines = doc.splitTextToSize(cell || '-', widths[i] - 2);
      doc.text(lines, cx + 1, cy + 0.5);
      cx += widths[i];
    });
    cy += 8;
  });
  void colWidths; void allSame;
  return cy + 4;
}

function newPageIfNeeded(doc: jsPDF, y: number, needed = 30): number {
  if (y + needed > 270) {
    doc.addPage();
    return 20;
  }
  return y;
}

export interface PDFInput {
  profile: PatientProfile;
  medications: Medication[];
  doses: DoseRecord[];
  refills: RefillEvent[];
  labs: LabReport[];
  visits: VisitRecord[];
  reportId: string;
  reportTitle: string;
  includeSections: string[];
  dateRange?: string;
}

export function generateMedicalPDF(input: PDFInput): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { profile, reportId, reportTitle, includeSections } = input;

  header(doc, reportTitle, profile.fullName || 'Demo Patient');

  let y = 38;

  if (includeSections.includes('cover')) {
    y = sectionHeading(doc, y, 'Patient Cover');
    y = keyValue(doc, y, 'Patient Name', profile.fullName);
    y = keyValue(doc, y, 'Patient ID', profile.patientId);
    y = keyValue(doc, y, 'Date of Birth', profile.dateOfBirth);
    y = keyValue(doc, y, 'Blood Group', profile.bloodGroup);
    y = keyValue(doc, y, 'Emergency Contact', profile.emergencyContacts[0] ? `${profile.emergencyContacts[0].name} (${profile.emergencyContacts[0].phone})` : '');
    y = keyValue(doc, y, 'Known Allergies', profile.allergies.join(', '));
    y = keyValue(doc, y, 'Medical Alerts', profile.medicalAlerts.join('; '));
    y += 4;
  }

  if (includeSections.includes('demographics')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '1. Demographics & Basic Information');
    y = keyValue(doc, y, 'Name', profile.fullName);
    y = keyValue(doc, y, 'Age', profile.age);
    y = keyValue(doc, y, 'Gender', profile.gender);
    y = keyValue(doc, y, 'Address', profile.address);
    y = keyValue(doc, y, 'Phone', profile.phone);
    y = keyValue(doc, y, 'Email', profile.email);
    y += 4;
  }

  if (includeSections.includes('emergency')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '2. Emergency Contacts');
    if (profile.emergencyContacts.length === 0) {
      y = keyValue(doc, y, 'Emergency Contacts', 'Not provided');
    } else {
      y = table(doc, y, ['Name', 'Relationship', 'Phone'], profile.emergencyContacts.map((c) => [c.name, c.relationship, c.phone]));
    }
    y += 4;
  }

  if (includeSections.includes('allergies')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '3. Allergies & Sensitivities');
    y = keyValue(doc, y, 'Allergies', profile.allergies.join(', ') || 'Not provided');
    y = keyValue(doc, y, 'Medical Alerts', profile.medicalAlerts.join('; ') || 'Not provided');
    y += 4;
  }

  if (includeSections.includes('history')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '4. Medical History & Conditions');
    y = keyValue(doc, y, 'Existing Conditions', profile.conditions.join(', ') || 'Not provided');
    y += 4;
  }

  if (includeSections.includes('medications')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '5. Current Medications & Schedules');
    if (input.medications.length === 0) {
      y = keyValue(doc, y, 'Medications', 'Not provided');
    } else {
      y = table(doc, y, ['Medicine', 'Dose', 'Schedule', 'Instructions'], input.medications.map((m) => [m.name, `${m.dosage} ${m.unit}`, m.times.join(', '), m.instructions]));
    }
    y += 4;
  }

  if (includeSections.includes('adherence')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '6. Medication Adherence History');
    const recent = input.doses.slice(-20).reverse();
    if (recent.length === 0) {
      y = keyValue(doc, y, 'Adherence', 'No dose records.');
    } else {
      y = table(doc, y, ['Date', 'Time', 'Medicine', 'Status'], recent.map((d) => [d.scheduledDate, d.scheduledTime, d.medicationName, d.status.replace('_', ' ')]));
    }
    y += 4;
  }

  if (includeSections.includes('monitoring')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '7. Camera Monitoring History');
    const monitored = input.doses.filter((d) => d.source === 'camera' || d.source === 'simulated' || d.monitoringStatus !== 'scheduled').slice(-15).reverse();
    if (monitored.length === 0) {
      y = keyValue(doc, y, 'Monitoring', 'No monitoring sessions recorded.');
    } else {
      y = table(doc, y, ['Date', 'Medicine', 'Monitoring', 'Confirmation'], monitored.map((d) => [d.scheduledDate, d.medicationName, d.monitoringStatus.replace('_', ' '), d.status.replace('_', ' ')]));
    }
    y += 4;
  }

  if (includeSections.includes('inventory')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '8. Medicine Inventory & Refill History');
    if (input.medications.length === 0) {
      y = keyValue(doc, y, 'Inventory', 'Not provided');
    } else {
      y = table(doc, y, ['Medicine', 'Stock', 'Low Threshold', 'Expiry'], input.medications.map((m) => [m.name, `${m.quantity} ${m.unit}`, String(m.lowStockThreshold), m.expiryDate || 'Not provided']));
    }
    if (input.refills.length > 0) {
      y = newPageIfNeeded(doc, y);
      y = table(doc, y, ['Date', 'Medicine', 'Qty', 'Type'], input.refills.map((r) => [r.date, r.medicationName, String(r.quantity), r.type]));
    }
    y += 4;
  }

  if (includeSections.includes('labs')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '10. Laboratory Reports (Sample)');
    if (input.labs.length === 0) {
      y = keyValue(doc, y, 'Lab Reports', 'No sample lab entries.');
    } else {
      y = table(doc, y, ['Date', 'Test', 'Result', 'Range', 'Status'], input.labs.map((l) => [l.date, l.testName, l.result, l.normalRange, l.status]));
    }
    y += 4;
  }

  if (includeSections.includes('visits')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '11. Visits & Consultations (Sample)');
    if (input.visits.length === 0) {
      y = keyValue(doc, y, 'Visits', 'No sample visit entries.');
    } else {
      y = table(doc, y, ['Date', 'Doctor', 'Reason'], input.visits.map((v) => [v.date, v.doctor, v.reason]));
    }
    y += 4;
  }

  if (includeSections.includes('provider')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '13. Healthcare Provider');
    y = keyValue(doc, y, 'Provider', profile.providerName);
    y = keyValue(doc, y, 'Specialty', profile.providerSpecialty);
    y = keyValue(doc, y, 'Phone', profile.providerPhone);
    y = keyValue(doc, y, 'Hospital', profile.hospitalName);
    y = keyValue(doc, y, 'Hospital Address', profile.hospitalAddress);
    y += 4;
  }

  if (includeSections.includes('additional')) {
    y = newPageIfNeeded(doc, y);
    y = sectionHeading(doc, y, '14. Additional Information');
    y = keyValue(doc, y, 'Notes', profile.additionalInfo);
  }

  footer(doc, reportId);
  return doc;
}

export function generateEmergencyPDF(profile: PatientProfile, medications: Medication[]): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const reportId = `EMRG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  doc.setFillColor(...TEAL);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Emergency Medical Guide', 16, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 16, 22);

  let y = 38;

  doc.setFillColor(254, 226, 226);
  doc.rect(16, y - 5, 178, 10, 'F');
  doc.setTextColor(185, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('IN A REAL EMERGENCY, CALL YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY (e.g., 112 / 911 / 102).', 18, y + 1);
  doc.setTextColor(...DARK);
  y += 12;

  y = sectionHeading(doc, y, 'Patient Emergency Summary');
  y = keyValue(doc, y, 'Name', profile.fullName);
  y = keyValue(doc, y, 'Patient ID', profile.patientId);
  y = keyValue(doc, y, 'Age', profile.age);
  y = keyValue(doc, y, 'Blood Group', profile.bloodGroup);
  y = keyValue(doc, y, 'Phone', profile.phone);
  y += 4;

  y = sectionHeading(doc, y, 'Emergency Contacts');
  if (profile.emergencyContacts.length === 0) {
    y = keyValue(doc, y, 'Contacts', 'Not provided');
  } else {
    y = table(doc, y, ['Name', 'Relationship', 'Phone'], profile.emergencyContacts.map((c) => [c.name, c.relationship, c.phone]));
  }
  y += 4;

  y = sectionHeading(doc, y, 'Known Allergies');
  y = keyValue(doc, y, 'Allergies', profile.allergies.join(', ') || 'Not provided');
  y += 4;

  y = sectionHeading(doc, y, 'Medical Conditions');
  y = keyValue(doc, y, 'Conditions', profile.conditions.join(', ') || 'Not provided');
  y = keyValue(doc, y, 'Medical Alerts', profile.medicalAlerts.join('; ') || 'Not provided');
  y += 4;

  y = sectionHeading(doc, y, 'Current Medications');
  if (medications.length === 0) {
    y = keyValue(doc, y, 'Medications', 'Not provided');
  } else {
    y = table(doc, y, ['Medicine', 'Dose', 'Schedule'], medications.map((m) => [m.name, `${m.dosage} ${m.unit}`, m.times.join(', ')]));
  }
  y += 4;

  y = sectionHeading(doc, y, 'Healthcare Provider');
  y = keyValue(doc, y, 'Provider', profile.providerName);
  y = keyValue(doc, y, 'Hospital', profile.hospitalName);
  y = keyValue(doc, y, 'Phone', profile.providerPhone);
  y += 4;

  y = sectionHeading(doc, y, 'First Aid Guidance');
  const firstAid = [
    'CPR: Call emergency services. Push hard and fast in centre of chest, 100-120/min. Use AED if available.',
    'Choking: 5 back blows, then 5 abdominal thrusts. Call emergency services if not relieved.',
    'Seizure: Protect from injury, do not restrain, do not put anything in mouth. Recovery position after. Call help if >5 min.',
    'Recovery Position: Place unconscious breathing person on their side, tilt head back to keep airway open.',
    'Severe Bleeding: Apply firm pressure with a clean cloth, elevate if possible, call emergency services.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  firstAid.forEach((line) => {
    y = newPageIfNeeded(doc, y, 12);
    const lines = doc.splitTextToSize(`- ${line}`, 170);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 2;
  });
  y += 4;

  y = sectionHeading(doc, y, 'Emergency Preparedness Checklist');
  const checklist = [
    'Keep emergency contact list accessible.',
    'Carry a list of current medications and allergies.',
    'Maintain a basic first-aid kit at home.',
    'Know your local emergency number.',
    'Consider a medical alert tag for serious conditions.',
    'Review and update this guide regularly.',
  ];
  checklist.forEach((item) => {
    y = newPageIfNeeded(doc, y, 8);
    doc.setFontSize(10);
    doc.text(`[ ] ${item}`, 18, y);
    y += 6;
  });

  footer(doc, reportId);
  return doc;
}
