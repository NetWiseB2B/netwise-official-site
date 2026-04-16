import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Info, Minus, Plus, RotateCw, Search, X, Heart } from 'lucide-react';
import { products } from '../data/products';

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
  variants: p.variants.map((v, i) => ({
    sku: v.sku,
    code: v.code,
    name: v.name.split(' / ')[1] || v.name,       // "Medium" from "M / Medium"
    sizeOnly: v.name.split(' / ')[0] || '',
    stock: v.stockQty,
    msrp: v.retailPrice,
    unitPrice: v.price,
  })),
}));

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

  const setQty = (sku, val) => {
    const n = Math.max(0, parseInt(val) || 0);
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
    <div className="bg-[#F0EEEA] min-h-[calc(100vh-80px)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* Back + title + progress */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => (step === 1 ? navigate('/quick-order') : setStep(step - 1))}
                className="w-6 h-6 flex items-center justify-center text-primary hover:text-black"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-[22px] font-bold text-primary">
                {step === 3 ? 'Order review' : 'Create new order'}
              </h1>
            </div>
            <p className="text-[13px] text-muted ml-9 mt-1">
              {step === 1 && 'Start a new bulk order by selecting products from the assigned catalog or uploading a CSV file.'}
              {step === 2 && 'Search using SKU or product name to quickly add multiple items to your order.'}
              {step === 3 && "Review your order, adjust quantities as needed, or remove products you don't require."}
            </p>
          </div>
          <ProgressPills step={step} />
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
          />
        )}
      </div>
    </div>
  );
}

