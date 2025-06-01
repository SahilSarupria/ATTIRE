'use client';

import { usePathname } from 'next/navigation';
import type { User } from '@/types'; // adjust path to your actual types file
import { authService } from '@/lib/api-auth';
import { ReactNode, useState, useEffect, } from 'react';
import { AuthProvider } from '@/app/context/AuthContext';

export default function AuthProviderWrapper({ children, initialUser }: { children: ReactNode; initialUser: User | null;  }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
    
  useEffect(() => {
    if (!initialUser) {
      setLoading(true);
      authService.getProfile()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }
  }, [initialUser]);

  if (loading) return null; // or loading spinner

  const authRequiredPaths = [ '/profile', '/create', '/login']; // customize your protected routes

  const requireAuth = authRequiredPaths.some(path => pathname.startsWith(path));

  return <AuthProvider requireAuth={requireAuth}>{children}</AuthProvider>;
}
