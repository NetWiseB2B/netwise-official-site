import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { collections, getProductsByCollection } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function CollectionPage() {
  const { handle } = useParams();
  const { isLoggedIn } = useAuth();

  const collection = collections.find(c => c.handle === handle);
  const collectionProducts = getProductsByCollection(handle);

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-primary">Collection not found</h1>
        <Link to="/" className="text-b2b text-sm mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted">
          <Link to="/" className="hover:text-primary no-underline text-muted">Home</Link>
          <ChevronRight size={14} />
          <span className="text-primary font-medium">{collection.name}</span>
        </nav>
      </div>

      {/* Collection Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">{collection.name}</h1>
            <p className="text-muted mt-1">
              {collectionProducts.length} product{collectionProducts.length !== 1 ? 's' : ''}
              {isLoggedIn && <span className="text-b2b ml-2 font-medium">- B2B Pricing</span>}
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-muted border border-border rounded-lg hover:border-gray-300">
            <SlidersHorizontal size={14} />
            Filter
          </button>
        </div>

        {/* Collection Nav */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          {collections.map(c => (
            <Link
              key={c.id}
              to={`/collections/${c.handle}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium no-underline transition-colors ${
                c.handle === handle
                  ? isLoggedIn
                    ? 'bg-b2b text-white'
                    : 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-primary hover:bg-gray-100'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {collectionProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted">No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {collectionProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
