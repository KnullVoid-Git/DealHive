import React from "react";

export default function Footer() {
  const productLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Sponsors", href: "#sponsors" },
    { label: "Security", href: "/security" },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press Kit", href: "/press" },
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "GDPR Compliance", href: "/gdpr" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <footer className="relative bg-slate-950 text-slate-400 py-16 overflow-hidden select-none border-t border-slate-900">
      
      {/* Footer grid */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center space-x-2">
            {/* Violet hexagon logo matching the platform */}
            <div className="w-6 h-6 bg-brand flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)" }}>
              <div className="w-4 h-4 bg-slate-950" style={{ clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)" }} />
            </div>
            <span className="text-sm font-bold text-white font-sora tracking-wide">DealHive</span>
          </div>

          <p className="text-[12.5px] font-sans text-slate-500 max-w-[280px] leading-relaxed">
            The end-to-end sponsorship operating system built specifically for YouTube creators. From pitch to payment, in one place.
          </p>

          {/* Social Icons row */}
          <div className="flex items-center space-x-3.5 pt-2">
            <a
              href="https://twitter.com/dealhive"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-brand/10 hover:text-slate-200 text-slate-500 flex items-center justify-center transition-all border border-slate-800/80"
              aria-label="Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/dealhive"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-brand/10 hover:text-slate-200 text-slate-500 flex items-center justify-center transition-all border border-slate-800/80"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://youtube.com/dealhive"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-brand/10 hover:text-slate-200 text-slate-500 flex items-center justify-center transition-all border border-slate-800/80"
              aria-label="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://github.com/dealhive"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-brand/10 hover:text-slate-200 text-slate-500 flex items-center justify-center transition-all border border-slate-800/80"
              aria-label="GitHub"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Column: Product */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-white font-mono uppercase tracking-widest">Product</h4>
          <ul className="space-y-2.5">
            {productLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-xs font-sans text-slate-500 hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column: Company */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-white font-mono uppercase tracking-widest">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-xs font-sans text-slate-500 hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column: Legal */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-white font-mono uppercase tracking-widest">Legal</h4>
          <ul className="space-y-2.5">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-xs font-sans text-slate-500 hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Copyright bottom bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-none text-[10px] text-slate-600 font-mono">
        <span>© 2026 DealHive Technologies, Inc. All rights reserved.</span>
        <div className="flex items-center space-x-1.5 select-none font-bold">
          <span>Made for creators with</span>
          <span className="text-rose-500">♥</span>
          <span>by Antigravity</span>
        </div>
      </div>

    </footer>
  );
}
