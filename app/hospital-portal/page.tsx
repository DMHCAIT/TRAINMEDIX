'use client';

import { Suspense } from 'react';
import { HospitalDashboard } from '../../src/components/hospital-portal/HospitalDashboard';

export default function HospitalPortalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <HospitalDashboard />
    </Suspense>
  );
}
