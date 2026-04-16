import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FolderClosed, Clock, RefreshCw, AlertTriangle, MoreHorizontal, Info, Plus } from 'lucide-react';
import { products } from '../data/products';

// Mock B2B orders — shape mirrors the NetWise bulk-order-list extension
// (extensions/bulk-order-list/src/index.jsx designModeData).
const MOCK_ORDERS = [
  {
    id: 3052, name: '#3052', product_count: 8, total_qty: 20,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Net 30',
    total_price: 3200.00, currency_code: 'USD',
    date: 'Jan 02, 2026', due_date: 'Feb 03',
    first_four_thumbnails: seedImages('3052', 4),
  },
  {
    id: 3051, name: '#3051', product_count: 7, total_qty: 18,
    order_status: 'Approved', fulfillment_status: 'Unfulfilled', payment_status: 'Paid',
    total_price: 2500.00, currency_code: 'USD',
    date: 'Jan 02, 2026', due_date: '',
    first_four_thumbnails: seedImages('3051', 4),
  },
  {
    id: 3050, name: '#3050', product_count: 5, total_qty: 14,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 1850.00, currency_code: 'USD',
    date: 'Jan 02, 2026', due_date: '',
    first_four_thumbnails: seedImages('3050', 4),
  },
  {
    id: 'B3050', name: '#B3050', product_count: 6, total_qty: 25,
    order_status: 'Awaiting approval', fulfillment_status: '', payment_status: '',
    total_price: 1700.00, currency_code: 'USD',
    date: 'Jan 02, 2026', due_date: '',
    first_four_thumbnails: seedImages('B3050', 4),
  },
  {
    id: 'B3048', name: '#B3048', product_count: 3, total_qty: 9,
    order_status: 'Awaiting approval', fulfillment_status: '', payment_status: '',
    total_price: 980.00, currency_code: 'USD',
    date: 'Jan 01, 2026', due_date: '',
    first_four_thumbnails: seedImages('B3048', 3),
  },
  {
    id: 'B3049', name: '#B3049', product_count: 5, total_qty: 12,
    order_status: 'Saved', fulfillment_status: '', payment_status: '',
    total_price: 4200.00, currency_code: 'USD',
    date: 'Jan 02, 2026', due_date: '',
    first_four_thumbnails: seedImages('B3049', 4),
  },
  {
    id: 3047, name: '#3047', product_count: 9, total_qty: 32,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 5800.00, currency_code: 'USD',
    date: 'Dec 28, 2025', due_date: '',
    first_four_thumbnails: seedImages('3047', 4),
  },
  {
    id: 3046, name: '#3046', product_count: 4, total_qty: 7,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 1100.00, currency_code: 'USD',
    date: 'Dec 22, 2025', due_date: '',
    first_four_thumbnails: seedImages('3046', 4),
  },
  {
    id: 3045, name: '#3045', product_count: 11, total_qty: 44,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 7650.00, currency_code: 'USD',
    date: 'Dec 19, 2025', due_date: '',
    first_four_thumbnails: seedImages('3045', 4),
  },
  {
    id: 3044, name: '#3044', product_count: 3, total_qty: 6,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 890.00, currency_code: 'USD',
    date: 'Dec 14, 2025', due_date: '',
    first_four_thumbnails: seedImages('3044', 3),
  },
  {
    id: 3043, name: '#3043', product_count: 6, total_qty: 21,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 3300.00, currency_code: 'USD',
    date: 'Dec 08, 2025', due_date: '',
    first_four_thumbnails: seedImages('3043', 4),
  },
  {
    id: 3042, name: '#3042', product_count: 5, total_qty: 15,
    order_status: 'Approved', fulfillment_status: 'Fulfilled', payment_status: 'Paid',
    total_price: 2250.00, currency_code: 'USD',
    date: 'Dec 02, 2025', due_date: '',
    first_four_thumbnails: seedImages('3042', 4),
  },
];

// Stable pseudo-random product images per order (max 4 thumbnails shown, +N count derived
// from product_count - first_four_thumbnails.length — same pattern as the extension).
function seedImages(key, count) {
  const pool = products.filter(p => p.image);
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(pool[(seed + i * 7) % pool.length].image);
  }
  return picks;
}

