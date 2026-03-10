import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Star, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store'
import { authAPI } from '@/lib/api'
import clsx from 'clsx'

interface NavbarProps {
  variant?: 'public' | 'dashboard'
}

export function Navbar({ variant = 'public' }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  const publicLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ]

  const dashboardLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Pricing', to: '/pricing' },
  ]

  const links = variant === 'dashboard' ? dashboardLinks : publicLinks
  const isActive = (to: string) => location.pathname === to

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-applaude-navy/80 backdrop-blur-xl border-b border-applaude-border/40" />
      <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ─── Logo ─── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-applaude flex items-center justify-center shadow-lg shadow-applaude-blue/30 group-hover:scale-105 transition-transform">
            <Star size={16} className="text-white fill-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Applaude
          </span>
        </Link>

        {/* ─── Desktop Nav ─── */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={clsx('nav-link', isActive(link.to) && 'active')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ─── Right CTA ─── */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-8 h-8 rounded-full border-2 border-applaude-border"
                />
                <span className="text-sm font-display font-medium text-white/80">
                  {user.name || user.login}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* ─── Mobile Menu Toggle ─── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileOpen && (
        <div className="relative md:hidden bg-applaude-surface border-b border-applaude-border/40 px-6 py-4 flex flex-col gap-3 animate-slide-up">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={clsx('nav-link text-base', isActive(link.to) && 'active')}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-applaude-border/40 my-1" />
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-left text-white/50 text-sm">
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="nav-link">Log In</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
