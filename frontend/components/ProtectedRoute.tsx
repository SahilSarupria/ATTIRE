'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];      // Optional: roles allowed to access this route
  redirectTo?: string;          // Optional: where to redirect if unauthorized (default: /login)
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If roles are specified, check if user's role is allowed
      if (allowedRoles && user.role) {
        if (!allowedRoles.includes(user.role)) {
          router.push(redirectTo);
        }
      }
      // If roles specified but user.role missing, allow access (for now)
    }
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block rendering if user is missing or role not allowed
  if (!user) {
    return null;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
