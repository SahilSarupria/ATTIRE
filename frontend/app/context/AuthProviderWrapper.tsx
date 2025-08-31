'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/types';
import { authService } from '@/lib/api-auth';
import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/app/context/AuthContext';

export default function AuthProviderWrapper({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const protectedRoutes = ['/profile', '/create'];
  const authPageRoutes = ['/login'];

  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));
  const isAuthPage = authPageRoutes.some((path) => pathname.startsWith(path));

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await authService.getProfile();
        setUser(currentUser);

        if (isAuthPage && currentUser) {
          // If already logged in and trying to access /login, redirect away
          router.replace('/');
        }
      } catch {
        setUser(null);
        if (isProtected) {
          // Not logged in and accessing a protected page
          router.replace(`/login?callback=${encodeURIComponent(pathname)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isProtected, isAuthPage, pathname]);

  if (loading) return null;

  if ((isProtected && !user) || (isAuthPage && user)) return null;

  return <AuthProvider requireAuth={isProtected}>{children}</AuthProvider>;
}
