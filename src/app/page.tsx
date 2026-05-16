import Link from 'next/link'
import { ArrowRight, Zap, Target, TrendingUp, Shield, Heart } from 'lucide-react'


export default function LandingPage() {
  return (
    <div className="min-h-screen text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="MoundVisit AI" className="h-9 w-9" />
          <span className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MoundVisit AI</span>
        </div>
        <Link
          href="/analyze"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try It Free
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400 text-sm font-medium">Analysis in under 60 seconds</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Elite coaching.<br />
          <span className="text-red-500">Every position.</span><br />
          Any time.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Upload a video of your mechanics and get the same frame-by-frame feedback that costs $150/hour from a private coach — in under 60 seconds, for every position on the diamond.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/analyze"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Analyze Your Mechanics <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Positions */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Built for every position</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { position: 'Pitching', checkpoints: ['Leg lift', 'Arm path', 'Hip separation', 'Release point', 'Follow-through'] },
            { position: 'Hitting', checkpoints: ['Stance & load', 'Hip rotation', 'Swing path', 'Contact point', 'Hand path'] },
            { position: 'Fielding', checkpoints: ['Ready position', 'First step', 'Approach angle', 'Transfer', 'Throwing'] },
            { position: 'Catching', checkpoints: ['Receiving', 'Framing', 'Blocking', 'Pop time', 'Footwork'] },
          ].map(({ position, checkpoints }) => (
            <div key={position} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <h3 className="font-bold text-lg mb-4 text-white">{position}</h3>
              <ul className="space-y-2">
                {checkpoints.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Timestamped Breakdowns', desc: 'Every mechanical finding is tied to the exact moment in your video — no more guessing what went wrong.' },
            { icon: TrendingUp, title: 'Track Your Progress', desc: 'Compare current sessions to past analyses and see exactly how your mechanics are improving over time.' },
            { icon: Shield, title: 'Drill Prescriptions', desc: 'Every flagged mechanical issue comes with specific drills to fix it — not generic tips, actual work to do.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Stop guessing. Start improving.</h2>
        <p className="text-gray-400 mb-8">Join athletes who are getting elite coaching feedback between lessons.</p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
        >
          Analyze Your Mechanics <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Donation */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Support MoundVisit AI</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            This tool is free for every athlete. If it helped your game, consider buying me a coffee to keep it running and improving.
          </p>
          <a
            href="https://www.paypal.com/donate?business=jc38703%40gmail.com&currency_code=USD&item_name=Support+MoundVisit+AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <Heart className="w-4 h-4" /> Donate via PayPal
          </a>
          <p className="text-gray-600 text-xs mt-4">Any amount helps — thank you.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 MoundVisit AI. Built by Juan Fernandez.</p>
      </footer>
    </div>
  )
}
