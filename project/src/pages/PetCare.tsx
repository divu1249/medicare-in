import { ShieldCheck, MapPin, Syringe, AlertTriangle, Phone, FileText, Search, Activity } from 'lucide-react';
// Note: If you don't have PawPrint in your lucide-react version, you can substitute with 'Heart' or update lucide-react.
import { PawPrint } from 'lucide-react'; 
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';

const pets = [
  {
    name: 'Bruno',
    species: 'Dog (Golden Retriever)',
    age: '4 Years',
    weight: '32 kg',
    bloodType: 'DEA 1.1 Positive',
    microchip: 'IND-9810293847',
    allergies: 'Chicken, Penicillin',
    primaryVet: 'Dr. Sharma (Gurugram Pet Clinic)',
    vetPhone: '+91 98765 43210'
  }
];

const petMeds = [
  { name: 'Simparica Trio', purpose: 'Flea, Tick & Heartworm', dosage: '1 Tablet', frequency: 'Monthly (Next: Nov 15)', status: 'On Track' },
  { name: 'Apoquel 16mg', purpose: 'Skin Allergy Relief', dosage: '1 Tablet', frequency: 'Daily at 8:00 AM', status: 'Given Today' }
];

export default function PetCare() {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader 
        title="Veterinary Care Hub" 
        subtitle="Dedicated profiles, medication tracking, and emergency discovery for your pets."
      />

      {/* Pet Profile Card */}
      {pets.map((pet) => (
        <Card key={pet.name} className="border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 dark:border-amber-900/50 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                <PawPrint className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {pet.name}
                  <Badge variant="warning">Primary Pet</Badge>
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{pet.species} • {pet.age} • {pet.weight}</p>
              </div>
            </div>
            <button className="btn bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 dark:bg-slate-900 dark:border-amber-800 dark:text-amber-400">
              <FileText className="h-4 w-4 mr-2" /> View Medical History
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Microchip ID</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{pet.microchip}</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Blood Type</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{pet.bloodType}</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Known Allergies</p>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{pet.allergies}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase">Primary Vet</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{pet.primaryVet}</p>
              <a href={`tel:${pet.vetPhone}`} className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1 hover:underline">
                <Phone className="h-3 w-3" /> Call Vet Now
              </a>
            </div>
          </div>
        </Card>
      ))}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pet Medications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-emerald-600" /> Active Prescriptions
            </SectionTitle>
          </div>
          <div className="space-y-3">
            {petMeds.map((med, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{med.name} <span className="text-xs font-normal text-slate-500 ml-1">({med.dosage})</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">{med.purpose} • {med.frequency}</p>
                </div>
                <Badge variant={med.status === 'On Track' ? 'neutral' : 'success'}>{med.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Vet Emergency Discovery */}
        <Card className="border-rose-200 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/10">
          <SectionTitle className="flex items-center gap-2 mb-4 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" /> Veterinary Emergency
          </SectionTitle>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            Instantly locate 24/7 animal hospitals and emergency surgical centers near your live GPS location.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn bg-rose-600 hover:bg-rose-700 text-white flex-1 py-3 shadow-sm flex justify-center gap-2">
              <MapPin className="h-4 w-4" /> Find 24/7 Vet Near Me
            </button>
            <button className="btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 flex-1 py-3 shadow-sm flex justify-center gap-2">
              <Activity className="h-4 w-4" /> Pet Poison Helpline
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}