'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface DescriptionProps {
  description: string;
}

export default function Description({ description }: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const t = useTranslations('manga');

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (description.length > 150) {
      setIsTruncated(true);
    }
  }, [description]);

  return (
    <Card>
      <CardHeader className="pt-4">
        <CardTitle className="text-xl">{t('synopsis')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-sm text-muted-foreground whitespace-pre-line pb-2">
          {isTruncated && !isExpanded ? (
            <span>{description.slice(0, 150)}...</span>
          ) : ( 
            <span>{description}</span>
          )}
          {isTruncated && (
            <button
              className="text-primary underline underline-offset-4 ml-1"
              onClick={handleToggle}
            >
              {isExpanded ? '🔫' : '✨'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

