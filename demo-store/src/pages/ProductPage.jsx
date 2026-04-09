import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, Fragment } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Tag, Check } from 'lucide-react';
import { getProductByHandle, getVariantB2BPrice } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const STOCK_CONFIG = {
  in_stock: { dot: 'bg-green-500', text: 'text-green-600', label: 'In stock' },
  low_stock: { dot: 'bg-yellow-500', text: 'text-yellow-600', label: 'Low stock' },
  out_of_stock: { dot: 'bg-red-500', text: 'text-red-500', label: 'Out of stock' },
  pre_order: { dot: 'bg-blue-500', text: 'text-blue-600', label: 'Pre-order' },
};

function VariantOrderTable({ product, onAddToCart }) {
  const [expandedColors, setExpandedColors] = useState(
    () => new Set(product.variantColors || [])
  );
  const [quantities, setQuantities] = useState({});

  const toggleColor = (color) => {
    setExpandedColors(prev => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  const expandAll = () => setExpandedColors(new Set(product.variantColors || []));

  const setQty = (sku, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setQuantities(prev => ({ ...prev, [sku]: num }));
  };

  const totalQty = useMemo(
    () => Object.values(quantities).reduce((s, q) => s + q, 0),
    [quantities]
  );

  const totalPrice = useMemo(() => {
    return product.variants.reduce((sum, v) => {
      const qty = quantities[v.sku] || 0;
      if (qty === 0) return sum;
      const unitPrice = getVariantB2BPrice(v, product, totalQty);
      return sum + unitPrice * qty;
    }, 0);
  }, [quantities, totalQty, product]);

  const groupedVariants = useMemo(() => {
    const groups = {};
    for (const color of (product.variantColors || [])) {
      groups[color] = product.variants.filter(v => v.name.includes(color));
    }
    return groups;
  }, [product]);

  const handleAddAll = () => {
    const items = product.variants
      .filter(v => (quantities[v.sku] || 0) > 0)
      .map(v => ({
        variant: v,
        quantity: quantities[v.sku],
        unitPrice: getVariantB2BPrice(v, product, totalQty),
      }));
    if (items.length > 0) {
      onAddToCart(items);
      setQuantities({});
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_140px_80px_120px] border-b border-border px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <span>Product / Variant</span>
          <button onClick={expandAll} className="font-normal normal-case tracking-normal text-blue-600 cursor-pointer hover:underline">Expand</button>
        </div>
        <div>Price</div>
        <div className="text-center">Stock</div>
        <div className="text-center">Qty</div>
      </div>

      {/* Groups */}
      <div className="divide-y divide-border">
        {Object.entries(groupedVariants).map(([color, variants]) => {
          const isExpanded = expandedColors.has(color);
          const colorStock = variants.reduce((s, v) => s + v.stockQty, 0);
          const colorVariantCount = variants.length;
          const prices = variants.map(v => v.price);
          const minP = Math.min(...prices);

          return (
            <div key={color}>
              {/* Color Group Row */}
              <div
                className="grid grid-cols-[1fr_140px_80px_120px] items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleColor(color)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-surface flex-shrink-0 border border-gray-100">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary text-[13px]">{color}</span>
                      {isExpanded
                        ? <ChevronUp size={13} className="text-muted" />
                        : <ChevronDown size={13} className="text-muted" />
                      }
                    </div>
                    <span className="text-[11px] text-muted">{colorVariantCount} Variants</span>
                  </div>
                </div>
                <div className="text-[13px] text-primary font-semibold">${minP.toFixed(2)}</div>
                <div className="text-center text-[13px] text-muted">{colorStock > 0 ? `${colorStock}+` : '0'}</div>
                <div />
              </div>

              {/* Expanded Variant Rows */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {variants.map(variant => {
                    const qty = quantities[variant.sku] || 0;
                    const unitPrice = getVariantB2BPrice(variant, product, totalQty);
                    const stockInfo = STOCK_CONFIG[variant.stock];
                    const isDisabled = variant.stock === 'out_of_stock';

                    return (
                      <div
                        key={variant.sku}
                        className={`grid grid-cols-[1fr_140px_80px_120px] items-center px-4 py-3 ${isDisabled ? 'opacity-40' : ''}`}
                      >
                        {/* Variant info */}
                        <div className="flex items-center gap-3 pl-[52px]">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-surface flex-shrink-0 border border-gray-100">
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-semibold text-primary text-[13px]">{variant.name}</div>
                            <div className="text-[10px] text-muted leading-relaxed">
                              SKU: {variant.sku}<br />
                              CODE: {variant.code}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div>
                          <div className="font-bold text-primary text-[13px]">${unitPrice.toFixed(2)} USD</div>
                          <div className="text-[11px] text-muted line-through">MSRP ${variant.retailPrice.toFixed(2)} USD</div>
                          <span className="relative group/vol inline-block">
                            <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">Volume discount</span>
                            <div className="hidden group-hover/vol:block absolute bottom-full left-0 mb-1.5 z-20 bg-white border border-border rounded-lg shadow-xl min-w-[260px] animate-[fadeIn_0.15s_ease-out]">
                              <table className="w-full text-[12px]">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left px-3 py-2 font-semibold text-primary">Quantity</th>
                                    <th className="text-left px-3 py-2 font-semibold text-primary">Price</th>
                                    <th className="text-left px-3 py-2 font-semibold text-primary">Discount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.quantityBreaks.map((tier, ti) => {
                                    const disc = Math.round((1 - tier.price / variant.retailPrice) * 100);
                                    return (
                                      <tr key={ti} className="border-b border-gray-100 last:border-0">
                                        <td className="px-3 py-1.5 text-primary">{tier.min}+</td>
                                        <td className="px-3 py-1.5 text-primary font-medium">${tier.price.toFixed(2)}</td>
                                        <td className="px-3 py-1.5">{disc > 0 ? <span className="text-blue-600">{disc}.0% Off</span> : <span className="text-muted">-</span>}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </span>
                        </div>

                        {/* Stock */}
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${stockInfo.dot}`} />
                          <span className={`text-[13px] font-medium ${stockInfo.text}`}>
                            {variant.stockQty > 0 ? variant.stockQty : stockInfo.label}
                          </span>
                        </div>

                        {/* Qty */}
                        <div className="text-center">
                          {!isDisabled ? (
                            <div>
                              <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                                <button
                                  onClick={() => setQty(variant.sku, qty - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary hover:bg-gray-50 border-r border-border"
                                >
                                  <Minus size={12} />
                                </button>
                                <input
                                  type="number"
                                  value={qty || ''}
                                  placeholder="0"
                                  onChange={e => setQty(variant.sku, e.target.value)}
                                  className="w-10 h-7 text-center text-[12px] font-semibold border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => setQty(variant.sku, qty + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary hover:bg-gray-50 border-l border-border"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <div className="relative group/qty inline-block mt-0.5">
                                <span className="text-[10px] text-blue-500 hover:underline cursor-pointer">Qty rules apply</span>
                                <div className="hidden group-hover/qty:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 bg-white border border-border rounded-lg shadow-xl min-w-[120px] px-3 py-2 animate-[fadeIn_0.15s_ease-out]">
                                  <p className="text-[12px] text-primary font-medium whitespace-nowrap">Min: {product.quantityBreaks[0]?.min || 1}</p>
                                  <p className="text-[12px] text-primary font-medium whitespace-nowrap">Max: {product.quantityBreaks[product.quantityBreaks.length - 1]?.min * 4 || 200}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted">Unavailable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stock Legend */}
      <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-green-500" /> In stock</span>
        <span className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-red-500" /> Out of stock</span>
        <span className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-blue-500" /> Pre-order</span>
        <span className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-yellow-500" /> Low stock</span>
      </div>

      {/* Add to Cart Bar */}
      <div className="px-4 py-3 border-t border-border">
        <button
          onClick={handleAddAll}
          disabled={totalQty === 0}
          className={`w-full py-3.5 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
            totalQty > 0
              ? 'bg-b2b text-white hover:bg-b2b-hover cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={18} />
          {totalQty > 0
            ? `Add to cart - $${totalPrice.toFixed(2)}`
            : 'Select quantities to add'
          }
        </button>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { handle } = useParams();
  const product = getProductByHandle(handle);
  const { isLoggedIn, setShowLoginModal } = useAuth();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Guest-mode state
  const [guestVariant, setGuestVariant] = useState(0);
  const [guestQty, setGuestQty] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-primary">Product not found</h1>
        <Link to="/" className="text-b2b text-sm mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  const collectionMap = {
    tops: 'tops',
    knitwear: 'knitwear',
    outerwear: 'outerwear',
    accessories: 'accessories',
  };

  const handleB2BAddToCart = (items) => {
    for (const item of items) {
      addItem(product, item.quantity, item.variant.name);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleGuestAddToCart = () => {
    const v = product.variants[guestVariant];
    addItem(product, guestQty, v.name);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const savings = product.price - product.b2bPrice;
  const savingsPercent = Math.round((savings / product.price) * 100);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted">
          <Link to="/" className="hover:text-primary no-underline text-muted">Home</Link>
          <ChevronRight size={14} />
          <Link
            to={`/collections/${collectionMap[product.collection] || 'all'}`}
            className="hover:text-primary no-underline text-muted capitalize"
          >
            {product.collection}
          </Link>
          <ChevronRight size={14} />
          <span className="text-primary font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface mb-3">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-b2b' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">{product.sku}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">{product.name}</h1>

            {/* Pricing summary */}
            {isLoggedIn ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-b2b">${product.b2bPrice.toFixed(2)}</span>
                  <span className="text-sm text-muted">MSRP ${product.price.toFixed(2)}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-b2b-light text-b2b text-xs font-medium rounded-md">
                  <Tag size={12} />
                  Profit Margin ${savings.toFixed(2)} ({savingsPercent}%)
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
              </div>
            )}

            {addedToCart && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
                <Check size={16} />
                Added to cart!
              </div>
            )}

            {/* B2B: NetWise Variant Ordering Table */}
            {isLoggedIn ? (
              <div className="mt-5">
                <VariantOrderTable product={product} onAddToCart={handleB2BAddToCart} />
              </div>
            ) : (
              /* Guest: Simple variant picker + add to cart */
              <div className="mt-5 space-y-4">
                <p className="text-sm text-muted leading-relaxed">{product.description}</p>

                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Option</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <button
                        key={v.sku}
                        onClick={() => setGuestVariant(i)}
                        disabled={v.stock === 'out_of_stock'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          guestVariant === i
                            ? 'border-primary bg-gray-50 text-primary'
                            : v.stock === 'out_of_stock'
                              ? 'border-border text-gray-300 cursor-not-allowed'
                              : 'border-border text-muted hover:border-gray-300'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setGuestQty(q => Math.max(1, q - 1))}
                      className="px-3 py-2.5 text-muted hover:text-primary"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={guestQty}
                      onChange={e => setGuestQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center py-2.5 text-sm font-medium border-x border-border focus:outline-none"
                    />
                    <button
                      onClick={() => setGuestQty(q => q + 1)}
                      className="px-3 py-2.5 text-muted hover:text-primary"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleGuestAddToCart}
                    className="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-2.5 border border-b2b text-b2b font-medium rounded-lg hover:bg-b2b-light transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  <Tag size={14} />
                  Login for B2B pricing — save up to {savingsPercent}%
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
