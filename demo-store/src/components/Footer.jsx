export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Horizon Supply Co.</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your trusted B2B supplier for industrial, office, and safety products.
              This is a demo store showcasing how NetWise transforms the buying experience
              for B2B customers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Industrial Supplies</li>
              <li>Office Equipment</li>
              <li>Safety & PPE</li>
              <li>Packaging</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">B2B Features</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Volume Pricing</li>
              <li>Quick Order</li>
              <li>Custom Catalogs</li>
              <li>Net Payment Terms</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">Demo store powered by NetWise B2B</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Built with</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-b2b/40 text-pink-200 text-xs rounded-full font-medium">
              NetWise
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
