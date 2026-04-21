'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  file: File | null
  onFileSelect: (file: File) => void
}

export default function VideoUploader({ file, onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (selected) onFileSelect(selected)
        }}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-white/20 hover:border-red-500/50 rounded-xl p-8 text-center transition-colors group"
      >
        <Upload className="w-8 h-8 text-gray-500 group-hover:text-red-400 mx-auto mb-3 transition-colors" />
        {file ? (
          <div>
            <p className="text-white font-medium text-sm">{file.name}</p>
            <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm font-medium">Click to upload video</p>
            <p className="text-gray-600 text-xs mt-1">MP4, MOV, or WebM — max 100MB</p>
          </div>
        )}
      </button>
    </div>
  )
}
