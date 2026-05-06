'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDentalStore } from '@/store/useDentalStore';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useDentalStore();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return <>{children}</>;
}
