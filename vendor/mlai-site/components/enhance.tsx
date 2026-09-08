'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { mount } from '../lib/enhance';
export function Enhance() {
  const pathname = usePathname();
  useEffect(() => mount(document), [pathname]);
  return null;
}
