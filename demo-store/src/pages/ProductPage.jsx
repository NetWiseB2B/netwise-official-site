import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, Fragment } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Tag, Check } from 'lucide-react';
import { getProductByHandle, getVariantB2BPrice } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const STOCK_CONFIG = {
  in_stock: { color: 'bg-green-500', label: 'In stock' },
  low_stock: { color: 'bg-yellow-500', label: 'Low stock' },
  out_of_stock: { color: 'bg-red-500', label: 'Out of stock' },
  pre_order: { color: 'bg-orange-500', label: 'Pre-order' },
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
    <div className="border border-border rounded-lg overflow-hidden text-[13px]">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_130px_70px_110px] bg-gray-50 border-b border-border px-3 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
        <div className="flex items-center gap-2">
          Product / Variant
          <span className="font-normal normal-case tracking-normal text-blue-500 cursor-pointer">Expand</span>
        </div>
        <div>Price</div>
        <div className="text-center">Stock</div>
        <div className="text-center">Qty</div>
      </div>

      <div className="divide-y divide-border">
        {Object.entries(groupedVariants).map(([color, variants]) => {
          const isExpanded = expandedColors.has(color);
          const colorStock = variants.reduce((s, v) => s + v.stockQty, 0);
          const colorVariantCount = variants.length;
          const prices = variants.map(v => v.price);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          const priceRange = minP === maxP ? `$${minP.toFixed(2)}` : `$${minP.toFixed(2)} -\n$${maxP.toFixed(2)}`;

          return (
            <div key={color}>
              {/* Color Group Row */}
              <div
                className="grid grid-cols-[1fr_130px_70px_110px] items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleColor(color)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded overflow-hidden bg-surface flex-shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-primary text-[13px]">{color}</span>
                      {isExpanded
                        ? <ChevronUp size={12} className="text-muted" />
                        : <ChevronDown size={12} className="text-muted" />
                      }
                    </div>
                    <span className="text-[11px] text-muted">{colorVariantCount} Variants</span>
                  </div>
                </div>
                <div className="text-[12px] text-primary font-medium whitespace-pre-line">{priceRange}</div>
                <div className="text-center text-[12px] text-muted">{colorStock > 0 ? `${colorStock}+` : '0'}</div>
                <div />
              </div>

              {/* Expanded Variant Rows */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {variants.map(variant => {
                    const qty = quantities[variant.sku] || 0;
                    const unitPrice = getVariantB2BPrice(variant, product, totalQty);
                    const hasVolumeDiscount = unitPrice < variant.price;
                    const stockInfo = STOCK_CONFIG[variant.stock];
                    const isDisabled = variant.stock === 'out_of_stock';

                    return (
                      <div
                        key={variant.sku}
                        className={`grid grid-cols-[1fr_130px_70px_110px] items-center px-3 py-2 ${isDisabled ? 'opacity-40' : ''}`}
                      >
                        {/* Variant info */}
                        <div className="flex items-center gap-2.5 pl-[46px]">
                          <div className="w-9 h-9 rounded overflow-hidden bg-surface flex-shrink-0">
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="leading-tight">
                            <div className="font-medium text-primary text-[12px]">{variant.name}</div>
                            <div className="text-[10px] text-muted leading-relaxed">
                              SKU: {variant.sku}<br />
                              CODE: {variant.code}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="leading-tight">
                          <div className="font-semibold text-primary text-[12px]">${unitPrice.toFixed(2)} USD</div>
                          <div className="text-[10px] text-muted">MSRP ${variant.retailPrice.toFixed(2)} USD</div>
                          {hasVolumeDiscount ? (
                            <span className="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">Volume discount</span>
                          ) : (
                            <span className="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">Volume discount</span>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="flex items-center justify-center gap-1">
                          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${stockInfo.color}`} />
                          <span className="text-[11px] text-muted">
                            {variant.stockQty > 0 ? variant.stockQty : stockInfo.label}
                          </span>
                        </div>

                        {/* Qty */}
                        <div className="text-center">
                          {!isDisabled ? (
                            <div>
                              <div className="inline-flex items-center">
                                <button
                                  onClick={() => setQty(variant.sku, qty - 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-border rounded-l text-muted hover:text-primary hover:bg-gray-50 text-[11px]"
                                >
                                  <Minus size={10} />
                                </button>
                                <input
                                  type="number"
                                  value={qty || ''}
                                  placeholder="0"
                                  onChange={e => setQty(variant.sku, e.target.value)}
                                  className="w-9 h-6 text-center text-[11px] border-y border-border focus:outline-none focus:border-b2b [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => setQty(variant.sku, qty + 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-border rounded-r text-muted hover:text-primary hover:bg-gray-50 text-[11px]"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <div className="text-[9px] text-blue-500 hover:underline cursor-pointer mt-0.5">Qty rules apply</div>
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
      <div className="px-3 py-1.5 border-t border-border bg-gray-50 flex items-center gap-3 text-[10px] text-muted">
        <span className="flex items-center gap-1"><span className="w-[6px] h-[6px] rounded-full bg-green-500" /> In stock</span>
        <span className="flex items-center gap-1"><span className="w-[6px] h-[6px] rounded-full bg-red-500" /> Out of stock</span>
        <span className="flex items-center gap-1"><span className="w-[6px] h-[6px] rounded-full bg-orange-500" /> Pre-order</span>
        <span className="flex items-center gap-1"><span className="w-[6px] h-[6px] rounded-full bg-yellow-500" /> Low stock</span>
      </div>

      {/* Add to Cart Bar */}
      <div className="px-3 py-2.5 bg-b2b">
        <button
          onClick={handleAddAll}
          disabled={totalQty === 0}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            totalQty > 0
              ? 'bg-white text-b2b hover:bg-teal-50 cursor-pointer'
              : 'bg-white/20 text-white/60 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
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
