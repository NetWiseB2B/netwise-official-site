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
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted uppercase tracking-wider">{product.sku}</p>
        <h3 className="text-sm font-medium text-primary leading-snug group-hover:text-b2b transition-colors">
          {product.name}
        </h3>

        {isLoggedIn ? (
          product.b2bPriceRange && product.priceRange ? (
            <div>
              <div className="text-[15px] font-semibold text-b2b">
                From ${product.b2bPriceRange.min.toFixed(2)}-${product.b2bPriceRange.max.toFixed(2)}
              </div>
              <div className="text-[12px] text-muted">
                MSRP ${product.priceRange.min.toFixed(2)}-${product.priceRange.max.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold text-b2b">${product.b2bPrice.toFixed(2)}</span>
              <span className="text-[15px] text-muted">MSRP ${product.price.toFixed(2)}</span>
            </div>
          )
        ) : (
          <div>
            {product.priceRange ? (
              <span className="text-[15px] font-semibold text-primary">
                From ${product.priceRange.min.toFixed(2)} - ${product.priceRange.max.toFixed(2)}
              </span>
            ) : (
              <span className="text-[15px] font-semibold text-primary">${product.price.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
