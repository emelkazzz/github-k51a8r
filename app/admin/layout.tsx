"use client";

import { ErrorBoundary } from '@/components/error-boundary';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-400" />
      </div>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}