import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const COUNTRIES = ['Canada', 'United States'];

const PROVINCES = {
  Canada: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
};

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', label: 'US +1' },
  { code: '+1', flag: '🇨🇦', label: 'CA +1' },
  { code: '+44', flag: '🇬🇧', label: 'UK +44' },
  { code: '+91', flag: '🇮🇳', label: 'IN +91' },
  { code: '+61', flag: '🇦🇺', label: 'AU +61' },
  { code: '+49', flag: '🇩🇪', label: 'DE +49' },
  { code: '+33', flag: '🇫🇷', label: 'FR +33' },
  { code: '+81', flag: '🇯🇵', label: 'JP +81' },
  { code: '+86', flag: '🇨🇳', label: 'CN +86' },
  { code: '+55', flag: '🇧🇷', label: 'BR +55' },
];

function FloatingInput({ label, required, type = 'text', value, onChange, ...props }) {
  const hasValue = value && value.length > 0;
  return (
    <div className="relative">
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full h-[52px] px-[14px] pt-[20px] pb-[8px] border border-black/20 rounded text-[14px] text-[#303030] bg-white focus:outline-none focus:border-[#560A44] focus:border-2 transition-colors"
        {...props}
      />
      <label className={`absolute left-[14px] text-[#616161] pointer-events-none transition-all duration-200 ${hasValue ? 'top-[6px] text-[11px]' : 'top-[16px] text-[14px]'} peer-focus:top-[6px] peer-focus:text-[11px]`}>
        {label} {required && <span className="text-[#616161]">*</span>}
      </label>
    </div>
  );
}

function FloatingSelect({ label, required, value, onChange, children }) {
  return (
    <div className="relative">
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="peer w-full h-[52px] px-[14px] pt-[20px] pb-[8px] border border-black/20 rounded text-[14px] text-[#303030] bg-white focus:outline-none focus:border-[#560A44] focus:border-2 appearance-none cursor-pointer"
      >
        {children}
      </select>
      <label className="absolute left-[14px] top-[6px] text-[11px] text-[#616161] pointer-events-none">
        {label} {required && <span>*</span>}
      </label>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#616161]">
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

export default function B2BApplicationPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', countryCode: '3', phone: '',
    companyName: '', dba: '', website: '', taxId: '',
    address: '', apartment: '', city: '', province: '', postalCode: '', country: 'Canada',
    billingSame: true,
  });
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const provinces = PROVINCES[form.country] || [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f1f1f1]">
        <div className="bg-white rounded-lg p-10 max-w-md text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#303030] mb-3">Application Submitted!</h2>
          <p className="text-[#616161] mb-6">Thank you for applying. We'll review your application and get back to you within 1-2 business days.</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-b2b text-white font-medium rounded hover:bg-b2b-hover transition-colors no-underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f1f1] py-10">
      <div className="max-w-[768px] mx-auto bg-white px-8 py-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-bold text-[#303030]">Apply for a business account</h2>
          <p className="text-[14px] text-[#616161] mt-1">Get approved and start buying in bulk today, Get best rates, discounts etc.</p>
          <p className="text-[16px] text-[#616161] mt-3">
            Already have an account?{' '}
            <span className="text-[#042436] underline cursor-pointer">Log in</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Primary contact */}
          <section className="mb-6">
            <h4 className="text-[16px] font-bold text-[#303030] mb-4">Primary contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="First name" required value={form.firstName} onChange={e => update('firstName', e.target.value)} />
              <FloatingInput label="Last name" required value={form.lastName} onChange={e => update('lastName', e.target.value)} />
            </div>
            <div className="mt-4">
              <FloatingInput label="Email" required type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="mt-4">
              <div className="flex gap-3">
                <div className="relative w-[80px]">
                  <select
                    value={form.countryCode}
                    onChange={e => update('countryCode', e.target.value)}
                    className="w-full h-[52px] px-2 border border-black/20 rounded text-[14px] bg-white focus:outline-none focus:border-[#560A44] focus:border-2 appearance-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((cc, i) => (
                      <option key={i} value={i}>{cc.flag} {cc.code}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <FloatingInput label="Phone" required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Company details */}
          <section className="mb-6">
            <h4 className="text-[16px] font-bold text-[#303030] mb-4">Company details</h4>
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Company legal name" required value={form.companyName} onChange={e => update('companyName', e.target.value)} />
              <FloatingInput label="DBA" value={form.dba} onChange={e => update('dba', e.target.value)} />
              <FloatingInput label="Website" value={form.website} onChange={e => update('website', e.target.value)} />
              <FloatingInput label="Tax Id" value={form.taxId} onChange={e => update('taxId', e.target.value)} />
            </div>
          </section>

          {/* Shipping Address */}
          <section className="mb-6">
            <h4 className="text-[16px] font-bold text-[#303030] mb-4">Shipping Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Address" required value={form.address} onChange={e => update('address', e.target.value)} />
              <FloatingInput label="Apartment, suite, etc" value={form.apartment} onChange={e => update('apartment', e.target.value)} />
              <FloatingInput label="City" required value={form.city} onChange={e => update('city', e.target.value)} />
              <FloatingSelect label="Province" required value={form.province} onChange={e => update('province', e.target.value)}>
                <option value="" disabled>Province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </FloatingSelect>
              <FloatingInput label="Postal code" required value={form.postalCode} onChange={e => update('postalCode', e.target.value)} />
              <FloatingSelect label="Country/region" required value={form.country} onChange={e => { update('country', e.target.value); update('province', ''); }}>
                <option value="" disabled>Country/region</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </FloatingSelect>
            </div>
          </section>

          {/* Billing Address */}
          <section className="mb-6">
            <h4 className="text-[16px] font-bold text-[#303030] mb-4">Billing Address</h4>
            <label className="flex items-center gap-2.5 cursor-pointer" onClick={() => update('billingSame', !form.billingSame)}>
              <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors flex-shrink-0 ${form.billingSame ? 'bg-b2b border-b2b' : 'border-black/30'}`}>
                {form.billingSame && <Check size={14} className="text-white" />}
              </div>
              <span className="text-[14px] text-[#303030]">Billing address same as shipping address</span>
            </label>
            {!form.billingSame && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FloatingInput label="Address" required value={form.billingAddress || ''} onChange={e => update('billingAddress', e.target.value)} />
                <FloatingInput label="Apartment, suite, etc" value={form.billingApartment || ''} onChange={e => update('billingApartment', e.target.value)} />
                <FloatingInput label="City" required value={form.billingCity || ''} onChange={e => update('billingCity', e.target.value)} />
                <FloatingSelect label="Province" required value={form.billingProvince || ''} onChange={e => update('billingProvince', e.target.value)}>
                  <option value="" disabled>Province</option>
                  {(PROVINCES[form.billingCountry || 'Canada'] || []).map(p => <option key={p} value={p}>{p}</option>)}
                </FloatingSelect>
                <FloatingInput label="Postal code" required value={form.billingPostalCode || ''} onChange={e => update('billingPostalCode', e.target.value)} />
                <FloatingSelect label="Country/region" required value={form.billingCountry || 'Canada'} onChange={e => { update('billingCountry', e.target.value); update('billingProvince', ''); }}>
                  <option value="" disabled>Country/region</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </FloatingSelect>
              </div>
            )}
          </section>

          {/* Documents */}
          <section className="mb-8">
            <h4 className="text-[16px] font-bold text-[#303030] mb-4">Documents</h4>
            <label className="block border border-dashed border-b2b rounded cursor-pointer hover:bg-b2b/5 transition-colors">
              <div className="flex flex-col items-center justify-center py-10">
                <span className="text-[14px] text-b2b font-medium">Upload file</span>
                <span className="text-[14px] text-[#616161] mt-1">Accepts .jpg, .jpeg, .pdf, .csv, .png</span>
              </div>
              <input type="file" accept=".jpg,.jpeg,.pdf,.csv,.png" className="hidden" onChange={handleFileChange} />
            </label>
            {fileName && <p className="text-[13px] text-green-600 mt-2">{fileName}</p>}
          </section>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-b2b text-white font-medium text-[14px] hover:bg-b2b-hover transition-colors"
          >
            Submit
          </button>

          <p className="text-[11px] text-[#616161] mt-4">
            By signing up, you agree to receive marketing emails. For more details, see our privacy policy and terms of service.
          </p>
        </form>
      </div>
    </div>
  );
}
