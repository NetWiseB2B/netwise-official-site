import { X, Minus, Plus, Trash2, ShoppingCart, Search, ChevronDown, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

const STOCK_CONFIG = {
  in_stock: { color: 'bg-green-500', textColor: 'text-green-600', label: 'In stock' },
  low_stock: { color: 'bg-yellow-500', textColor: 'text-yellow-600', label: 'Low stock' },
  out_of_stock: { color: 'bg-red-500', textColor: 'text-red-500', label: 'Out of stock' },
  pre_order: { color: 'bg-orange-500', textColor: 'text-orange-600', label: 'Pre-order' },
};

export default function NetWiseCart() {
  const { items, addItem, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { company } = useAuth();
  const [maximised, setMaximised] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('net_terms');

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    for (const p of products) {
      for (const v of p.variants) {
        if (
          v.name.toLowerCase().includes(q) ||
          v.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
        ) {
          results.push({ product: p, variant: v });
        }
        if (results.length >= 6) break;
      }
      if (results.length >= 6) break;
    }
    return results;
  }, [searchQuery]);

  if (!isCartOpen) return null;

  const lineItems = items.map(item => {
    const variantObj = item.product.variants.find(v => v.name === item.variant);
    const unitPrice = variantObj ? variantObj.price : item.product.b2bPrice;
    const retailPrice = variantObj ? variantObj.retailPrice : item.product.price;
    const stock = variantObj ? variantObj.stock : 'in_stock';
    const stockQty = variantObj ? variantObj.stockQty : 100;
    const sku = variantObj ? variantObj.sku : item.product.sku;
    return { ...item, unitPrice, retailPrice, stock, stockQty, sku, lineTotal: unitPrice * item.quantity };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const lineCount = lineItems.length;

  const handleSearchAdd = (product, variant) => {
    addItem(product, 1, variant.name);
    setSearchQuery('');
    setShowSearch(false);
  };

  const parseVariant = (variantName) => variantName.split(' / ');

  // Maximised = centered modal, Minimised = right drawer
  const panelClasses = maximised
    ? 'absolute right-0 top-0 bottom-0 w-full max-w-[1000px] rounded-l-xl'
    : 'absolute right-0 top-0 bottom-0 w-full max-w-md';

  const wrapperClasses = 'fixed inset-0 z-[90]';

  return (
    <div className={wrapperClasses}>
      <div className="absolute inset-0 bg-black/50" onClick={() => { setIsCartOpen(false); setShowCheckout(false); }} />
      <div className={`${panelClasses} bg-white shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out] transition-[max-width] duration-300 ease-in-out overflow-hidden`}>

        {/* Header — same style for both states, just toggle text */}
        <div className="bg-[#F6F6F6] px-5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0px 1px 0px 0px #DDDDDD' }}>
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 pr-4 py-4">
              <ShoppingCart size={20} className="text-b2b" />
              <span className="font-bold text-primary text-[17px]">My cart</span>
            </div>
            <div className="border-l border-[#DDDDDD] pl-4 py-4">
              <button
                onClick={() => setMaximised(!maximised)}
                className="flex items-center gap-1.5 text-[13px] text-muted hover:text-primary transition-colors"
              >
                {maximised
                  ? <><Minimize2 size={14} className="text-b2b" /> Minimise</>
                  : <><Maximize2 size={14} className="text-b2b" /> Maximise</>
                }
              </button>
            </div>
          </div>
          <button
            onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}
            className="p-1.5 text-gray-400 hover:text-primary rounded-md hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-[#DDDDDD] flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Add products by SKU, Name"
                className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-[13px] focus:outline-none focus:border-b2b focus:ring-1 focus:ring-b2b/20"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {searchResults.map(({ product, variant }) => (
                    <button
                      key={variant.sku}
                      onClick={() => handleSearchAdd(product, variant)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded overflow-hidden bg-surface flex-shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-primary truncate">{product.name}</div>
                        <div className="text-[10px] text-muted">{variant.name} &middot; {variant.sku}</div>
                      </div>
                      <div className="text-[12px] font-semibold text-primary">${variant.price.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowActions(prev => !prev)}
                className="px-3 py-2 border border-border rounded-lg text-[13px] text-muted hover:text-primary hover:border-gray-300 flex items-center gap-1.5"
              >
                Actions
                <ChevronDown size={12} />
              </button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[160px] overflow-hidden">
                  <button
                    onClick={() => { clearCart(); setShowActions(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-red-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart size={40} className="text-gray-200 mb-3" />
            <p className="text-muted font-medium text-sm">Your cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">Search and add products above</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-[#DDDDDD]">
              {lineItems.map(item => {
                const variantParts = parseVariant(item.variant);
                const stockInfo = STOCK_CONFIG[item.stock];

                return (
                  <div key={item.key} className="px-5 py-4">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <Link
                        to={`/products/${item.product.handle}`}
                        onClick={() => setIsCartOpen(false)}
                        className="w-[70px] h-[70px] rounded-lg overflow-hidden bg-surface flex-shrink-0"
                      >
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] text-muted mb-0.5">SKU: {item.sku}</div>
                            <h4 className="text-[13px] font-bold text-primary leading-snug">{item.product.name}</h4>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[14px] font-bold text-primary">${item.lineTotal.toFixed(2)} USD</div>
                            <div className="text-[11px] text-muted line-through">${(item.retailPrice * item.quantity).toFixed(2)} USD</div>
                            <div className="text-[11px] text-muted">${item.unitPrice.toFixed(2)} USD Per unit</div>
                          </div>
                        </div>

                        {/* Variant pills */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {variantParts.map((part, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-muted font-medium">
                              {part.trim()}
                            </span>
                          ))}
                        </div>

                        {/* Stock */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className={`w-[7px] h-[7px] rounded-full ${stockInfo.color}`} />
                          <span className={`text-[11px] font-medium ${stockInfo.textColor}`}>
                            {item.stock === 'in_stock'
                              ? `In stock (${item.stockQty}+)`
                              : item.stock === 'low_stock'
                                ? `Low stock (${item.stockQty})`
                                : stockInfo.label
                            }
                          </span>
                        </div>

                        {/* Quantity + Delete */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary hover:bg-gray-50 border-r border-border"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateQuantity(item.key, parseInt(e.target.value) || 0)}
                              className="w-12 h-8 text-center text-[13px] font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary hover:bg-gray-50 border-l border-border"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="w-8 h-8 flex items-center justify-center border border-border rounded-md text-muted hover:text-red-500 hover:border-red-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Qty rules + Volume discount */}
                        <div className="flex items-center gap-1 mt-2">
                          <span className="relative group/qty inline-flex items-center gap-1">
                            <span className="text-[11px] text-muted">@</span>
                            <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">Qty rules apply</span>
                            {/* Qty rules popover */}
                            <div className="hidden group-hover/qty:block absolute bottom-full left-0 mb-1.5 z-20 bg-white border border-border rounded-lg shadow-xl min-w-[140px] px-3.5 py-2.5 animate-[fadeIn_0.15s_ease-out]">
                              <p className="text-[13px] text-primary font-medium">Min: {item.product.quantityBreaks[0]?.min || 1}</p>
                              <p className="text-[13px] text-primary font-medium">Max: {item.product.quantityBreaks[item.product.quantityBreaks.length - 1]?.min * 4 || 200}</p>
                            </div>
                          </span>
                          <span className="text-[11px] text-muted mx-0.5">|</span>
                          <span className="text-[11px] text-muted">@</span>
                          <span className="relative group/vol inline-block">
                            <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">Volume discount</span>
                            {/* Volume discount popover */}
                            <div className="hidden group-hover/vol:block absolute bottom-full left-0 mb-1.5 z-20 bg-white border border-border rounded-lg shadow-xl min-w-[280px] animate-[fadeIn_0.15s_ease-out]">
                              <table className="w-full text-[13px]">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left px-3.5 py-2.5 font-semibold text-primary">Quantity</th>
                                    <th className="text-left px-3.5 py-2.5 font-semibold text-primary">Price</th>
                                    <th className="text-left px-3.5 py-2.5 font-semibold text-primary">Discount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.product.quantityBreaks.map((tier, ti) => {
                                    const discount = Math.round((1 - tier.price / item.retailPrice) * 100);
                                    return (
                                      <tr key={ti} className="border-b border-gray-100 last:border-0">
                                        <td className="px-3.5 py-2 text-primary">{tier.min}+</td>
                                        <td className="px-3.5 py-2 text-primary font-medium">${tier.price.toFixed(2)}</td>
                                        <td className="px-3.5 py-2">
                                          {discount > 0
                                            ? <span className="text-blue-600 font-medium">{discount}.0% Off</span>
                                            : <span className="text-muted">-</span>
                                          }
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#DDDDDD] flex-shrink-0 bg-[#F6F6F6] relative">
            {/* Checkout Popover — slides up from bottom */}
            {showCheckout && (
              <div className="animate-[fadeIn_0.2s_ease-out]">
                {/* Close & edit cart */}
                <div className="flex justify-end px-5 pt-3 pb-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex items-center gap-1.5 text-[13px] text-muted hover:text-primary"
                  >
                    Close & edit cart
                    <X size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="px-5 pb-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[18px] font-bold text-primary">Subtotal</span>
                      <span className="text-[13px] text-muted ml-2">({lineCount} lines, {totalItems} items)</span>
                    </div>
                    <span className="text-[20px] font-bold text-primary">${subtotal.toFixed(2)} USD</span>
                  </div>
                  <p className="text-[12px] text-muted mt-0.5">Taxes and shipping calculated at checkout</p>
                </div>

                {/* Payment Options */}
                <div className="px-5 pb-4">
                  <div className="border-2 border-primary rounded-lg overflow-hidden bg-white divide-y divide-border">
                    {[
                      { id: 'net_terms', label: 'Net terms (30 Days)' },
                      { id: 'pay_online', label: 'Pay online now' },
                      { id: 'submit_review', label: 'Submit for review' },
                    ].map(option => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === option.id ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {paymentMethod === option.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-[14px] font-medium text-primary">{option.label}</span>
                        <input
                          type="radio"
                          name="payment"
                          value={option.id}
                          checked={paymentMethod === option.id}
                          onChange={() => setPaymentMethod(option.id)}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit for review — extra fields */}
                {paymentMethod === 'submit_review' && (
                  <div className="px-5 pb-4 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    {/* My Address */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] font-bold text-primary">My Address</span>
                        <button onClick={() => setShowAddAddress(true)} className="text-[13px] text-muted hover:text-primary">+Add a new address</button>
                      </div>
                      <div className="relative">
                        <select className="w-full appearance-none bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b pr-10">
                          <option>#508, First floor, 6th Block 6th Cross, Bangalore - 560095</option>
                          <option>#42, 2nd Main, Indiranagar, Bangalore - 560038</option>
                        </select>
                        <span className="absolute left-4 top-2 text-[11px] text-muted">Saved Address</span>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      </div>
                    </div>

                    {/* Order Note */}
                    <div>
                      <span className="text-[14px] font-bold text-primary block mb-2">Order Note</span>
                      <textarea
                        placeholder="Message here"
                        rows={4}
                        className="w-full bg-white border border-border rounded-lg px-4 py-3 text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-b2b resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Checkout / Submit Button */}
                <div className="px-5 pb-3">
                  <button className="w-full py-4 bg-b2b text-white font-bold text-[17px] rounded-lg hover:bg-b2b-hover transition-colors">
                    {paymentMethod === 'submit_review' ? 'Submit' : 'Checkout'}
                  </button>
                </div>

                {/* Powered by */}
                <div className="flex items-center justify-center gap-1.5 pb-3">
                  <span className="text-[12px] text-muted">Powered by</span>
                  <span className="text-[12px] font-bold text-b2b">NetWise</span>
                </div>
              </div>
            )}

            {/* Default footer — subtotal + checkout trigger */}
            {!showCheckout && (
              <>
                <div className="px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[16px] font-bold text-primary">Subtotal</span>
                      <span className="text-[12px] text-muted ml-1.5">({lineCount} lines, {totalItems} items)</span>
                    </div>
                    <span className="text-[18px] font-bold text-primary">${subtotal.toFixed(2)} USD</span>
                  </div>
                  <p className="text-[11px] text-muted mt-1">Taxes and shipping calculated at checkout</p>
                </div>
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3.5 bg-b2b text-white font-bold text-[16px] rounded-lg hover:bg-b2b-hover transition-colors"
                  >
                    Checkout
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-2.5">
                    <span className="text-[11px] text-muted">Powered by</span>
                    <span className="text-[11px] font-bold text-b2b">NetWise</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* Add New Address Panel — overlays cart content */}
        {showAddAddress && (
          <div className="absolute inset-0 bg-[#F6F6F6] z-10 flex flex-col animate-[slideIn_0.2s_ease-out]">
            {/* Header */}
            <div className="px-5 pt-5 pb-4">
              <button
                onClick={() => setShowAddAddress(false)}
                className="flex items-center gap-2 text-[18px] font-bold text-primary hover:opacity-80"
              >
                <ArrowLeft size={20} />
                Add new address
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
              {/* Saved address */}
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b pr-10">
                  <option>#enclave, b23</option>
                  <option>#508, First floor, 6th Block 6th Cross, Bangalore - 560095</option>
                </select>
                <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Saved address</span>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Country/region */}
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b pr-10">
                  <option>Canada</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>India</option>
                  <option>Australia</option>
                </select>
                <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Country/region</span>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* First name + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="Taylor"
                    className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b"
                  />
                  <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">First name (optional)</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="Beversi"
                    className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b"
                  />
                  <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Last name</span>
                </div>
              </div>

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  defaultValue="508 first floor"
                  className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 pr-10 text-[14px] text-primary focus:outline-none focus:border-b2b"
                />
                <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Address</span>
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Apartment */}
              <div className="relative">
                <input
                  type="text"
                  defaultValue="6th Floor"
                  className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b"
                />
                <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Apartment, suite, etc. (optional)</span>
              </div>

              {/* City + State + Postal */}
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="Bangalore"
                    className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b"
                  />
                  <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">City</span>
                </div>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b pr-8">
                    <option>Karnataka</option>
                    <option>Ontario</option>
                    <option>California</option>
                  </select>
                  <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">State</span>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="560095"
                    className="w-full bg-white border border-border rounded-lg px-4 pt-6 pb-2.5 text-[14px] text-primary focus:outline-none focus:border-b2b"
                  />
                  <span className="absolute left-4 top-2 text-[11px] text-muted pointer-events-none">Postal code</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 pt-2 flex-shrink-0">
              <button
                onClick={() => setShowAddAddress(false)}
                className="w-full py-4 bg-b2b text-white font-bold text-[17px] rounded-lg hover:bg-b2b-hover transition-colors"
              >
                Continue and use this address
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-muted">Powered by</span>
                <span className="text-[11px] font-bold text-b2b">NetWise</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
