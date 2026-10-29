import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Download, Printer, Search, Plus, CalendarDays,
  Filter, ChevronRight, ArrowLeft, CheckCircle2, Eye,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { generateMedicalPDF } from '@/lib/pdf';
import { formatDate, todayISO, ensureTodayDoses, uid } from '@/lib/medUtils';
import type { MedicalReport } from '@/types';

const reportTypes = [
  'Complete Patient Medical Summary',
  'Medication List and Schedule',
  'Medication Adherence Report',
  'Camera Monitoring and Confirmation Report',
  'Medicine Inventory and Refill Report',
  'Emergency Medical Summary',
  'Allergy and Medical History Summary',
  'Patient Visit Summary',
  'General Health Records Summary',
];

const sectionOptions: Record<string, { id: string; label: string }[]> = {
  'Complete Patient Medical Summary': [
    { id: 'cover', label: 'Cover' }, { id: 'demographics', label: 'Demographics' }, { id: 'emergency', label: 'Emergency' },
    { id: 'allergies', label: 'Allergies' }, { id: 'history', label: 'History' }, { id: 'medications', label: 'Medications' },
    { id: 'adherence', label: 'Adherence' }, { id: 'monitoring', label: 'Monitoring' }, { id: 'inventory', label: 'Inventory' },
    { id: 'labs', label: 'Lab Reports' }, { id: 'visits', label: 'Visits' }, { id: 'provider', label: 'Provider' }, { id: 'additional', label: 'Additional' },
  ],
  'Medication List and Schedule': [{ id: 'medications', label: 'Medications' }, { id: 'demographics', label: 'Demographics' }],
  'Medication Adherence Report': [{ id: 'adherence', label: 'Adherence History' }, { id: 'medications', label: 'Medications' }],
  'Camera Monitoring and Confirmation Report': [{ id: 'monitoring', label: 'Monitoring History' }, { id: 'demographics', label: 'Demographics' }],
  'Medicine Inventory and Refill Report': [{ id: 'inventory', label: 'Inventory & Refills' }, { id: 'medications', label: 'Medications' }],
  'Emergency Medical Summary': [{ id: 'cover', label: 'Cover' }, { id: 'emergency', label: 'Emergency' }, { id: 'allergies', label: 'Allergies' }, { id: 'medications', label: 'Medications' }, { id: 'provider', label: 'Provider' }],
  'Allergy and Medical History Summary': [{ id: 'allergies', label: 'Allergies' }, { id: 'history', label: 'History' }, { id: 'demographics', label: 'Demographics' }],
  'Patient Visit Summary': [{ id: 'visits', label: 'Visits' }, { id: 'demographics', label: 'Demographics' }],
  'General Health Records Summary': [{ id: 'demographics', label: 'Demographics' }, { id: 'labs', label: 'Lab Reports' }, { id: 'visits', label: 'Visits' }, { id: 'history', label: 'History' }],
};

