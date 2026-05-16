'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AnalysisReport from '@/components/AnalysisReport'
import MechanicsScore from '@/components/MechanicsScore'
import { MechanicalCheckpoint, DrillPrescription, HofComparison } from '@/types'

interface DemoAnalysis {
  position: string
  overallScore: number
  summary: string
  checkpoints: MechanicalCheckpoint[]
  drills: DrillPrescription[]
  comparison: HofComparison[]
}

export default function DemoAnalysisPage() {
  const [analysis, setAnalysis] = useState<DemoAnalysis | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('demo-analysis')
    if (stored) setAnalysis(JSON.parse(stored))
  }, [])

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-gray-400">No demo analysis found. <Link href="/analyze" className="text-red-400 hover:text-red-300">Run a new analysis.</Link></p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">{analysis.position} Analysis</h1>
          <p className="text-gray-400 text-sm mt-1">Demo — <Link href="/signup" className="text-red-400 hover:text-red-300">Sign up to save your history</Link></p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> New Analysis
        </Link>
      </div>

      <MechanicsScore score={analysis.overallScore} summary={analysis.summary} comparison={analysis.comparison} />
      <AnalysisReport checkpoints={analysis.checkpoints} drills={analysis.drills} />

      <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-5 text-center">
        <p className="text-white font-semibold mb-1">Want to track your progress over time?</p>
        <p className="text-gray-400 text-sm mb-4">Create a free account to save all your analyses and compare sessions.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          Create Free Account
        </Link>
      </div>
    </div>
  )
}
