import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag } from 'lucide-react';

export default function ProductCard({ product }) {
  const { isLoggedIn } = useAuth();

  const savings = Math.round((1 - product.b2bPrice / product.price) * 100);
  const lowestTier = product.quantityBreaks?.[product.quantityBreaks.length - 1];

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block no-underline text-inherit"
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-surface mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted uppercase tracking-wider">{product.sku}</p>
        <h3 className="text-sm font-medium text-primary leading-snug group-hover:text-b2b transition-colors">
          {product.name}
        </h3>

        {isLoggedIn ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-b2b">${product.b2bPrice.toFixed(2)}</span>
            <span className="text-sm text-muted">MSRP ${product.price.toFixed(2)}</span>
          </div>
        ) : (
          <div>
            <span className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
