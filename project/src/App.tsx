import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { DataProvider } from '@/context/DataContext';
import { ToastProvider } from '@/components/ui/Toast';
import { initTheme } from '@/lib/theme';
import { registerServiceWorker } from '@/lib/offline';

import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import Medications from '@/pages/Medications';
import DoseReminders from '@/pages/DoseReminders';
import CameraMonitoring from '@/pages/CameraMonitoring';
import Inventory from '@/pages/Inventory';
import RefillAlerts from '@/pages/RefillAlerts';
import EmergencyAssistance from '@/pages/EmergencyAssistance';
import EmergencyGuide from '@/pages/EmergencyGuide';
import MedicalLibrary from '@/pages/MedicalLibrary';
import AIHealthAdvisor from '@/pages/AIHealthAdvisor';
import PatientFile from '@/pages/PatientFile';
import MedicalReports from '@/pages/MedicalReports';
import MyProfile from '@/pages/MyProfile';
import Settings from '@/pages/Settings';
import MythBusters from '@/pages/MythBusters';
import PetCare from '@/pages/PetCare';
import PlatformVision from '@/pages/PlatformVision';

function App() {
  useEffect(() => {
    initTheme();
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              element={
                <AppLayout>
                  <Outlet />
                </AppLayout>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/reminders" element={<DoseReminders />} />
              <Route path="/camera-monitoring" element={<CameraMonitoring />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/refill-alerts" element={<RefillAlerts />} />
              <Route path="/emergency" element={<EmergencyAssistance />} />
              <Route path="/emergency-guide" element={<EmergencyGuide />} />
              <Route path="/library" element={<MedicalLibrary />} />
              <Route path="/ai-advisor" element={<AIHealthAdvisor />} />
              <Route path="/patient-file" element={<PatientFile />} />
              <Route path="/reports" element={<MedicalReports />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/settings" element={<Settings />} />
	      <Route element="{<MythBusters"/>} path="/myth-busters" />
	      <Route element="{<PetCare"/>} path="/pet-care" />
	      <Route element="{<PlatformVision" path="/"/>} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