function ProgressPills({ step }) {
  return (
    <div className="flex items-center gap-2 pt-3">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`h-[3px] w-8 rounded-full ${i <= step ? 'bg-b2b' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}

// ────────────────────────── STEP 1 ──────────────────────────
function Step1({ browseMode, setBrowseMode, csvFileName, setCsvFileName, onBrowseAll }) {
  const preview = CATALOG.slice(0, 3);
  const extra = Math.max(0, CATALOG.length - 3);

  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Left card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-primary">Browse Catalog</h2>
          <button className="text-[13px] text-blue-600 font-medium hover:underline">Export</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setBrowseMode('all_products')}
            className={`py-3 text-[14px] font-medium transition-colors ${
              browseMode === 'all_products' ? 'bg-gray-100 text-blue-600' : 'bg-white text-muted hover:bg-gray-50'
            }`}
          >
            All products
          </button>
          <button
            onClick={() => setBrowseMode('csv')}
            className={`py-3 text-[14px] font-medium transition-colors ${
              browseMode === 'csv' ? 'bg-gray-100 text-blue-600' : 'bg-white text-muted hover:bg-gray-50'
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
              <span className="px-4 py-1.5 border border-b2b text-b2b text-[13px] font-semibold rounded-md hover:bg-b2b hover:text-white transition-colors">
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
      <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
        <h3 className="text-[15px] font-bold text-primary mb-4">Catalog preview</h3>
        {browseMode === 'csv' ? (
          <div className="bg-gray-50 rounded-lg py-4 text-center text-[13px] text-muted">Validate CSV</div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {preview.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface rounded-md overflow-hidden flex-shrink-0">
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-[14px] text-primary">{p.name}</div>
                  <div className="text-[14px] font-semibold text-primary">{fmt(p.unitPrice)}</div>
                </div>
              ))}
            </div>
            {extra > 0 && (
              <div className="bg-gray-100 rounded-md py-2 text-center text-[13px] text-muted mb-3">
                +{extra} items in your catalog
              </div>
            )}
            <button
              onClick={onBrowseAll}
              className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white text-[14px] font-semibold rounded-md transition-colors"
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
function Step2({ catalog, quantities, setQty, resetQty, totalItems, totalValue, search, setSearch, onReview }) {
  const canReview = totalItems > 0;
  return (
    <>
      {/* Totals bar */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div>
            <div className="text-[12px] text-muted">Total Selected Items</div>
            <div className="text-[20px] font-bold text-primary mt-0.5">{totalItems}</div>
          </div>
          <div>
            <div className="text-[12px] text-muted">Total Value</div>
            <div className="text-[20px] font-bold text-primary mt-0.5">{fmt(totalValue)}</div>
          </div>
        </div>
        <button
          onClick={onReview}
          disabled={!canReview}
          className={`px-8 py-3 font-semibold text-[14px] rounded-lg transition-colors ${
            canReview
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Review
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4 flex items-center gap-2">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products"
          className="flex-1 text-[14px] outline-none bg-transparent"
        />
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.6fr_100px_120px_130px_180px_80px] px-4 py-3 border-b border-gray-100 text-[13px] font-semibold text-primary">
          <div>Product</div>
          <div>Stock</div>
          <div>MSRP</div>
          <div>Unit Price</div>
          <div>Quantity</div>
          <div>Reset</div>
        </div>
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
    </>
  );
}

function ProductGroup({ product, quantities, setQty, onResetGroup }) {
  return (
    <>
      {/* Group header row */}
      <div className="grid grid-cols-[1.6fr_100px_120px_130px_180px_80px] px-4 py-3 border-b border-gray-100 items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-surface rounded-md overflow-hidden flex-shrink-0">
            <img src={product.image} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[14px] text-primary">{product.name}</span>
        </div>
        <div /><div /><div /><div />
        <button onClick={onResetGroup} className="text-muted hover:text-primary" aria-label="Reset product">
          <RotateCw size={15} />
        </button>
      </div>

      {/* Variant rows */}
      {product.variants.map(v => {
        const qty = quantities[v.sku] || 0;
        return (
          <div key={v.sku} className="grid grid-cols-[1.6fr_100px_120px_130px_180px_80px] px-4 py-3 border-b border-gray-100 items-center">
            <div className="flex items-center gap-3 pl-11">
              <div className="w-8 h-8 bg-surface rounded-md overflow-hidden flex-shrink-0">
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-medium text-primary">{v.name}</div>
                <div className="text-[11px] text-muted">SKU: {v.sku}</div>
              </div>
            </div>
            <div className="text-[13px] text-primary">{v.stock}</div>
            <div className="text-[13px] text-primary">{fmt(v.msrp)}</div>
            <div className="text-[13px] text-primary">{fmt(v.unitPrice)}</div>
            <div className="flex items-center gap-2">
              <Info size={12} className="text-muted" />
              <div className="inline-flex items-center border border-gray-200 rounded-md">
                <button
                  onClick={() => setQty(v.sku, qty - 1)}
                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(v.sku, e.target.value)}
                  className="w-10 h-7 text-center text-[13px] font-medium border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty(v.sku, qty + 1)}
                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <button
              onClick={() => setQty(v.sku, 0)}
              className="text-muted hover:text-primary"
              aria-label="Reset variant"
            >
              <RotateCw size={14} />
            </button>
          </div>
        );
      })}
    </>
  );
}

// ────────────────────────── STEP 3 ──────────────────────────
function Step3({ lines, totalItems, totalValue, setQty, removeLine, onCheckout }) {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Line items table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-fit">
        <div className="grid grid-cols-[24px_1.4fr_150px_120px_40px] px-4 py-3 border-b border-gray-100 text-[13px] font-semibold text-primary">
          <div />
          <div>Product</div>
          <div>Quantity</div>
          <div className="text-right">Total</div>
          <div />
        </div>
        {lines.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-muted">No items selected.</div>
        ) : lines.map(line => (
          <div key={line.variant.sku} className="grid grid-cols-[24px_1.4fr_150px_120px_40px] px-4 py-4 border-b border-gray-100 items-center">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface rounded-md overflow-hidden flex-shrink-0">
                <img src={line.product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-medium text-primary">{line.product.name} - {line.variant.name}</div>
                <div className="text-[11px] text-muted mt-0.5">SKU: {line.variant.sku}</div>
                <div className="text-[11px] text-muted">{fmt(line.variant.unitPrice)} {CURRENCY} each</div>
              </div>
            </div>
            <div className="inline-flex items-center border border-gray-200 rounded-md w-fit">
              <button
                onClick={() => setQty(line.variant.sku, line.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary"
              >
                <Minus size={12} />
              </button>
              <input
                type="number"
                value={line.quantity}
                onChange={e => setQty(line.variant.sku, e.target.value)}
                className="w-10 h-7 text-center text-[13px] font-medium border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setQty(line.variant.sku, line.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="text-right text-[13px] font-semibold text-primary whitespace-nowrap">{fmt(line.lineTotal)} {CURRENCY}</div>
            <button
              onClick={() => removeLine(line.variant.sku)}
              className="text-muted hover:text-red-500 justify-self-end"
              aria-label="Remove line"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-primary">Order summary</h3>
          <button className="inline-flex items-center gap-1 text-[13px] text-blue-600 font-medium hover:underline">
            Save this order
            <Heart size={14} />
          </button>
        </div>
        <div className="space-y-3 text-[14px] pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-primary">Subtotal · {totalItems} items</span>
            <span className="text-primary font-medium">{fmt(totalValue)} {CURRENCY}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary">Shipping</span>
            <button className="text-[13px] text-blue-600 hover:underline">Enter shipping address</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary">Estimated taxes</span>
            <span className="text-muted">—</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-[16px] font-bold text-primary">Total</span>
          <span className="text-[16px] font-bold text-primary">{fmt(totalValue)} {CURRENCY}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={totalItems === 0}
          className={`w-full py-3 rounded-lg font-semibold text-[15px] transition-colors ${
            totalItems > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Checkout
        </button>
        <button
          disabled
          className="w-full mt-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-400 font-semibold text-[14px] cursor-not-allowed"
        >
          Submit for review
        </button>
        <p className="text-[11px] text-muted text-center mt-3">
          <Link to="#" className="text-blue-600 hover:underline">Shipping address</Link> is required for submit for review
        </p>
      </div>
    </div>
  );
}
