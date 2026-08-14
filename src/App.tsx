import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { ValueSection } from './components/home/ValueSection';
import { HowItWorks } from './components/home/HowItWorks';
import { DepartmentCatalog } from './components/departments/DepartmentCatalog';
import { BookingWizard } from './components/booking/BookingWizard';
import { HospitalExplorer } from './components/hospitals/HospitalExplorer';
import { CertificatePortal } from './components/certification/CertificatePortal';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { HospitalDashboard } from './components/hospital-portal/HospitalDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { AutomationCenter } from './components/automation/AutomationCenter';
import { WhatsAppWidget } from './components/support/WhatsAppWidget';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {activeTab === 'home' && (
        <>
          <HeroSection />
          <ValueSection />
          <HowItWorks />
          <DepartmentCatalog />
        </>
      )}

      {activeTab === 'departments' && <DepartmentCatalog />}
      {activeTab === 'booking' && <BookingWizard />}
      {activeTab === 'hospitals' && <HospitalExplorer />}
      {activeTab === 'certification' && <CertificatePortal />}
      {activeTab === 'dashboard' && <UserDashboard />}
      {activeTab === 'hospital-portal' && <HospitalDashboard />}
      {activeTab === 'admin' && <AdminPanel initialTab="dashboard" />}
      {activeTab === 'alerts' && <AdminPanel initialTab="compliance" />}
      {activeTab === 'automation' && <AutomationCenter />}

      <WhatsAppWidget />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />
      </div>
    </AppProvider>
  );
}
