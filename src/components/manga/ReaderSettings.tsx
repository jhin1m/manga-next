'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  X,
  SunMedium,
  ScrollText,
  Columns
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderSettingsProps {
  readingMode: 'vertical' | 'pagination';
  setReadingMode: (mode: 'vertical' | 'pagination') => void;
  brightness: number;
  setBrightness: (value: number) => void;
  onClose: () => void;
}

export default function ReaderSettings({
  readingMode,
  setReadingMode,
  brightness,
  setBrightness,
  onClose
}: ReaderSettingsProps) {
  return (
    <div
      className="fixed top-16 right-0 z-50 bg-background/95 backdrop-blur-sm p-4 border border-border rounded-l-lg shadow-lg w-72"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Reader Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Reading Mode */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Reading Mode</h4>
          <div className="flex gap-2">
            <Button
              variant={readingMode === 'vertical' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setReadingMode('vertical')}
            >
              <ScrollText className="h-4 w-4 mr-2" />
              Vertical
            </Button>
            <Button
              variant={readingMode === 'pagination' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setReadingMode('pagination')}
            >
              <Columns className="h-4 w-4 mr-2" />
              Pages
            </Button>
          </div>
        </div>

        {/* Brightness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Brightness</h4>
            <span className="text-xs text-muted-foreground">{brightness}%</span>
          </div>
          <div className="flex items-center gap-2">
            <SunMedium className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[brightness]}
              min={30}
              max={150}
              step={5}
              onValueChange={(value) => setBrightness(value[0])}
              className="flex-1"
            />
            <SunMedium className="h-5 w-5" />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Toggle Controls</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">ESC</kbd>
            </div>
            {readingMode === 'pagination' && (
              <>
                <div className="flex justify-between">
                  <span>Previous Page</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">←</kbd>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">A</kbd>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Next Page</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">→</kbd>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">D</kbd>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
