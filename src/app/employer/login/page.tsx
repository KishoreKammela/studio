'use client';
import { EmployerLoginForm } from '@/components/employer/EmployerLoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Metadata for this page should be set in a server component or root layout
// For client components, we can update document.title dynamically if needed.

export default function EmployerLoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    document.title = 'Employer Login - Access Your Dashboard | JobBoardly';
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        if (user.role === 'employer') router.replace('/employer/posted-jobs');
        else if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'admin') router.replace('/admin');
        else router.replace('/');
      }
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (user && !authLoading) return null; // Handled by useEffect

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center py-12">
      <EmployerLoginForm />
    </div>
  );
}
