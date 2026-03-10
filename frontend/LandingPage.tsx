import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, Zap, Shield, GitBranch } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="public" />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 badge-blue mb-8">
            <Zap size={12} />
            <span>AI-Powered Scale Testing — 100k Agents</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
            <span className="text-white">Fix Your</span>
            <br />
            <span className="gradient-text">Reputation.</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered debugging and user testing tool. Run tests, fix bugs, and get
            your software production-ready — autonomously.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-4">
              Get Started <ArrowRight size={18} />
            </Link>
            <button className="btn-ghost text-base px-8 py-4">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 max-w-lg mx-auto gap-8 mt-20">
            {[
              { value: '100k', label: 'Concurrent Agents' },
              { value: '<5m', label: 'Time to Fix' },
              { value: '0 trash', label: 'Clean Git Pushes' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-3xl gradient-text">{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What We Do ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-3xl text-center text-white mb-4">What We Do</h2>
          <div className="h-0.5 w-12 bg-applaude-blue mx-auto mb-12 rounded-full" />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={20} className="text-applaude-blue" />,
                title: 'The Destroyer',
                desc: 'Our AI agents simulate real users, thoroughly going through user journeys at enormous scale and speed — like 10k error tests.',
              },
              {
                icon: <Shield size={20} className="text-applaude-blue" />,
                title: 'The Surgeon',
                desc: 'Changing the codebase logic, it fixes everything locally, tests successfully, then pushes the code to your repo.',
              },
              {
                icon: <GitBranch size={20} className="text-applaude-blue" />,
                title: 'Clean Commits',
                desc: 'Generates a report of steps taken, changes made, and what\'s next. Zero testing trash left in your repo.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card card-glow p-6">
                <div className="w-10 h-10 rounded-xl bg-applaude-blue/10 border border-applaude-blue/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
