'use client';

import { useEffect } from 'react';
import { useDentalStore } from '@/store/useDentalStore';

export function StoreInitializer() {
  const initializeStore = useDentalStore(state => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return null;
}