import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, UserCircle2, ChevronDown, LogOut, Building2, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { collections } from '../data/products';
import { useState } from 'react';

// Merchant-themed header — used on /quick-order* to illustrate the Bulk Order
// extension embedded in a storefront rather than the NetWise demo.
function PetButcherHeader({ location }) {
  const nav = [
    { label: 'Shop', to: '/' },
    { label: 'Quick Order', to: '/quick-order' },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-14">
            <Link to="/" className="no-underline flex-shrink-0">
              <img src={`${import.meta.env.BASE_URL}netwise-logo.svg`} alt="NetWise DEMO STORE" className="h-10" />
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {nav.map((item, i) => {
                const isQuickOrder = item.label === 'Quick Order';
                const isActive = isQuickOrder && location.pathname.startsWith('/quick-order');
                return (
                  <Link
                    key={i}
                    to={item.to}
                    className={`text-[14px] no-underline px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary font-semibold bg-gray-100'
                        : 'text-primary hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button className="flex items-center text-gray-400 hover:text-gray-600 transition-colors" aria-label="Account menu">
            <UserCircle2 size={32} strokeWidth={1.2} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  const { isLoggedIn, company, logout, setShowLoginModal } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // On /quick-order and sub-routes, swap to the merchant-themed header.
  if (location.pathname.startsWith('/quick-order')) {
    return <PetButcherHeader location={location} />;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">


      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
          <Link to="/" className="no-underline flex-shrink-0">
            <img src={`${import.meta.env.BASE_URL}netwise-logo.svg`} alt="NetWise DEMO STORE" className="h-8" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Catalog', to: '/collections/all' },
              { label: 'B2B Application', to: '/b2b-application' },
              { label: 'Quick Order', to: '/quick-order' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  location.pathname === item.to
                    ? 'bg-gray-100 text-primary'
                    : 'text-muted hover:text-primary hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          </div>

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
            {[
              { label: 'Catalog', to: '/collections/all' },
              { label: 'B2B Application', to: '/b2b-application' },
              { label: 'Quick Order', to: '/quick-order' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline ${
                  location.pathname === item.to
                    ? 'bg-gray-100 text-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
