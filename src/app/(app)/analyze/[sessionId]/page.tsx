import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalysisReport from '@/components/AnalysisReport'
import MechanicsScore from '@/components/MechanicsScore'

export default async function AnalysisResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user!.id)
    .single()

  if (!session) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">{session.position} Analysis</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <MechanicsScore score={session.overall_score} summary={session.summary} />
      <AnalysisReport checkpoints={session.checkpoints} drills={session.drills} />
    </div>
  )
}
