'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { ChapterReportDialog } from './ChapterReportDialog'
import { toast } from 'sonner'

interface ChapterReportButtonProps {
  chapterId: number
  chapterTitle?: string
  mangaTitle?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  iconOnly?: boolean
}

export function ChapterReportButton({
  chapterId,
  chapterTitle,
  mangaTitle,
  variant = 'outline',
  size = 'sm',
  className,
  iconOnly = false
}: ChapterReportButtonProps) {
  const { data: session } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClick = () => {
    if (!session) {
      toast.error('Please sign in to report chapter issues')
      return
    }
    setDialogOpen(true)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
      >
        <AlertTriangle className={iconOnly ? "h-5 w-5" : "h-4 w-4 mr-2"} />
        {!iconOnly && "Report Issue"}
        {iconOnly && <span className="sr-only">Report Chapter Issue</span>}
      </Button>

      <ChapterReportDialog
        chapterId={chapterId}
        chapterTitle={chapterTitle}
        mangaTitle={mangaTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
