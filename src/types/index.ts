export type Position = 'pitching' | 'hitting' | 'fielding' | 'catching'

export interface MechanicalCheckpoint {
  timestamp: string
  observation: string
  whyItMatters: string
  fix: string
  severity: 'critical' | 'moderate' | 'minor'
}

export interface DrillPrescription {
  name: string
  description: string
  duration: string
  reps?: string
  focus: string
}

export interface AnalysisReport {
  id: string
  userId: string
  position: Position
  overallScore: number
  summary: string
  checkpoints: MechanicalCheckpoint[]
  drills: DrillPrescription[]
  createdAt: string
  videoUrl?: string
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  createdAt: string
}
