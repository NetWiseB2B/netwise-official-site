import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Building2, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { collections } from '../data/products';
import logoSvg from '/netwise-logo.svg';
import { useState } from 'react';

export default function Header() {
  const { isLoggedIn, company, logout, setShowLoginModal } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">


      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="no-underline flex-shrink-0">
            <img src={logoSvg} alt="NetWise DEMO STORE" className="h-8" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {collections.map(c => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  location.pathname === `/collections/${c.handle}`
                    ? 'bg-gray-100 text-primary'
                    : 'text-muted hover:text-primary hover:bg-gray-50'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-b2b hover:bg-b2b-light transition-colors rounded-lg"
              >
                <User size={16} />
                <span className="hidden sm:inline">B2B Login</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white rounded-full ${isLoggedIn ? 'bg-b2b' : 'bg-accent'}`}>
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted hover:text-primary"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-border pt-2">
            {collections.map(c => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline ${
                  location.pathname === `/collections/${c.handle}`
                    ? 'bg-gray-100 text-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
