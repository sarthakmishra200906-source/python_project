import { Link } from 'react-router-dom';

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const footerLinks = {
  Product: [
    { label: 'Browse Plans',   to: '/plans'     },
    { label: 'Dashboard',      to: '/dashboard' },
    { label: 'Recharge History', to: '/history' },
    { label: 'Sign Up',        to: '/login'     },
  ],
  Support: [
    { label: 'Help Center',    href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Help' },
    { label: 'Contact Us',     href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Contact' },
    { label: 'FAQs',           href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20FAQ' },
    { label: 'Report Issue',   href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Issue' },
  ],
  Company: [
    { label: 'About Us',       href: 'https://github.com/sarthakmishra200906-source', external: true },
    { label: 'Privacy Policy', href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Privacy' },
    { label: 'Terms of Use',   href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Terms' },
    { label: 'Careers',        href: 'mailto:sarthaklove71@gmail.com?subject=RechargeX%20Careers' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 mt-auto">
      {/* ── Top section ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white">
                <BoltIcon />
              </span>
              <span className="text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                  Recharge
                </span>
                <span className="text-white">X</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              India's fastest mobile recharge platform. Instant top-ups, best plans, and zero hassle — built for a connected India.
            </p>
            {/* Newsletter / CTA */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Get offers via email"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                  text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none
                  focus:ring-2 focus:ring-brand-500 transition"
                id="footer-email-input"
              />
              <button
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600
                  text-white text-sm font-semibold transition-colors"
                id="footer-subscribe-btn"
              >
                Subscribe
              </button>
            </div>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                { Icon: GitHubIcon,   href: 'https://github.com/sarthakmishra200906-source', label: 'GitHub'   },
                { Icon: TwitterIcon,  href: 'https://twitter.com', label: 'Twitter' },
                { Icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn'},
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-brand-500/20 hover:text-brand-400
                    border border-slate-700 transition-all duration-200 hover:scale-110"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, to, href, external }) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="text-sm hover:text-brand-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                        {label}
                      </a>
                    ) : (
                      <Link to={to} className="text-sm hover:text-brand-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6
          flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} RechargeX. All rights reserved.
            <span className="ml-2 text-slate-500">College Project — For Demo Only.</span>
          </p>
          <div className="flex items-center gap-1 text-xs">
            <span>Built with</span>
            <span className="text-red-400 mx-1">♥</span>
            <span>using React · Flask · MySQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
