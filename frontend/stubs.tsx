// ─── Stub pages — Full implementation comes in Phase 1 ────
// Each will be replaced with full UI in Phase 1 build

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl gradient-text mb-4">About Applaude</h1>
          <p className="text-white/50">Full page coming in Phase 1</p>
        </div>
      </main>
      <Footer highlightLink="About" />
    </div>
  )
}

export function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl gradient-text mb-4">Contact Us</h1>
          <p className="text-white/50">Full page coming in Phase 1</p>
        </div>
      </main>
      <Footer highlightLink="Contact" />
    </div>
  )
}

export function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="card card-glow p-8 w-full max-w-md text-center">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Log In</h1>
          <p className="text-white/50 mb-6 text-sm">Continue with GitHub to access your dashboard</p>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/github/url`}
            className="btn-primary w-full justify-center"
          >
            Continue with GitHub
          </a>
          <p className="text-white/30 text-xs mt-4">
            Don't have an account? <Link to="/signup" className="text-applaude-blue hover:underline">Sign Up</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="card card-glow p-8 w-full max-w-md text-center">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create Account</h1>
          <p className="text-white/50 mb-6 text-sm">Sign up with GitHub to get started</p>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/github/url`}
            className="btn-primary w-full justify-center"
          >
            Sign Up with GitHub
          </a>
          <p className="text-white/30 text-xs mt-4">
            Already have an account? <Link to="/login" className="text-applaude-blue hover:underline">Log In</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="dashboard" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl gradient-text mb-4">Dashboard</h1>
          <p className="text-white/50">Full split-view dashboard (Pulse + Monaco IDE) coming in Phase 1</p>
        </div>
      </main>
    </div>
  )
}

export function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="dashboard" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl gradient-text mb-4">Pricing</h1>
          <p className="text-white/50">Full pricing page coming in Phase 1</p>
        </div>
      </main>
    </div>
  )
}

export function PaymentPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="dashboard" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl gradient-text mb-4">Payment</h1>
          <p className="text-white/50">Full Paystack checkout coming in Phase 1</p>
        </div>
      </main>
    </div>
  )
}
