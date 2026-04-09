import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Receipt, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { products, collections } from '../data/products';
import ProductCard from '../components/ProductCard';

const HERO_IMG = 'https://theme-horizon-demo.myshopify.com/cdn/shop/files/055a84a1085545568fbf43ee71d66b1f.png?v=1747669841&width=1920';

export default function HomePage() {
  const { isLoggedIn, setShowLoginModal } = useAuth();
  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-36">
          <div className="max-w-xl">
            {isLoggedIn ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-b2b/20 text-pink-200 text-sm font-medium rounded-full mb-6 backdrop-blur-sm">
                  <ShieldCheck size={16} />
                  B2B Pricing Active
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Welcome back,<br />
                  <span className="text-b2b-gold">Acme Industrial</span>
                </h1>
                <p className="text-lg text-gray-200 mt-5 leading-relaxed">
                  Your wholesale pricing and volume discounts are active.
                  Browse our catalog and place orders with Net 30 terms.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link
                    to="/collections/all"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-b2b-gold text-primary font-medium rounded-lg hover:bg-amber-400 transition-colors no-underline"
                  >
                    Browse Catalog
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  New arrivals<br />
                  <span className="text-gray-300">are here.</span>
                </h1>
                <p className="text-lg text-gray-200 mt-5 leading-relaxed">
                  Premium knitwear, outerwear, and essentials crafted for the modern wardrobe.
                  Sign in to access exclusive B2B pricing.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link
                    to="/collections/all"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors no-underline"
                  >
                    Shop All
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    B2B Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* B2B Benefits Banner (guest only) */}
      {!isLoggedIn && (
        <section className="bg-b2b-light border-b border-b2b/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Receipt, label: 'Volume Pricing', desc: 'Up to 55% off retail' },
                { icon: Truck, label: 'Fast Shipping', desc: 'On all B2B orders' },
                { icon: Users, label: 'Net 30 Terms', desc: 'For approved accounts' },
                { icon: ShieldCheck, label: 'Dedicated Support', desc: 'Priority B2B service' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <Icon size={22} className="text-b2b" />
                  <p className="text-sm font-semibold text-primary">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-primary">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collections.filter(c => c.id !== 'all').map(collection => {
            const collProducts = products.filter(p => p.collection === collection.id);
            const previewImg = collProducts[0]?.image;
            return (
              <Link
                key={collection.id}
                to={`/collections/${collection.handle}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] no-underline"
              >
                {previewImg && (
                  <img src={previewImg} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    {collection.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {collProducts.length} products
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-primary">Featured Products</h2>
          <Link
            to="/collections/all"
            className="text-sm font-medium text-b2b hover:text-b2b-hover no-underline flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* B2B CTA (guest only) */}
      {!isLoggedIn && (
        <section className="bg-gradient-to-r from-b2b to-b2b-hover text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-3xl font-bold">Unlock B2B Pricing</h2>
            <p className="text-pink-200 mt-3 max-w-lg mx-auto">
              Sign in with your business account to access wholesale prices,
              volume discounts, and Net 30 payment terms.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="mt-6 px-8 py-3 bg-b2b-gold text-primary font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Access B2B Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
