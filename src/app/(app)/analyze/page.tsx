'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Video, Circle, Square } from 'lucide-react'
import { Position } from '@/types'
import PositionSelector from '@/components/PositionSelector'

type Mode = 'upload' | 'record'
type RecordState = 'idle' | 'live' | 'recording' | 'done'

export default function AnalyzePage() {
  const [position, setPosition] = useState<Position | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [videoURL, setVideoURL] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('upload')
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!file) { setVideoURL(null); return }
    const url = URL.createObjectURL(file)
    setVideoURL(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Stop camera when switching away from record mode
  useEffect(() => {
    if (mode !== 'record') stopStream()
  }, [mode])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopStream() }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
      }
      setRecordState('live')
    } catch {
      setError('Could not access camera. Please allow camera permissions.')
    }
  }

  function startRecording() {
    if (!streamRef.current) return
    chunksRef.current = []
    const recorder = new MediaRecorder(streamRef.current)
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const recorded = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' })
      setFile(recorded)
      setRecordState('done')
      stopStream()
      if (timerRef.current) clearInterval(timerRef.current)
    }
    recorder.start()
    recorderRef.current = recorder
    setElapsed(0)
    setRecordState('recording')
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  function stopRecording() {
    recorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function resetRecording() {
    setFile(null)
    setVideoURL(null)
    setRecordState('idle')
    setElapsed(0)
  }

  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  async function extractFrames(videoFile: File, count = 6): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const frames: string[] = []

      video.preload = 'auto'
      video.muted = true
      video.src = URL.createObjectURL(videoFile)

      video.onloadedmetadata = () => {
        const maxDim = 640
        const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight))
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)

        const duration = video.duration || 0
        // Two-window swing sampling: early and peak of each swing window
        const pcts = [0.08, 0.20, 0.78, 0.92]
        const timestamps = count === 1
          ? [duration * 0.15]
          : Array.from({ length: count }, (_, i) => duration * (pcts[i] ?? i / (count - 1)))
        let index = 0

        function captureNext() {
          if (index >= timestamps.length) {
            URL.revokeObjectURL(video.src)
            resolve(frames)
            return
          }
          video.currentTime = timestamps[index]
        }

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          frames.push(canvas.toDataURL('image/jpeg', 0.55).split(',')[1])
          index++
          captureNext()
        }

        video.onerror = () => reject(new Error('Failed to extract frames from video'))
        captureNext()
      }

      video.onerror = () => reject(new Error('Failed to load video'))
    })
  }

  async function handleAnalyze() {
    if (!position || !file) return
    setLoading(true)
    setError('')

    let frames: string[] = []
    try {
      frames = await extractFrames(file, 4)
    } catch {
      // Continue without frames if extraction fails; server will still run the prompt
    }

    const formData = new FormData()
    formData.append('position', position)
    frames.forEach((f, i) => formData.append(`frame_${i}`, f))
    formData.append('frameCount', String(frames.length))

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      if (data.demo) {
        sessionStorage.setItem('demo-analysis', JSON.stringify({
          position: data.position,
          ...data.analysis,
          frames: frames.map(f => `data:image/jpeg;base64,${f}`),
        }))
        router.push('/analyze/demo')
      } else {
        router.push(`/analyze/${data.sessionId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setLoading(false)
    }
  }

  return (
    <div className="page-bg-glove max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Upload a video or record live to get started</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Position */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">1. Select your position</h2>
          <PositionSelector selected={position} onSelect={setPosition} />
        </div>

        {/* Step 2: Video */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">2. Add your video</h2>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => { setMode('upload'); resetRecording() }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={() => { setMode('record'); setFile(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'record' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
            >
              <Video className="w-4 h-4" /> Record Live
            </button>
          </div>

          {/* Upload mode */}
          {mode === 'upload' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {videoURL ? (
                <div className="space-y-3">
                  <video
                    key={videoURL}
                    src={videoURL}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-xl max-h-72 bg-black"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{file!.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{(file!.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 hover:border-red-500/50 rounded-xl p-8 text-center transition-colors group"
                >
                  <Upload className="w-8 h-8 text-gray-500 group-hover:text-red-400 mx-auto mb-3 transition-colors" />
                  <span className="block text-gray-400 text-sm font-medium">Click to upload video</span>
                  <span className="block text-gray-600 text-xs mt-1">MP4, MOV, or WebM — max 100MB</span>
                </button>
              )}
            </>
          )}

          {/* Record mode */}
          {mode === 'record' && (
            <div className="space-y-4">
              {/* Live preview — always rendered so ref attaches */}
              <div className={recordState === 'done' ? 'hidden' : ''}>
                {recordState === 'idle' ? (
                  <div className="w-full rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center py-12 gap-4">
                    <Video className="w-10 h-10 text-gray-500" />
                    <button
                      onClick={startCamera}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start Camera
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-xl bg-black max-h-72 object-cover"
                    />
                    {recordState === 'recording' && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                        <Circle className="w-2.5 h-2.5 text-red-500 fill-red-500 animate-pulse" />
                        <span className="text-white text-xs font-mono">{formatTime(elapsed)}</span>
                      </div>
                    )}
                  </div>
                )}

                {(recordState === 'live' || recordState === 'recording') && (
                  <div className="flex justify-center mt-3">
                    {recordState === 'live' ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Circle className="w-3.5 h-3.5 fill-white" /> Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-white/20"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" /> Stop Recording
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Recorded preview */}
              {recordState === 'done' && videoURL && (
                <div className="space-y-3">
                  <video
                    key={videoURL}
                    src={videoURL}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-xl max-h-72 bg-black"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">Recording ready — {(file!.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button
                      onClick={resetRecording}
                      className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Re-record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!position || !file || loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing mechanics...
            </>
          ) : (
            'Analyze My Mechanics'
          )}
        </button>

        {loading && (
          <p className="text-center text-gray-500 text-xs">
            AI is reviewing your footage — this usually takes 30–60 seconds
          </p>
        )}
      </div>
    </div>
  )
}
