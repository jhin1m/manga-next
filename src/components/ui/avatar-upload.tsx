"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, User } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateImageFile } from '@/lib/upload'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatar?: string | null
  userName?: string
  onFileSelect?: (file: File) => void
  onFileRemove?: () => void
  className?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export function AvatarUpload({
  currentAvatar,
  userName,
  onFileSelect,
  onFileRemove,
  className,
  size = 'large',
  disabled = false
}: AvatarUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      toast.error(validation.error)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Store selected file and notify parent
    setSelectedFile(file)
    onFileSelect?.(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearPreview = useCallback(() => {
    setPreviewUrl(null)
    setSelectedFile(null)
    onFileRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileRemove])

  const displayAvatar = previewUrl || currentAvatar

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], 'border-2 border-dashed border-muted-foreground/25')}>
          <AvatarImage src={displayAvatar || undefined} alt={userName || 'User avatar'} />
          <AvatarFallback className="text-lg">
            {userName?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>

        {/* Clear preview button */}
        {previewUrl && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={clearPreview}
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-1">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP up to 5MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
