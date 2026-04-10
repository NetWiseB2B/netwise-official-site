import { X, Building2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowLoginModal(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 p-1 text-muted hover:text-primary rounded-lg hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-b2b-light rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-b2b" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-primary">B2B Customer Login</h2>
          <p className="text-sm text-muted mt-1">Access your wholesale pricing and account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="purchasing@acmeindustrial.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b2b/20 focus:border-b2b"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Password</label>
            <input
              type="password"
              defaultValue="demo123"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b2b/20 focus:border-b2b"
            />
          </div>

          <button
            onClick={login}
            className="w-full py-2.5 bg-b2b text-white font-medium rounded-lg hover:bg-b2b-hover transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Sign In to B2B Account
          </button>

          <div className="bg-b2b-light border border-b2b/10 rounded-lg p-3 mt-4">
            <p className="text-xs text-b2b leading-relaxed">
              This login is for demonstration purposes only. The Shopify login experience may differ from what you see here, as Shopify uses its new customer account login system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
