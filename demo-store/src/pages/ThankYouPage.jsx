import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="bg-white rounded-[6px] shadow-sm max-w-[520px] w-full mx-4 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <h1 className="text-[22px] font-bold text-primary mb-2">Thank you for your order!</h1>
        <p className="text-[14px] text-muted mb-8 leading-relaxed">
          Your order has been placed successfully. You'll receive a confirmation email shortly with your order details.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/quick-order"
            className="w-full py-3 bg-b2b hover:bg-b2b-hover text-white font-semibold text-[14px] rounded-lg transition-colors no-underline text-center"
          >
            View orders
          </Link>
          <Link
            to="/"
            className="w-full py-3 border border-gray-300 text-primary font-semibold text-[14px] rounded-lg hover:bg-gray-50 transition-colors no-underline text-center"
          >
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
