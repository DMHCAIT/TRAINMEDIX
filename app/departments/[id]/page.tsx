'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DepartmentDetailRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/departments');
  }, [router]);

  return null;
}