const fmtMoney = (n, currency = 'USD') =>
  `${n.toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

// Tabs — match the extension's status keys (all / approved / submitted / saved).
// "Submitted" tab in the extension matches orders with order_status 'Awaiting approval'
// or 'Submitted'.
const TABS = [
  { id: 'all', label: 'All orders', icon: Briefcase, match: () => true },
  { id: 'approved', label: 'Approved', icon: FolderClosed, match: (o) => o.order_status === 'Approved' },
  { id: 'submitted', label: 'Submitted for review', icon: Clock, match: (o) => o.order_status === 'Awaiting approval' || o.order_status === 'Submitted' },
  { id: 'saved', label: 'Saved list', icon: RefreshCw, match: (o) => o.order_status === 'Saved' },
];

export default function QuickOrderPage() {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const orderCounts = useMemo(() => ({
    all: MOCK_ORDERS.length,
    approved: MOCK_ORDERS.filter(TABS[1].match).length,
    submitted: MOCK_ORDERS.filter(TABS[2].match).length,
    saved: MOCK_ORDERS.filter(TABS[3].match).length,
  }), []);

  const visibleOrders = useMemo(() => {
    const tab = TABS.find(t => t.id === activeTab);
    return MOCK_ORDERS.filter(tab.match);
  }, [activeTab]);

  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-80px)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[21px] font-bold text-primary">Quick order</h1>
          <button
            onClick={() => navigate('/quick-order/new')}
            className="inline-flex items-center gap-2 px-6 h-[48px] bg-b2b hover:bg-b2b-hover text-white font-semibold rounded-lg transition-colors text-[14px]"
          >
            Create new order
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm px-5 flex items-center justify-start gap-1 mb-8 h-[88px]">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-5 h-[48px] rounded-lg text-[13px] transition-colors ${
                  isActive ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-black' : 'text-gray-400'} />
                <span>{tab.label}</span>
                <span className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded-md text-[11px] font-semibold ${
                  isActive ? 'bg-primary text-white' : 'border border-gray-300 text-gray-500'
                }`}>
                  {orderCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Order List */}
        {visibleOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm py-16 text-center">
            <p className="text-primary font-semibold text-sm">No orders yet</p>
            <p className="text-muted text-xs mt-1">Create a new order by clicking the "Create new order" button at the top.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleOrders.map(order => (
              <OrderBox key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// OrderBox — desktop layout follows the extension's 7-column grid:
// 8% thumbs | 13% info | 15% status+date | 16% fulfillment | 25% payment | 11% price | 7% actions.
function OrderBox({ order }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showDueBadge = order.due_date && order.payment_status !== 'Paid';
  const thumbs = (order.first_four_thumbnails || []).slice(0, 4);
  const extra = Math.max(0, (order.product_count || 0) - thumbs.length);

  return (
    <div className="bg-white rounded-xl shadow-sm px-5 h-[93px] grid grid-cols-[8%_13%_16%_14%_16%_auto_40px] items-center gap-4">
      {/* Thumbnails — image group, up to 4, +N if product_count > 4 */}
      <div className="flex items-center">
        <div
          className={`grid gap-0.5 bg-surface rounded-md overflow-hidden ${
            thumbs.length === 1 ? 'w-12 h-12 grid-cols-1'
              : thumbs.length === 2 ? 'w-12 h-12 grid-cols-2'
              : 'w-12 h-12 grid-cols-2 grid-rows-2'
          }`}
        >
          {thumbs.map((src, i) => (
            <div key={i} className="bg-white overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {extra > 0 && (
          <span className="ml-2 text-[12px] font-semibold text-primary">+{extra}</span>
        )}
      </div>

      {/* Order info — name + total_qty */}
      <div className="leading-tight pl-1">
        <div className="font-semibold text-primary text-[14px]">{order.name}</div>
        <div className="text-[12px] text-muted mt-0.5">{order.total_qty} items</div>
      </div>

      {/* Status + date */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[13px] text-primary">{order.order_status}</span>
          <Info size={12} className="text-muted" />
        </div>
        <div className="text-[12px] text-muted mt-0.5">{order.date}</div>
      </div>

      {/* Fulfillment */}
      <div className="text-[13px] font-medium text-primary">
        {order.fulfillment_status || ''}
      </div>

      {/* Payment */}
      <div className="text-[13px] font-medium text-primary">
        {order.payment_status || ''}
      </div>

      {/* Total + Due badge (same column in the extension) */}
      <div className="text-right whitespace-nowrap">
        <div className="font-semibold text-primary text-[14px]">
          {fmtMoney(order.total_price, order.currency_code)}
        </div>
        {showDueBadge && (
          <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-muted bg-gray-100 rounded-full px-2 py-0.5">
            <AlertTriangle size={11} className="text-amber-500" />
            Due {order.due_date}
          </div>
        )}
      </div>

      {/* Actions — kebab popover */}
      <div className="relative justify-self-end">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          aria-label="Order actions"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
              <MenuItem
                label={order.order_status === 'Approved' || order.order_status === 'Rejected' ? 'View Details' : 'Manage'}
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 ${danger ? 'text-red-600' : 'text-primary'}`}
    >
      {label}
    </button>
  );
}
