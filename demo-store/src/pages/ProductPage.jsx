import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Tag, Check, BadgePercent, Info } from 'lucide-react';
import { getProductByHandle, getVariantB2BPrice } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const STOCK_CFG = {
  in_stock: { dot: 'bg-green-500', label: 'In stock' },
  low_stock: { dot: 'bg-yellow-500', label: 'Low stock' },
  out_of_stock: { dot: 'bg-red-500', label: 'Out of stock' },
  pre_order: { dot: 'bg-orange-500', label: 'Pre-order' },
};

function VariantOrderTable({ product, onAddToCart, viewMode = 'expanded' }) {
  const [expandedColors, setExpandedColors] = useState(
    () => new Set(product.variantColors || [])
  );
  const [quantities, setQuantities] = useState({});

  // Compact mode state
  const [compactColor, setCompactColor] = useState(product.variantColors?.[0] || '');
  const [compactSize, setCompactSize] = useState('');
  const [compactQty, setCompactQty] = useState(1);

  // Derive sizes from variant names for the selected color
  const compactSizes = useMemo(() => {
    return product.variants
      .filter(v => v.name.includes(compactColor))
      .map(v => ({ size: v.name.split(' / ')[0]?.trim(), variant: v }));
  }, [product, compactColor]);

  // Auto-select first size when color changes
  useMemo(() => {
    if (compactSizes.length > 0 && !compactSizes.find(s => s.size === compactSize)) {
      setCompactSize(compactSizes[0].size);
    }
  }, [compactSizes]);

  const compactSelectedVariant = useMemo(() => {
    return compactSizes.find(s => s.size === compactSize)?.variant;
  }, [compactSizes, compactSize]);

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

  // Compact mode handler
  const handleCompactAddToCart = () => {
    if (!compactSelectedVariant || compactQty < 1) return;
    const unitPrice = getVariantB2BPrice(compactSelectedVariant, product, compactQty);
    onAddToCart([{ variant: compactSelectedVariant, quantity: compactQty, unitPrice }]);
    setCompactQty(1);
  };

  if (viewMode === 'compact') {
    const sv = compactSelectedVariant;
    const unitPrice = sv ? getVariantB2BPrice(sv, product, compactQty) : 0;
    const compactTotal = unitPrice * compactQty;
    const stockInfo = sv ? STOCK_CFG[sv.stock] : STOCK_CFG.in_stock;
    const isDisabled = sv?.stock === 'out_of_stock';

    return (
      <div className="space-y-4">
        {/* Variant Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border rounded-lg px-3 py-2.5">
            <div className="text-[11px] text-muted mb-0.5">Color</div>
            <div className="flex items-center justify-between">
              <select
                value={compactColor}
                onChange={e => setCompactColor(e.target.value)}
                className="text-[14px] font-semibold text-primary bg-transparent border-none outline-none cursor-pointer w-full appearance-none"
              >
                {(product.variantColors || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={16} className="text-muted flex-shrink-0" />
            </div>
          </div>
          <div className="border border-border rounded-lg px-3 py-2.5">
            <div className="text-[11px] text-muted mb-0.5">Size</div>
            <div className="flex items-center justify-between">
              <select
                value={compactSize}
                onChange={e => setCompactSize(e.target.value)}
                className="text-[14px] font-semibold text-primary bg-transparent border-none outline-none cursor-pointer w-full appearance-none"
              >
                {compactSizes.map(s => (
                  <option key={s.size} value={s.size}>{s.size}</option>
                ))}
              </select>
              <ChevronDown size={16} className="text-muted flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Volume Discount Banner */}
        <div className="relative group/vol">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-lg cursor-pointer">
            <BadgePercent size={16} className="text-blue-600" />
            <span className="text-[13px] text-blue-600 font-medium">Volume discount</span>
          </div>
          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover/vol:block bg-white border border-border rounded-lg shadow-lg p-0 min-w-[260px]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-primary px-3 py-2">Quantity</th>
                  <th className="text-left font-semibold text-primary px-3 py-2">Price</th>
                  <th className="text-left font-semibold text-primary px-3 py-2">Discount</th>
                </tr>
              </thead>
              <tbody>
                {product.quantityBreaks.map((qb, i) => {
                  const basePrice = product.quantityBreaks[0].price;
                  const discount = i === 0 ? 0 : Math.round(((basePrice - qb.price) / basePrice) * 100 * 10) / 10;
                  return (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-1.5 font-semibold text-primary">{qb.min}+</td>
                      <td className="px-3 py-1.5 font-semibold text-primary">${qb.price.toFixed(2)}</td>
                      <td className="px-3 py-1.5 font-semibold text-blue-600">{i === 0 ? '-' : `${discount}% Off`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Qty + Add to Cart */}
        <div className="flex items-start gap-3">
          <div>
            <div className="inline-flex items-center border border-border rounded-lg">
              <button
                onClick={() => setCompactQty(q => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-muted hover:text-primary text-lg"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={compactQty}
                onChange={e => setCompactQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-12 text-center text-[15px] font-semibold border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setCompactQty(q => q + 1)}
                className="w-10 h-12 flex items-center justify-center text-muted hover:text-primary text-lg"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="relative group/qty block mt-1">
              <div className="text-[11px] text-muted flex items-center gap-0.5 cursor-pointer">
                <Info size={11} /> Qty rules apply
              </div>
              <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover/qty:block bg-white border border-border rounded-lg shadow-lg px-3 py-2 min-w-[100px]">
                <div className="text-[11px] text-primary leading-relaxed">
                  <div>Min: {product.quantityBreaks[0]?.min || 1}</div>
                  <div>Max: {product.quantityBreaks[product.quantityBreaks.length - 1]?.max || product.quantityBreaks[product.quantityBreaks.length - 1]?.min * 4}</div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleCompactAddToCart}
            disabled={isDisabled}
            className={`flex-1 h-12 rounded-lg font-semibold text-[15px] flex items-center justify-center gap-2 transition-all ${
              !isDisabled
                ? 'bg-b2b text-white hover:bg-b2b-hover cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add to cart - ${compactTotal.toFixed(2)}
          </button>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-primary font-medium">
            {sv?.stock === 'in_stock' ? 'In Stock' : sv?.stock === 'low_stock' ? 'Low Stock' : sv?.stock === 'pre_order' ? 'Pre-order' : 'Out of Stock'}
          </span>
          <span className={`w-2 h-2 rounded-full ${stockInfo.dot}`} />
          <span className="text-green-600 font-medium">
            {sv?.stockQty > 100 ? '100+' : sv?.stockQty > 0 ? `${sv.stockQty}+` : '0'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden text-[13px]">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_130px_70px_110px] bg-gray-50 border-b border-border px-3 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
        <div className="flex items-center gap-2">
          Product / Variant
          <span className="font-normal normal-case tracking-normal text-blue-500 cursor-pointer">Expand</span>
        </div>
        <div>Price</div>
        <div>Stock</div>
        <div>Qty</div>
      </div>

      <div className="divide-y divide-border">
        {Object.entries(groupedVariants).map(([color, variants]) => {
          const isExpanded = expandedColors.has(color);
          const colorStock = variants.reduce((s, v) => s + v.stockQty, 0);
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
                    <span className="text-[11px] text-muted">{variants.length} Variants</span>
                  </div>
                </div>
                <div className="text-[12px] text-primary font-medium whitespace-pre-line">{priceRange}</div>
                <div className="text-[12px] text-muted">{colorStock > 0 ? `${colorStock}+` : '0'}</div>
                <div />
              </div>

              {/* Expanded Variant Rows */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {variants.map(variant => {
                    const qty = quantities[variant.sku] || 0;
                    const unitPrice = getVariantB2BPrice(variant, product, totalQty);
                    const stockInfo = STOCK_CFG[variant.stock];
                    const isDisabled = variant.stock === 'out_of_stock';

                    return viewMode === 'expanded' ? (
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
                          <div className="relative group/vol inline-block">
                            <span className="text-[10px] text-blue-600 font-medium cursor-pointer inline-flex items-center gap-0.5"><BadgePercent size={11} /> Volume discoun...</span>
                            <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover/vol:block bg-white border border-border rounded-lg shadow-lg p-0 min-w-[220px]">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left font-semibold text-primary px-3 py-2">Quantity</th>
                                    <th className="text-left font-semibold text-primary px-3 py-2">Price</th>
                                    <th className="text-left font-semibold text-primary px-3 py-2">Discount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.quantityBreaks.map((qb, i) => {
                                    const basePrice = product.quantityBreaks[0].price;
                                    const discount = i === 0 ? 0 : Math.round(((basePrice - qb.price) / basePrice) * 100 * 10) / 10;
                                    return (
                                      <tr key={i} className="border-b border-gray-100 last:border-0">
                                        <td className="px-3 py-1.5 font-semibold text-primary">{qb.min}+</td>
                                        <td className="px-3 py-1.5 font-semibold text-primary">${qb.price.toFixed(2)}</td>
                                        <td className="px-3 py-1.5 font-semibold text-blue-600">{i === 0 ? '-' : `${discount}% Off`}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="flex items-center gap-1">
                          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${stockInfo.dot}`} />
                          <span className="text-[11px] text-muted">
                            {variant.stock === 'pre_order' ? 'Pre-order'
                              : variant.stock === 'out_of_stock' ? '0'
                              : variant.stockQty > 100 ? '100+'
                              : `${variant.stockQty}+`}
                          </span>
                        </div>

                        {/* Qty */}
                        <div>
                          {!isDisabled ? (
                            <div>
                              <div className="inline-flex items-center">
                                <button
                                  onClick={e => { e.stopPropagation(); setQty(variant.sku, qty - 1); }}
                                  className="w-8 h-8 flex items-center justify-center border border-border rounded-l text-muted hover:text-primary hover:bg-gray-50 text-[13px]"
                                >
                                  <Minus size={12} />
                                </button>
                                <input
                                  type="number"
                                  value={qty || ''}
                                  placeholder="0"
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => setQty(variant.sku, e.target.value)}
                                  className="w-10 h-8 text-center text-[13px] font-medium border-y border-border focus:outline-none focus:border-b2b [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={e => { e.stopPropagation(); setQty(variant.sku, qty + 1); }}
                                  className="w-8 h-8 flex items-center justify-center border border-border rounded-r text-muted hover:text-primary hover:bg-gray-50 text-[13px]"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <div className="relative group/qty inline-block mt-0.5">
                                <div className="text-[9px] text-muted flex items-center gap-0.5 cursor-pointer"><Info size={9} /> Qty rules apply</div>
                                <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover/qty:block bg-white border border-border rounded-lg shadow-lg px-3 py-2 min-w-[100px]">
                                  <div className="text-[11px] text-primary leading-relaxed">
                                    <div>Min: {product.quantityBreaks[0]?.min || 1}</div>
                                    <div>Max: {product.quantityBreaks[product.quantityBreaks.length - 1]?.max || product.quantityBreaks[product.quantityBreaks.length - 1]?.min * 4}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted">Unavailable</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Compact row */
                      <div
                        key={variant.sku}
                        className={`grid grid-cols-[1fr_130px_70px_110px] items-center px-3 py-1.5 ${isDisabled ? 'opacity-40' : ''}`}
                      >
                        <div className="pl-[46px]">
                          <span className="font-medium text-primary text-[12px]">{variant.name}</span>
                        </div>
                        <div className="font-semibold text-primary text-[12px]">${unitPrice.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${stockInfo.dot}`} />
                          <span className="text-[11px] text-muted">
                            {variant.stock === 'pre_order' ? 'Pre-order'
                              : variant.stock === 'out_of_stock' ? '0'
                              : variant.stockQty > 100 ? '100+'
                              : `${variant.stockQty}+`}
                          </span>
                        </div>
                        <div>
                          {!isDisabled ? (
                            <div className="inline-flex items-center">
                              <button
                                onClick={e => { e.stopPropagation(); setQty(variant.sku, qty - 1); }}
                                className="w-7 h-7 flex items-center justify-center border border-border rounded-l text-muted hover:text-primary hover:bg-gray-50 text-[11px]"
                              ><Minus size={10} /></button>
                              <input
                                type="number"
                                value={qty || ''}
                                placeholder="0"
                                onClick={e => e.stopPropagation()}
                                onChange={e => setQty(variant.sku, e.target.value)}
                                className="w-8 h-7 text-center text-[11px] font-medium border-y border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={e => { e.stopPropagation(); setQty(variant.sku, qty + 1); }}
                                className="w-7 h-7 flex items-center justify-center border border-border rounded-r text-muted hover:text-primary hover:bg-gray-50 text-[11px]"
                              ><Plus size={10} /></button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted">—</span>
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
      <div className="px-4 py-2.5 border-t border-border flex items-center gap-5 text-[12px] text-gray-600">
        <span className="flex items-center gap-1.5"><span className="w-[8px] h-[8px] rounded-full bg-green-500" /> In stock</span>
        <span className="flex items-center gap-1.5"><span className="w-[8px] h-[8px] rounded-full bg-red-500" /> Out of stock</span>
        <span className="flex items-center gap-1.5"><span className="w-[8px] h-[8px] rounded-full bg-blue-500" /> Pre-order</span>
        <span className="flex items-center gap-1.5"><span className="w-[8px] h-[8px] rounded-full bg-orange-400" /> Low stock</span>
      </div>

      {/* Add to Cart Bar */}
      <div className="px-4 py-3 border-t border-border">
        <button
          onClick={handleAddAll}
          disabled={totalQty === 0}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all ${
            totalQty > 0
              ? 'bg-b2b text-white hover:bg-b2b-hover cursor-pointer'
              : 'bg-b2b/80 text-white/60 cursor-not-allowed'
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
  const [viewMode, setViewMode] = useState('expanded');

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

            {/* B2B: View Mode Tabs + Variant Ordering Table */}
            {isLoggedIn ? (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setViewMode('expanded')}
                    className={`px-5 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      viewMode === 'expanded'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted border-border hover:border-gray-300'
                    }`}
                  >
                    Expanded
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-5 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      viewMode === 'compact'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted border-border hover:border-gray-300'
                    }`}
                  >
                    Compact
                  </button>
                </div>
                <VariantOrderTable product={product} onAddToCart={handleB2BAddToCart} viewMode={viewMode} />
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
