import { createClient } from '@/lib/supabase/server'
import DrillCard from '@/components/DrillCard'

export default async function DrillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = user
    ? await supabase
        .from('analysis_sessions')
        .select('position, drills')
        .eq('user_id', user.id)
    : { data: null }

  const allDrills = sessions?.flatMap((s) =>
    (s.drills || []).map((d: Record<string, string>) => ({ ...d, position: s.position }))
  ) || []

  const positions = ['pitching', 'hitting', 'fielding', 'catching'] as const

  return (
    <div className="page-bg-bat">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Drill Library</h1>
        <p className="text-gray-400 text-sm mt-1">Drills prescribed from your analyses</p>
      </div>

      {allDrills.length === 0 ? (
        <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-gray-400">Complete an analysis to get drill prescriptions</p>
        </div>
      ) : (
        <div className="space-y-10">
          {positions.map((pos) => {
            const positionDrills = allDrills.filter((d) => d.position === pos)
            if (positionDrills.length === 0) return null
            return (
              <div key={pos}>
                <h2 className="text-lg font-semibold text-white capitalize mb-4">{pos}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {positionDrills.map((drill, i) => (
                    <DrillCard key={i} drill={drill} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