export default function MedicalReports() {
  const { profile, medications, doses, refills, labs, visits, reports, addReport } = useData();
  const notify = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genType, setGenType] = useState(reportTypes[0]);
  const [genSections, setGenSections] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);

  const allDoses = ensureTodayDoses(doses, medications);

  const filteredReports = useMemo(() => {
    let list = [...reports];
    if (search) list = list.filter((r) => r.type.toLowerCase().includes(search.toLowerCase()) || r.reportId.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') list = list.filter((r) => r.type === filterType);
    return list;
  }, [reports, search, filterType]);

  function handleGenerate() {
    const reportId = `RPT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const dateRange = dateFrom || dateTo ? `${dateFrom || 'Start'} to ${dateTo || 'Today'}` : 'All records';
    try {
      const doc = generateMedicalPDF({
        profile, medications, doses: allDoses, refills, labs, visits,
        reportId, reportTitle: genType,
        includeSections: genSections.length > 0 ? genSections : sectionOptions[genType].map((s) => s.id),
        dateRange,
      });
      doc.save(`${genType.replace(/\s/g, '-')}-${reportId}.pdf`);
      const newReport: MedicalReport = {
        id: uid('rep-'), reportId, type: genType, title: genType,
        generatedDate: todayISO(), dateRange, sections: genSections,
        data: 'Generated from local data.',
      };
      addReport(newReport);
      notify('Report generated and PDF downloaded.', 'success');
      setGenerateOpen(false);
      setGenSections([]);
    } catch {
      notify('Report generation failed.', 'error');
    }
  }

  function printReport(r: MedicalReport) {
    setPreviewReport(r);
    setTimeout(() => window.print(), 300);
  }

  return (
    <div>
      <PageHeader
        title="Medical Reports"
        subtitle="Generate professional PDF reports from your local data. Reports are clearly marked as demo."
        actions={
          <button onClick={() => { setGenType(reportTypes[0]); setGenSections([]); setGenerateOpen(true); }} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Generate Report
          </button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Search by type or report ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-64" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All report types</option>
            {reportTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {filteredReports.length === 0 ? (
        <EmptyState icon={<FileText className="h-10 w-10" />} title="No reports yet" message="Generate your first medical report to see it here." action={<button onClick={() => setGenerateOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Generate Report</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-700/20">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant="info">{r.reportId}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{r.type}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(r.generatedDate)} · {r.dateRange}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => { handleRegenerate(r); }} className="btn btn-outline btn-sm">
                  <Download className="h-3 w-3" /> Download
                </button>
                <button onClick={() => setPreviewReport(r)} className="btn btn-ghost btn-sm">
                  <Eye className="h-3 w-3" /> Preview
                </button>
                <button onClick={() => printReport(r)} className="btn btn-ghost btn-sm">
                  <Printer className="h-3 w-3" /> Print
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Medical Report" size="lg"
        footer={<>
          <button onClick={() => setGenerateOpen(false)} className="btn btn-outline">Cancel</button>
          <button onClick={handleGenerate} className="btn btn-primary"><Download className="h-4 w-4" /> Generate & Download PDF</button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Report Type</label>
            <select className="input" value={genType} onChange={(e) => { setGenType(e.target.value); setGenSections([]); }}>
              {reportTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="label">Sections to Include</p>
            <div className="flex flex-wrap gap-2">
              {sectionOptions[genType].map((s) => {
                const checked = genSections.includes(s.id);
                return (
                  <button key={s.id} onClick={() => setGenSections(checked ? genSections.filter((x) => x !== s.id) : [...genSections, s.id])}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${checked ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300'}`}>
                    {checked ? '✓ ' : ''}{s.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-gray-400">Leave empty to include all default sections.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Date From (optional)</label><input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
            <div><label className="label">Date To (optional)</label><input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
          </div>
          <div className="rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
            Reports are generated from your local demo data and are clearly marked as demo. They are not official medical records.
          </div>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={!!previewReport} onClose={() => setPreviewReport(null)} title={`Report Preview — ${previewReport?.reportId || ''}`} size="lg"
        footer={<>
          <button onClick={() => setPreviewReport(null)} className="btn btn-outline">Close</button>
          {previewReport && <button onClick={() => handleRegenerate(previewReport)} className="btn btn-primary"><Download className="h-4 w-4" /> Download PDF</button>}
        </>}
      >
        {previewReport && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewReport.type}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{previewReport.reportId} · {formatDate(previewReport.generatedDate)}</p>
              </div>
              <Badge variant="info">{previewReport.dateRange}</Badge>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient: {profile.fullName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {profile.patientId}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">This report includes: {previewReport.sections.length > 0 ? previewReport.sections.map((s) => sectionOptions[previewReport.type]?.find((opt) => opt.id === s)?.label || s).join(', ') : 'All default sections'}</p>
            </div>
            <p className="text-xs text-gray-400">The downloaded PDF will contain a professionally formatted document with headings, tables and page numbers. This preview is a summary — the actual PDF has the full structured content.</p>
          </div>
        )}
      </Modal>
    </div>
  );

  function handleRegenerate(r: MedicalReport) {
    try {
      const doc = generateMedicalPDF({
        profile, medications, doses: allDoses, refills, labs, visits,
        reportId: r.reportId, reportTitle: r.type,
        includeSections: r.sections.length > 0 ? r.sections : sectionOptions[r.type]?.map((s) => s.id) || [],
        dateRange: r.dateRange,
      });
      doc.save(`${r.type.replace(/\s/g, '-')}-${r.reportId}.pdf`);
      notify('Report PDF downloaded.', 'success');
    } catch {
      notify('Download failed.', 'error');
    }
  }
}
