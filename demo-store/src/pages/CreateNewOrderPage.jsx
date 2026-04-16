import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Info, Minus, Plus, RotateCw, Search, X, Heart, Pencil, ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';
import { products } from '../data/products';
import { stepUp, stepDown, snapQty } from '../utils/qtyRules';
import { addDynamicOrder } from './QuickOrderPage';

// 3-step bulk order creation flow — mirrors the NetWise bulk-order-form extension:
//   1. Browse Catalog (All products / CSV upload) + catalog preview sidebar
//   2. Product table with variant rows + qty steppers
//   3. Order review + summary (Checkout / Submit for review)

const CURRENCY = 'USD';
const CURRENCY_SYMBOL = '$';

// Catalog: flatten products → product groups with variant rows
const CATALOG = products.map(p => ({
  id: p.id,
  name: p.name,
  image: p.image,
  msrp: p.price,
  unitPrice: p.b2bPrice,
  qtyRules: p.qtyRules || null,
  variants: p.variants.map((v, i) => ({
    sku: v.sku,
    code: v.code,
    name: v.name.split(' / ')[1] || v.name,
    sizeOnly: v.name.split(' / ')[0] || '',
    stock: v.stockQty,
    msrp: v.retailPrice,
    unitPrice: v.price,
  })),
})).sort((a, b) => (b.qtyRules ? 1 : 0) - (a.qtyRules ? 1 : 0));

