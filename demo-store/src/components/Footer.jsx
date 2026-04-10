export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* CTA Section — purple bg matching landing page */}
      <section className="bg-b2b py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-[42px] font-extrabold text-white leading-[1.2] tracking-tight">
            Ready to grow your <span className="text-b2b-gold">B2B and wholesale business?</span>
          </h2>
          <p className="text-white/60 mt-4 text-[18px] max-w-[500px] mx-auto">
            Start your 60-day free trial today. Risk free trial — just results.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <a
              href="https://apps.shopify.com/netwise"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-b2b-gold text-primary font-bold rounded-full hover:bg-amber-400 transition-colors no-underline text-[15px]"
            >
              Try 60-Day Free Trial
              <span>&rarr;</span>
            </a>
            <a
              href="https://getnetwise.co"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-7 py-3.5 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors no-underline text-[15px]"
            >
              Book a Demo
            </a>
          </div>
          <p className="text-[13px] text-white/40 mt-4">60-day free trial &middot; One plan &middot; Everything included</p>
        </div>
      </section>

      {/* Footer — dark charcoal matching landing page */}
      <div className="bg-[#1a1a1a] text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-16">
            <div>
              <h4 className="text-[15px] font-bold mb-5">Product</h4>
              <ul className="space-y-3.5 text-[14px]">
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Features</a></li>
                <li><a href="https://getnetwise.co/#pricing" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Pricing</a></li>
                <li><a href="https://getnetwise.co/#how" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">How It Works</a></li>
                <li><a href="https://getnetwise.co/#faq" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[15px] font-bold mb-5">Features</h4>
              <ul className="space-y-3.5 text-[14px]">
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">B2B Pricing</a></li>
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Smart Cart</a></li>
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Bulk Orders</a></li>
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Net Terms</a></li>
                <li><a href="https://getnetwise.co/#features" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Shipping Rules</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[15px] font-bold mb-5">Resources</h4>
              <ul className="space-y-3.5 text-[14px]">
                <li><a href="https://help.getnetwise.co" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Help Center</a></li>
                <li><a href="https://help.getnetwise.co/article/20-start-up-guide-and-sync-data" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Setup Guide</a></li>
                <li><a href="mailto:hello@getnetwise.co" className="text-white/50 hover:text-white transition-colors no-underline">Contact Support</a></li>
                <li><a href="https://getnetwise.co" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Book a Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[15px] font-bold mb-5">Company</h4>
              <ul className="space-y-3.5 text-[14px]">
                <li><a href="https://getnetwise.co/privacy-policy.html" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Privacy Policy</a></li>
                <li><a href="https://getnetwise.co" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[15px] font-bold mb-5">Connect</h4>
              <ul className="space-y-3.5 text-[14px]">
                <li><a href="https://www.linkedin.com/company/netwise-b2b/" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">LinkedIn</a></li>
                <li><a href="https://x.com/NetWise_B2B" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors no-underline">X (Twitter)</a></li>
                <li><a href="mailto:hello@getnetwise.co" className="text-white/50 hover:text-white transition-colors no-underline">hello@getnetwise.co</a></li>
              </ul>
              <p className="text-[12px] text-white/30 mt-5 leading-relaxed">
                160 Robinson Rd, #14-04<br />
                Singapore Business Federation Center<br />
                Singapore 068914
              </p>
            </div>
          </div>
        </div>

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
