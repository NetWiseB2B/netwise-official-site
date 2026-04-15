export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Footer — dark charcoal matching landing page */}
      <div className="bg-[#1a1a1a] text-white pt-20">
        {/* Large NETWISE brand text — gradient fade */}
        <div className="overflow-hidden pt-10 text-center">
          <span
            className="text-[clamp(100px,15vw,220px)] font-black leading-[0.85] tracking-[-6px] uppercase select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NETWISE
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center py-6 text-[13px] text-white/35">
          &copy; 2026 NetWise. All rights reserved. <a href="mailto:hello@getnetwise.co" className="text-white/50 hover:text-white transition-colors no-underline">hello@getnetwise.co</a>
        </div>
      </div>
    </footer>
  );
}
