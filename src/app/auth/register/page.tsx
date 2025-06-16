import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authViewport } from '@/lib/seo/viewport';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
};

export const viewport = authViewport;

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/');
  }

  return (
    <div className='container max-w-screen-sm py-10'>
      <RegisterForm />
    </div>
  );
}
