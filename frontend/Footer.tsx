import { Link } from 'react-router-dom'
import { Star, Github, Linkedin } from 'lucide-react'

interface FooterProps {
  highlightLink?: string
}

export function Footer({ highlightLink }: FooterProps) {
  const year = new Date().getFullYear()

  const footerLinks = [
    {
      heading: 'Product',
      links: [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Dashboard', to: '/dashboard' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'Contact', to: '/contact' },
        { label: 'Blog', to: '/blog' },
        { label: 'Docs', to: '/docs' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
  ]

  return (
    <footer className="border-t border-applaude-border/40 bg-applaude-navy/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-applaude flex items-center justify-center">
                <Star size={13} className="text-white fill-white" />
              </div>
              <span className="font-display font-bold text-white">Applaude</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">
              AI-powered autonomous scale testing & self-healing SaaS.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Github size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.heading}>
              <h4 className="font-display font-semibold text-white/80 text-xs uppercase tracking-wider mb-4">
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`text-sm transition-colors duration-150 ${
                        highlightLink === link.label
                          ? 'text-applaude-blue font-medium'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-applaude-border/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs font-mono">
            © {year} Applaude. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Built with Claude Sonnet 4.6
          </p>
        </div>
      </div>
    </footer>
  )
}
