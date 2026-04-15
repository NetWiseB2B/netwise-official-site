import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Receipt, Users, Tags, ShoppingCart, Package, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const HERO_IMG = `${import.meta.env.BASE_URL}hero-banner.jpg`;

export default function HomePage() {
  const { isLoggedIn, setShowLoginModal } = useAuth();
  // Pick one product per collection so the featured row has no overlap
  // with the collection-specific sections below (each of which uses .slice(1)).
  const featuredProducts = [
    products.find(p => p.collection === 'knitwear'),
    products.find(p => p.collection === 'tops'),
    products.find(p => p.collection === 'outerwear'),
    products.find(p => p.collection === 'accessories'),
  ].filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover object-top" />
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
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-nowrap">
                  Welcome to NetWise<br />
                  <span className="text-b2b-gold">B2B Store</span>
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
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-nowrap">
                  Welcome to NetWise<br />
                  <span className="text-gray-300">Retail Store</span>
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
                    View All
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary">Multiple Variant Products</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Knitwear */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary">Single Variant Products</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {products.filter(p => p.collection === 'knitwear').slice(1, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Tops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary">Volume Pricing Products</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {products.filter(p => p.collection === 'tops').slice(1, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Outerwear */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary">Minimum Quantity / Incremental Products</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {products.filter(p => p.collection === 'outerwear').slice(1, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
