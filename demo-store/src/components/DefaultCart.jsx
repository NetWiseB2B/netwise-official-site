import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { stepUp, stepDown } from '../utils/qtyRules';

export default function DefaultCart() {
  const { items, updateQuantity, removeItem, isCartOpen, setIsCartOpen } = useCart();
  const { setShowLoginModal } = useAuth();

  if (!isCartOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <ShoppingBag size={20} />
            Theme Default cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-muted hover:text-primary rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={48} className="text-gray-200 mb-4" />
            <p className="text-muted font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add some products to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map(item => (
                <div key={item.key} className="flex gap-3 pb-4 border-b border-gray-100">
                  <Link
                    to={`/products/${item.product.handle}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0"
                  >
                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-primary truncate">{item.product.name}</h4>
                    <p className="text-xs text-muted">{item.variant}</p>
                    <p className="text-sm font-semibold text-primary mt-1">${item.product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.key, stepDown(item.quantity, item.product.qtyRules))}
                        className="w-7 h-7 flex items-center justify-center border border-border rounded-md text-muted hover:text-primary hover:border-gray-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.key, stepUp(item.quantity, item.product.qtyRules))}
                        className="w-7 h-7 flex items-center justify-center border border-border rounded-md text-muted hover:text-primary hover:border-gray-300"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="ml-auto p-1 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="text-lg font-semibold text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <button className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Checkout
              </button>
              <button
                onClick={() => { setIsCartOpen(false); setShowLoginModal(true); }}
                className="w-full py-2.5 border border-b2b text-b2b font-medium rounded-lg hover:bg-b2b-light transition-colors text-sm"
              >
                Login for B2B Pricing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
