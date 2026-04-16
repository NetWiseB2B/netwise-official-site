import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickOrderLoaderPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Fade in on mount
    requestAnimationFrame(() => setFadeIn(true));

    const duration = 10000;
    const interval = 40;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) { clearInterval(timer); return 100; }
        return next;
      });
    }, interval);

    // Fade out before redirect
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 500);
    const redirect = setTimeout(() => navigate('/quick-order'), duration);

    return () => { clearInterval(timer); clearTimeout(fadeTimer); clearTimeout(redirect); };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className={`text-center max-w-lg px-6 transition-all duration-700 ${fadeIn && !fadeOut ? 'opacity-100 translate-y-0' : fadeOut ? 'opacity-0 -translate-y-4' : 'opacity-0 translate-y-6'}`}>

        {/* Animated Shopify bag icon */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-b2b to-[#7b1f65] flex items-center justify-center shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-extrabold text-primary mb-3 leading-snug">
          You're about to enter Shopify's new customer account to use B2B Quick Order.
        </h1>
        <p className="text-[14px] text-muted mb-10 leading-relaxed">
          Securely connecting to the merchant's storefront. This will only take a moment.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-[5px] overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #580A46, #7b1f65, #580A46)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <p className="text-[12px] text-gray-400 tracking-wide">
            {progress < 30 ? 'Authenticating...' : progress < 65 ? 'Loading account data...' : progress < 95 ? 'Preparing Quick Order...' : 'Redirecting...'}
          </p>
        </div>

        {/* Dots animation */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-b2b"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
