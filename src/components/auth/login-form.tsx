'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { useTranslations } from 'next-intl';

// Login form schema - sẽ được tạo động với translations
const createLoginSchema = (t: any) =>
  z.object({
    emailOrUsername: z.string().min(1, { message: t('emailOrUsernameRequired') }),
    password: z.string().min(1, { message: t('passwordRequired') }),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  // Initialize form
  const loginSchema = createLoginSchema(tErrors);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  // Form submission handler
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('loginError'));
        return;
      }

      toast.success(t('loginSuccess'));
      
      // Trigger auth status refresh cho tất cả components sử dụng useAuthStatus
      // Delay một chút để đảm bảo session đã được set
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth-status-changed'));
      }, 100);
      
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error(tErrors('somethingWentWrong'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-md space-y-6 p-6 bg-card rounded-lg border shadow-sm'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>{t('loginTitle')}</h1>
        <p className='text-muted-foreground'>{t('loginDescription')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='emailOrUsername'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailOrUsername')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailOrUsernamePlaceholder')} {...field} />
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
                <FormLabel>{t('password')}</FormLabel>
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
                {t('loggingIn')}
              </>
            ) : (
              t('login')
            )}
          </Button>
        </form>
      </Form>

      <div className='text-center text-sm'>
        <p className='text-muted-foreground'>
          {t('noAccount')}{' '}
          <Link href='/auth/register' className='text-primary hover:underline'>
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
