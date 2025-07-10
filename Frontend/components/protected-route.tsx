"use client"

import { useEffect } from 'react';
import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'rd_department' | 'other_department';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to dashboard if user doesn't have required role
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
} 