const fmt = (n) => `${CURRENCY_SYMBOL}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CreateNewOrderPage() {
  const [step, setStep] = useState(1);              // 1 | 2 | 3
  const [browseMode, setBrowseMode] = useState('all_products'); // 'all_products' | 'csv'
  const [quantities, setQuantities] = useState({}); // { sku: number }
  const [search, setSearch] = useState('');
  const [csvFileName, setCsvFileName] = useState(null);
  const navigate = useNavigate();

  const totalItems = useMemo(
    () => Object.values(quantities).reduce((s, q) => s + (q || 0), 0),
    [quantities]
  );
  const totalValue = useMemo(() => {
    let total = 0;
    for (const product of CATALOG) {
      for (const v of product.variants) {
        const q = quantities[v.sku] || 0;
        if (q > 0) total += q * v.unitPrice;
      }
    }
    return total;
  }, [quantities]);

  // Find the product's qtyRules for a given variant SKU
  const rulesForSku = (sku) => {
    for (const p of CATALOG) {
      if (p.variants.some(v => v.sku === sku)) return p.qtyRules;
    }
    return null;
  };
  const setQty = (sku, val) => {
    const rules = rulesForSku(sku);
    const n = snapQty(val, rules);
    setQuantities(prev => ({ ...prev, [sku]: n }));
  };
  const resetQty = (skus) => setQuantities(prev => {
    const next = { ...prev };
    for (const s of skus) delete next[s];
    return next;
  });

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return CATALOG;
    const q = search.toLowerCase();
    return CATALOG.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.variants.some(v => v.sku.toLowerCase().includes(q))
    );
  }, [search]);

  const selectedLines = useMemo(() => {
    const lines = [];
    for (const p of CATALOG) {
      for (const v of p.variants) {
        const q = quantities[v.sku] || 0;
        if (q > 0) {
          lines.push({
            product: p,
            variant: v,
            quantity: q,
            lineTotal: q * v.unitPrice,
          });
        }
      }
    }
    return lines;
  }, [quantities]);

  const removeLine = (sku) => setQuantities(prev => {
    const next = { ...prev };
    delete next[sku];
    return next;
  });

  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-80px)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* Back + title + progress — same vertical position as Quick Order title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step === 1 ? navigate('/quick-order') : setStep(step - 1))}
              className="w-5 h-5 flex items-center justify-center text-primary hover:text-black flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-[21px] font-bold text-primary leading-tight">
                {step === 3 ? 'Order review' : 'Create new order'}
              </h1>
              <p className="text-[13px] text-muted mt-0.5">
                {step === 1 && 'Start a new bulk order by selecting products from the assigned catalog or uploading a CSV file.'}
                {step === 2 && 'Search using SKU or product name to quickly add multiple items to your order.'}
                {step === 3 && "Review your order, adjust quantities as needed, or remove products you don't require."}
              </p>
            </div>
          </div>
          <ProgressPills step={step} onNavigate={setStep} />
        </div>

        {step === 1 && (
          <Step1
            browseMode={browseMode}
            setBrowseMode={setBrowseMode}
            csvFileName={csvFileName}
            setCsvFileName={setCsvFileName}
            onBrowseAll={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2
            catalog={filteredCatalog}
            quantities={quantities}
            setQty={setQty}
            resetQty={resetQty}
            totalItems={totalItems}
            totalValue={totalValue}
            search={search}
            setSearch={setSearch}
            onReview={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <Step3
            lines={selectedLines}
            totalItems={totalItems}
            totalValue={totalValue}
            setQty={setQty}
            removeLine={removeLine}
            onCheckout={() => alert('Checkout — demo only')}
            onBackToProducts={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

function ProgressPills({ step, onNavigate }) {
  return (
    <div className="flex items-center gap-2 pt-3">
      {[1, 2, 3].map(i => (
        <button
          key={i}
          onClick={() => i <= step && onNavigate(i)}
          className={`h-[4px] rounded-full transition-all ${i <= step ? 'bg-b2b w-10 cursor-pointer hover:opacity-70' : 'bg-gray-200 w-8 cursor-default'}`}
        />
      ))}
    </div>
  );
}

// ────────────────────────── STEP 1 ──────────────────────────
function Step1({ browseMode, setBrowseMode, csvFileName, setCsvFileName, onBrowseAll }) {
  const preview = CATALOG.slice(0, 3);
  const extra = Math.max(0, CATALOG.length - 3);
  const [csvValidated, setCsvValidated] = useState(false);
  const [validating, setValidating] = useState(false);

  // Dummy CSV products shown after validation
  const csvProducts = CATALOG.slice(0, 4);

  const handleValidate = () => {
    setValidating(true);
    setTimeout(() => { setValidating(false); setCsvValidated(true); }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
      {/* Left card */}
      <div className="bg-white rounded-[6px] shadow-sm p-5 sm:p-8">
        <h2 className="text-[16px] font-bold text-primary mb-5">Browse catalog</h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setBrowseMode('all_products')}
            className={`py-3 text-[14px] font-medium rounded-lg border-2 transition-colors ${
              browseMode === 'all_products'
                ? 'border-b2b bg-b2b/10 text-b2b'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setBrowseMode('csv')}
            className={`py-3 text-[14px] font-medium rounded-lg border-2 transition-colors ${
              browseMode === 'csv'
                ? 'border-b2b bg-b2b/10 text-b2b'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            Bulk upload via (CSV)
          </button>
        </div>

        {browseMode === 'all_products' ? (
          <p className="text-[13px] text-muted">Browse products from your catalog to add to order</p>
        ) : (
          <>
            <p className="text-[13px] text-muted mb-3">Upload a CSV with product quantities to quickly place a bulk order</p>
            <p className="text-[13px] text-primary font-medium mb-2">Click to upload or drag and drop here</p>
            <label className="border-2 border-dashed border-gray-200 rounded-lg py-10 flex flex-col items-center justify-center cursor-pointer hover:border-b2b transition-colors">
              <Upload size={22} className="text-muted mb-2" />
              <span className="px-4 py-1.5 border border-gray-300 text-primary text-[13px] font-semibold rounded-md hover:bg-gray-50 transition-colors">
                Add file
              </span>
              {csvFileName && <span className="text-[12px] text-muted mt-3">{csvFileName}</span>}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => setCsvFileName(e.target.files?.[0]?.name || null)}
              />
            </label>
          </>
        )}
      </div>

      {/* Right sidebar */}
      <div className="bg-white rounded-[6px] shadow-sm p-6 h-fit">
        <h3 className="text-[15px] font-bold text-primary mb-5">Catalog preview</h3>
        {browseMode === 'csv' ? (
          csvValidated ? (
            <>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-green-50 rounded-lg">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-[13px] text-green-700 font-medium">CSV validated — {csvProducts.length} products found</span>
              </div>
              <div className="space-y-3 mb-4">
                {csvProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-[13px] text-primary leading-snug">{p.name}</div>
                    <div className="text-[13px] font-semibold text-primary">{fmt(p.unitPrice)}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={onBrowseAll}
                className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
              >
                Continue with CSV order
              </button>
            </>
          ) : (
            <button
              onClick={csvFileName ? handleValidate : undefined}
              disabled={!csvFileName || validating}
              className={`w-full py-3 rounded-lg text-[14px] font-medium transition-colors ${
                csvFileName && !validating
                  ? 'bg-b2b hover:bg-b2b-hover text-white cursor-pointer'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {validating ? 'Validating...' : 'Validate CSV'}
            </button>
          )
        ) : (
          <>
            <div className="space-y-4 mb-5">
              {preview.map(p => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] bg-surface rounded-lg overflow-hidden flex-shrink-0">
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-[14px] text-primary leading-snug">{p.name}</div>
                  <div className="text-[14px] font-semibold text-primary whitespace-nowrap">{fmt(p.unitPrice)}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg py-2.5 text-center text-[13px] text-gray-500 mb-4">
              +{extra} items in your catalog
            </div>
            <button
              onClick={onBrowseAll}
              className="w-full py-3.5 bg-b2b hover:bg-b2b-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
            >
              Browse all products
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────── STEP 2 ──────────────────────────
const COL = 'grid grid-cols-[1.4fr_80px_100px_110px_160px_70px]';
const COL_MOBILE = 'grid grid-cols-[1fr_auto]';
const CELL = 'px-3 sm:px-4 py-3 sm:py-4 border-r border-gray-200 last:border-r-0 flex items-center';

function Step2({ catalog, quantities, setQty, resetQty, totalItems, totalValue, search, setSearch, onReview }) {
  const canReview = totalItems > 0;
  return (
    <>
      {/* Totals bar */}
      <div className="bg-white rounded-[6px] shadow-sm px-4 sm:px-8 py-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-[80px] z-30">
        <div className="flex items-center gap-8 sm:gap-16">
          <div>
            <div className="text-[11px] sm:text-[12px] text-muted font-medium">Total Selected Items</div>
            <div className="text-[18px] sm:text-[24px] font-bold text-primary mt-0.5">{totalItems}</div>
          </div>
          <div>
            <div className="text-[11px] sm:text-[12px] text-muted font-medium">Total Value</div>
            <div className="text-[18px] sm:text-[24px] font-bold text-primary mt-0.5">{fmt(totalValue)}</div>
          </div>
        </div>
        <button
          onClick={onReview}
          disabled={!canReview}
          className={`w-full sm:w-auto px-12 py-3 sm:py-3.5 font-semibold text-[14px] rounded-lg transition-colors ${
            canReview
              ? 'bg-b2b hover:bg-b2b-hover text-white'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Review
        </button>
      </div>

      {/* Search + Table combined card */}
      <div className="bg-white rounded-[6px] shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products"
            className="flex-1 text-[14px] outline-none bg-transparent"
          />
        </div>

        {/* Table */}
        <div className="px-3 sm:px-6 py-4 overflow-x-auto">
          <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[700px]">
            {/* Header */}
            <div className={`${COL} bg-gray-50 border-b border-gray-200`}>
              <div className={CELL + ' text-[12px] font-semibold text-primary'}>Product</div>
              <div className={CELL + ' text-[12px] font-semibold text-primary'}>Stock</div>
              <div className={CELL + ' text-[12px] font-semibold text-primary'}>MSRP</div>
              <div className={CELL + ' text-[12px] font-semibold text-primary'}>Unit Price</div>
              <div className={CELL + ' text-[12px] font-semibold text-primary'}>Quantity</div>
              <div className={CELL + ' text-[12px] font-semibold text-primary justify-center'}>Reset</div>
            </div>
            {/* Rows */}
            {catalog.map(p => (
              <ProductGroup
                key={p.id}
                product={p}
                quantities={quantities}
                setQty={setQty}
                onResetGroup={() => resetQty(p.variants.map(v => v.sku))}
              />
            ))}
            {catalog.length === 0 && (
              <div className="py-12 text-center text-[13px] text-muted">No products match your search.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProductGroup({ product, quantities, setQty, onResetGroup }) {
  return (
    <>
      {/* Group header row */}
      <div className={`${COL} border-b border-gray-200 bg-white`}>
        <div className={CELL}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden flex-shrink-0">
              <img src={product.image} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[13px] font-medium text-primary">{product.name}</span>
          </div>
        </div>
        <div className={CELL} />
        <div className={CELL} />
        <div className={CELL} />
        <div className={CELL} />
        <div className={CELL + ' justify-center'}>
          <button onClick={onResetGroup} className="text-gray-300 hover:text-primary" aria-label="Reset product">
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Variant rows */}
      {product.variants.map(v => {
        const qty = quantities[v.sku] || 0;
        return (
          <div key={v.sku} className={`${COL} border-b border-gray-200 last:border-b-0 bg-white`}>
            <div className={CELL + ' pl-16'}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="leading-tight">
                  <div className="text-[13px] font-medium text-primary">{v.name}</div>
                  <div className="text-[11px] text-muted">SKU: {v.sku}</div>
                </div>
              </div>
            </div>
            <div className={CELL + ' text-[13px] text-primary'}>{v.stock}</div>
            <div className={CELL + ' text-[13px] text-primary'}>{fmt(v.msrp)}</div>
            <div className={CELL + ' text-[13px] text-primary'}>{fmt(v.unitPrice)}</div>
            <div className={CELL}>
              {product.qtyRules ? (
                <div className="relative group/info flex-shrink-0 mr-2">
                  <Info size={14} className="text-gray-600 cursor-pointer" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/info:block bg-gray-800 text-white text-[11px] rounded-md px-3 py-2 whitespace-nowrap z-50 shadow-lg">
                    <div>Min: {product.qtyRules.min}</div>
                    <div>Increment: {product.qtyRules.increment}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </div>
              ) : (
                <Info size={14} className="text-gray-200 flex-shrink-0 mr-2" />
              )}
              <div className="inline-flex items-center border border-gray-200 rounded-md">
                <button
                  onClick={() => setQty(v.sku, stepDown(qty, product.qtyRules))}
                  className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(v.sku, e.target.value)}
                  className="w-10 h-8 text-center text-[13px] font-medium border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty(v.sku, stepUp(qty, product.qtyRules))}
                  className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <div className={CELL + ' justify-center'}>
              <button
                onClick={() => setQty(v.sku, 0)}
                className={`${qty > 0 ? 'text-primary' : 'text-gray-300'} hover:text-primary`}
                aria-label="Reset variant"
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ────────────────────────── SHIPPING ADDRESS MODAL ──────────────────────────
function ShippingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    savedAddress: '6th Cross Road 6th Block Koramangala, Bengaluru 560095 (Default)',
    country: 'India',
    firstName: 'Deekshithh',
    lastName: 'K',
    address1: '6th Cross Road 6th Block Koramangala',
    address2: 'Building No 508 First Floor',
    city: 'Bengaluru',
    state: '',
    zip: '560095',
    billingSame: true,
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-primary">Shipping address</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {/* Saved addresses */}
          <label className="block">
            <span className="text-[11px] text-muted">Saved addresses</span>
            <div className="mt-1 relative">
              <select
                value={form.savedAddress}
                onChange={e => set('savedAddress', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary appearance-none bg-white pr-10 focus:outline-none focus:border-b2b"
              >
                <option>6th Cross Road 6th Block Koramangala, Bengaluru 560095 (Default)</option>
              </select>
              <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </label>

          {/* Country */}
          <label className="block">
            <span className="text-[11px] text-muted">Country/region</span>
            <div className="mt-1 relative">
              <select
                value={form.country}
                onChange={e => set('country', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary appearance-none bg-white pr-10 focus:outline-none focus:border-b2b"
              >
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Singapore</option>
                <option>Australia</option>
              </select>
              <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </label>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              placeholder="First name"
              className="border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
            />
            <input
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              placeholder="Last name"
              className="border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
            />
          </div>

          {/* Address lines */}
          <input
            value={form.address1}
            onChange={e => set('address1', e.target.value)}
            placeholder="Address"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
          />
          <input
            value={form.address2}
            onChange={e => set('address2', e.target.value)}
            placeholder="Apartment, suite, etc."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
          />

          {/* City / State / ZIP */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <input
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="City"
              className="border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
            />
            <div className="relative">
              <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-muted z-10">State *</span>
              <select
                value={form.state}
                onChange={e => set('state', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary appearance-none bg-white pr-8 focus:outline-none focus:border-b2b"
              >
                <option value="">Select</option>
                <option>Karnataka</option>
                <option>Maharashtra</option>
                <option>Tamil Nadu</option>
                <option>Delhi</option>
                <option>Kerala</option>
              </select>
              <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <input
              value={form.zip}
              onChange={e => set('zip', e.target.value)}
              placeholder="ZIP code"
              className="border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-b2b"
            />
          </div>

          {/* Billing same as shipping */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.billingSame}
              onChange={e => set('billingSame', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 accent-[#580A46] focus:ring-[#580A46]"
            />
            <span className="text-[14px] font-medium text-primary">Billing address same as shipping address</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-[14px] font-medium text-primary hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="px-6 py-2.5 bg-b2b hover:bg-b2b-hover text-white rounded-lg text-[14px] font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={`w-4 h-4 text-muted pointer-events-none ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ────────────────────────── ORDER POPUPS ──────────────────────────
function OrderPopup({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[440px] px-4 py-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-primary">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

function CheckoutSuccessPopup({ onClose, onViewOrder, onBackToBulk, lines, totalValue, totalItems }) {
  const [orderId] = useState(() => `#D${Math.floor(100000 + Math.random() * 900000)}`);
  const handleViewOrder = () => {
    addDynamicOrder({
      id: orderId, name: orderId, product_count: lines.length, total_qty: totalItems,
      order_status: 'Approved', fulfillment_status: 'Unfulfilled', payment_status: 'Paid',
      total_price: totalValue, currency_code: 'USD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      due_date: '', first_four_thumbnails: lines.slice(0, 4).map(l => l.product.image),
    });
    onViewOrder();
  };
  return (
    <OrderPopup onClose={onClose}>
      <div className="flex items-start gap-3 mb-5 pr-6">
        <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[16px] font-bold text-primary">Order saved successfully!</h3>
          <p className="text-[13px] text-muted mt-1">Order {orderId} has been saved. You can review it now or continue placing bulk orders.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleViewOrder} className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors">
          View order
        </button>
        <button onClick={onBackToBulk} className="w-full py-3 border border-gray-300 text-primary font-semibold text-[14px] rounded-lg hover:bg-gray-50 transition-colors">
          Back to bulk order
        </button>
      </div>
    </OrderPopup>
  );
}

function SubmitReviewPopup({ onClose, onViewStatus, onBackToBulk, lines, totalValue, totalItems }) {
  const [orderId] = useState(() => `#D${Math.floor(100000 + Math.random() * 900000)}`);
  const handleViewStatus = () => {
    addDynamicOrder({
      id: orderId, name: orderId, product_count: lines.length, total_qty: totalItems,
      order_status: 'Awaiting approval', fulfillment_status: '', payment_status: '',
      total_price: totalValue, currency_code: 'USD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      due_date: '', first_four_thumbnails: lines.slice(0, 4).map(l => l.product.image),
    });
    onViewStatus();
  };
  return (
    <OrderPopup onClose={onClose}>
      <div className="flex items-start gap-3 mb-5 pr-6">
        <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[16px] font-bold text-primary">Order submitted for review!</h3>
          <p className="text-[13px] text-muted mt-1">We've received your order {orderId} and it's now under review. You'll be notified by email once the status changes.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleViewStatus} className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors">
          View order status
        </button>
        <button onClick={onBackToBulk} className="w-full py-3 border border-gray-300 text-primary font-semibold text-[14px] rounded-lg hover:bg-gray-50 transition-colors">
          Back to bulk order
        </button>
      </div>
    </OrderPopup>
  );
}

function SaveOrderPopup({ onClose, onViewOrder, onBackToBulk, lines, totalValue, totalItems }) {
  const [orderId] = useState(() => `#D${Math.floor(100000 + Math.random() * 900000)}`);
  const handleViewOrder = () => {
    addDynamicOrder({
      id: orderId, name: orderId, product_count: lines.length, total_qty: totalItems,
      order_status: 'Saved', fulfillment_status: '', payment_status: '',
      total_price: totalValue, currency_code: 'USD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      due_date: '', first_four_thumbnails: lines.slice(0, 4).map(l => l.product.image),
    });
    onViewOrder();
  };
  const handleBackToBulk = () => {
    addDynamicOrder({
      id: orderId, name: orderId, product_count: lines.length, total_qty: totalItems,
      order_status: 'Saved', fulfillment_status: '', payment_status: '',
      total_price: totalValue, currency_code: 'USD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      due_date: '', first_four_thumbnails: lines.slice(0, 4).map(l => l.product.image),
    });
    onBackToBulk();
  };
  return (
    <OrderPopup onClose={onClose}>
      <div className="flex items-start gap-3 mb-5 pr-6">
        <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[16px] font-bold text-primary">Order saved successfully!</h3>
          <p className="text-[13px] text-muted mt-1">Order {orderId} has been saved. You can review it now or continue placing bulk orders.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleViewOrder} className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors">
          View order
        </button>
        <button onClick={handleBackToBulk} className="w-full py-3 border border-gray-300 text-primary font-semibold text-[14px] rounded-lg hover:bg-gray-50 transition-colors">
          Back to bulk order
        </button>
      </div>
    </OrderPopup>
  );
}

function NetTermCheckoutPopup({ onClose, onStandardCheckout, onNetPay }) {
  return (
    <OrderPopup onClose={onClose}>
      <div className="flex items-start gap-3 mb-5 pr-6">
        <AlertCircle size={24} className="text-b2b flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[16px] font-bold text-primary">You're eligible for net term checkout</h3>
          <p className="text-[13px] text-muted mt-1">Choose how you'd like to pay. You can check out using Net Terms or continue with the standard checkout.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onStandardCheckout} className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors">
          Standard checkout
        </button>
        <button onClick={onNetPay} className="w-full py-3 border border-gray-300 text-primary font-semibold text-[14px] rounded-lg hover:bg-gray-50 transition-colors">
          Net Pay (15 days)
        </button>
      </div>
    </OrderPopup>
  );
}

// ────────────────────────── STEP 3 ──────────────────────────
function Step3({ lines, totalItems, totalValue, setQty, removeLine, onCheckout, onBackToProducts }) {
  const navigate = useNavigate();
  const [showShipping, setShowShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [selectedSkus, setSelectedSkus] = useState(new Set());
  const [popup, setPopup] = useState(null); // 'checkout' | 'submit' | 'netterm' | null

  const allSelected = lines.length > 0 && selectedSkus.size === lines.length;
  const someSelected = selectedSkus.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedSkus(new Set());
    } else {
      setSelectedSkus(new Set(lines.map(l => l.variant.sku)));
    }
  };
  const toggleOne = (sku) => {
    setSelectedSkus(prev => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });
  };
  const removeSelected = () => {
    for (const sku of selectedSkus) removeLine(sku);
    setSelectedSkus(new Set());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 pb-20">
      {/* Line items table */}
      <div className="bg-white rounded-[6px] shadow-sm overflow-hidden h-fit border border-gray-200">
        {/* Header */}
        <div className="grid grid-cols-[28px_1fr_auto] sm:grid-cols-[28px_1fr_140px_110px_32px] px-4 sm:px-5 py-3 border-b border-gray-200 items-center">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-[#580A46]" />
          <span className="text-[12px] font-semibold text-primary">Product</span>
          <span className="text-[12px] font-semibold text-primary text-center hidden sm:block">Quantity</span>
          <span className="text-[12px] font-semibold text-primary text-right hidden sm:block">Total</span>
          <div className="hidden sm:block" />
        </div>
        {lines.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <ShoppingCart size={28} className="text-gray-400" />
            </div>
            <p className="text-[18px] font-bold text-primary mb-2">Your review list is empty</p>
            <p className="text-[14px] text-muted mb-5">Add products from the bulk order list to review them here.</p>
            <button
              onClick={() => onBackToProducts()}
              className="px-6 py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors"
            >
              Back to product list
            </button>
          </div>
        ) : lines.map(line => (
          <div key={line.variant.sku} className="grid grid-cols-[28px_1fr_auto] sm:grid-cols-[28px_1fr_140px_110px_32px] px-4 sm:px-5 py-4 border-b border-gray-100 items-center last:border-b-0 gap-y-3">
            <input type="checkbox" checked={selectedSkus.has(line.variant.sku)} onChange={() => toggleOne(line.variant.sku)} className="w-4 h-4 rounded accent-[#580A46]" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                <img src={line.product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-primary">{line.product.name} - {line.variant.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{line.variant.sku}</div>
                <div className="text-[11px] text-muted">{fmt(line.variant.unitPrice)} {CURRENCY} each</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center border border-gray-200 rounded-md">
                <button
                  onClick={() => setQty(line.variant.sku, stepDown(line.quantity, line.product.qtyRules))}
                  className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  value={line.quantity}
                  onChange={e => setQty(line.variant.sku, e.target.value)}
                  className="w-10 h-8 text-center text-[13px] font-medium border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty(line.variant.sku, stepUp(line.quantity, line.product.qtyRules))}
                  className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <div className="text-right text-[13px] font-semibold text-primary whitespace-nowrap">{fmt(line.lineTotal)}</div>
            <button
              onClick={() => removeLine(line.variant.sku)}
              className="text-gray-400 hover:text-red-500 justify-self-end"
              aria-label="Remove line"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-[6px] shadow-sm p-6 h-fit">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-primary">Order summary</h3>
          <button
            onClick={() => setPopup('save')}
            className="inline-flex items-center gap-1.5 text-[13px] text-b2b font-semibold hover:underline"
          >
            Save this order
            <Heart size={14} />
          </button>
        </div>
        <div className="space-y-3 text-[14px] pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-primary">Subtotal · {totalItems} items</span>
            <span className="text-primary font-medium">{fmt(totalValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary flex items-center gap-1.5">Shipping <Pencil size={12} className="text-muted" /></span>
            <button onClick={() => setShowShipping(true)} className="text-[13px] text-b2b hover:underline">
              {shippingAddress ? `${shippingAddress.city}, ${shippingAddress.zip}` : 'Enter shipping address'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary flex items-center gap-1.5">Estimated taxes <Info size={12} className="text-muted" /></span>
            <span className="text-muted">-</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-5">
          <span className="text-[16px] font-bold text-primary">Total</span>
          <div className="text-right">
            <span className="text-[11px] text-muted mr-1">{CURRENCY}</span>
            <span className="text-[20px] font-bold text-primary">{fmt(totalValue)}</span>
          </div>
        </div>
        <button
          onClick={() => setPopup('netterm')}
          disabled={totalItems === 0}
          className={`w-full py-3.5 rounded-lg font-semibold text-[15px] transition-colors ${
            totalItems > 0 ? 'bg-b2b hover:bg-b2b-hover text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Checkout
        </button>
        <button
          disabled={!shippingAddress}
          onClick={() => setPopup('submit')}
          className={`w-full mt-3 py-3 rounded-lg border font-semibold text-[14px] transition-colors ${
            shippingAddress
              ? 'border-primary text-primary hover:bg-gray-50 cursor-pointer'
              : 'border-gray-200 bg-white text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit for review
        </button>
        <p className="text-[12px] text-muted text-center mt-3">
          {shippingAddress
            ? 'Ready to submit for merchant review.'
            : 'A shipping address is required to submit for review.'
          }
        </p>
      </div>

      {showShipping && (
        <ShippingModal
          onClose={() => setShowShipping(false)}
          onSave={(addr) => setShippingAddress(addr)}
        />
      )}

      {popup === 'save' && (
        <SaveOrderPopup
          lines={lines} totalValue={totalValue} totalItems={totalItems}
          onClose={() => setPopup(null)}
          onViewOrder={() => { setPopup(null); navigate('/quick-order'); }}
          onBackToBulk={() => { setPopup(null); navigate('/quick-order'); }}
        />
      )}
      {popup === 'checkout' && (
        <CheckoutSuccessPopup
          lines={lines} totalValue={totalValue} totalItems={totalItems}
          onClose={() => setPopup(null)}
          onViewOrder={() => { setPopup(null); navigate('/quick-order'); }}
          onBackToBulk={() => { setPopup(null); navigate('/quick-order'); }}
        />
      )}
      {popup === 'submit' && (
        <SubmitReviewPopup
          lines={lines} totalValue={totalValue} totalItems={totalItems}
          onClose={() => setPopup(null)}
          onViewStatus={() => { setPopup(null); navigate('/quick-order'); }}
          onBackToBulk={() => { setPopup(null); navigate('/quick-order'); }}
        />
      )}
      {popup === 'netterm' && (
        <NetTermCheckoutPopup
          onClose={() => setPopup(null)}
          onStandardCheckout={() => { setPopup(null); navigate('/quick-order/thank-you'); }}
          onNetPay={() => { setPopup(null); navigate('/quick-order/thank-you'); }}
        />
      )}

      {/* Floating bottom bar — remove selected */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[1100px] px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-[12px] text-muted">Selected</div>
              <div className="text-[18px] font-bold text-primary">{selectedSkus.size} {selectedSkus.size === 1 ? 'Item' : 'Items'}</div>
            </div>
            <button
              onClick={removeSelected}
              className="px-8 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
