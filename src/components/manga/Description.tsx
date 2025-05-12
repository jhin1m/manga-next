'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DescriptionProps {
  description: string;
}

export default function Description({ description }: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (description.length > 300) {
      setIsTruncated(true);
    }
  }, [description]);

  return (
    <Card>
      <CardHeader className="pt-4">
        <CardTitle className="text-xl">Synopsis</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-sm text-muted-foreground whitespace-pre-line pb-2">
          {isTruncated && !isExpanded ? (
            <span>{description.slice(0, 300)}...</span>
          ) : ( 
            <span>{description}</span>
          )}
          {isTruncated && (
            <button
              className="text-primary underline underline-offset-4 ml-1"
              onClick={handleToggle}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

