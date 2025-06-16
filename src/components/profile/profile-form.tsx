'use client';

import { useState } from 'react';
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
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { userApi } from '@/lib/api/client';
import { uploadAvatar } from '@/lib/upload';
import { useSession } from 'next-auth/react';

// Profile form schema
const profileSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: number;
    username: string;
    email: string;
    avatar_url?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar_url);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
    },
  });

  // Form submission handler
  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      // Upload avatar first if a new file is selected
      let avatarUrl = currentAvatar;
      if (selectedAvatarFile) {
        const uploadResult = await uploadAvatar(selectedAvatarFile);
        avatarUrl = uploadResult.url;
        setCurrentAvatar(avatarUrl);
      }

      // Update profile with username and avatar URL
      await userApi.updateProfile({
        username: data.username,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });

      // Update NextAuth session with new avatar
      if (selectedAvatarFile && avatarUrl) {
        console.log('Updating session with new avatar:', avatarUrl);
        try {
          await update({
            user: {
              ...session?.user,
              image: avatarUrl,
            },
          });
          console.log('Session updated successfully');

          // Force refresh session to ensure update is propagated
          setTimeout(async () => {
            await update();
            console.log('Session force refreshed');
          }, 100);
        } catch (error) {
          console.error('Failed to update session:', error);
        }
      }

      toast.success('Profile updated successfully');
      setSelectedAvatarFile(null); // Clear selected file after successful upload
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle avatar file selection
  const handleAvatarFileSelect = (file: File) => {
    setSelectedAvatarFile(file);
  };

  // Handle avatar file removal
  const handleAvatarFileRemove = () => {
    setSelectedAvatarFile(null);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Profile Information</h3>
        <p className='text-sm text-muted-foreground'>Update your account profile information.</p>
      </div>

      {/* Avatar Upload Section */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium'>Profile Picture</h4>
        <AvatarUpload
          currentAvatar={currentAvatar}
          userName={user.username}
          onFileSelect={handleAvatarFileSelect}
          onFileRemove={handleAvatarFileRemove}
          size='large'
          disabled={isLoading}
        />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
