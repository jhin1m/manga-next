'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { authApi } from '@/lib/api/client';

// Registration form schema
const registerSchema = z
  .object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(50),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Form submission handler
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // Step 1: Register the user
      const _response = await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success('Registration successful! Logging you in...');

      // Step 2: Automatically log in the user
      const signInResult = await signIn('credentials', {
        emailOrUsername: data.username, // Use username for login
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If auto-login fails, redirect to login page
        toast.error('Registration successful, but auto-login failed. Please log in manually.');
        router.push('/auth/login');
        return;
      }

      // Step 3: Redirect to home page on successful auto-login
      toast.success('Welcome! You have been logged in successfully.');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', error);

      // Try to extract error message from API response
      let errorMessage = 'Registration failed';

      if (error instanceof Error) {
        try {
          // If the error message contains JSON, try to parse it
          const errorText = error.message;
          if (errorText.includes('API Error:')) {
            errorMessage = 'Registration failed. Please check your input and try again.';
          } else {
            errorMessage = errorText;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-md space-y-6 p-6 bg-card rounded-lg border shadow-sm'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Create an Account</h1>
        <p className='text-muted-foreground'>Enter your details to create a new account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='username' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='your.email@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='••••••••' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='••••••••' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>
      </Form>

      <div className='text-center text-sm'>
        <p className='text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/auth/login' className='text-primary hover:underline'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
