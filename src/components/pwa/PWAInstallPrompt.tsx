'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const t = useTranslations('pwa');

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Don't show prompt if already dismissed or installed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !standalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was successfully installed
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm'>
      <div className='bg-card border border-border rounded-lg shadow-lg p-4'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0'>
            <Smartphone className='h-6 w-6 text-primary' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-semibold text-foreground'>{t('install.title')}</h3>
            <p className='text-xs text-muted-foreground mt-1'>
              {isIOS ? t('install.ios-instruction') : t('install.description')}
            </p>
            <div className='flex gap-2 mt-3'>
              {!isIOS && deferredPrompt && (
                <Button size='sm' onClick={handleInstallClick} className='flex items-center gap-1'>
                  <Download className='h-3 w-3' />
                  {t('install.button')}
                </Button>
              )}
              <Button size='sm' variant='outline' onClick={handleDismiss}>
                {t('install.dismiss')}
              </Button>
            </div>
          </div>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleDismiss}
            className='flex-shrink-0 h-6 w-6 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
