// src/pages/user/BulkOrder.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronRight, FiChevronLeft, FiUpload } from 'react-icons/fi';
import api from '@utils/api';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Select Category', 'Customize', 'Quantities', 'Contact & Submit'];

const CATEGORIES = ['T-Shirts', 'Shirts', 'Polo T-Shirts', 'Hoodies', 'Jackets', 'Kurtas', 'Trousers', 'Caps'];
const FABRICS = ['100% Cotton', 'Polyester', 'Cotton-Poly Blend', 'Linen', 'Fleece', 'Dri-Fit'];
const PRINT_TYPES = ['Screen Printing', 'Digital Printing', 'Embroidery', 'Heat Transfer'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLORS = [
  { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#001f5b' }, { name: 'Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' }, { name: 'Olive', hex: '#6B7280' },
  { name: 'Maroon', hex: '#7F1D1D' }, { name: 'Yellow', hex: '#EAB308' },
];

export default function BulkOrder() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    fabric: '',
    colors: [],
    printType: '',
    customText: '',
    logoFile: null,
    quantities: SIZES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {}),
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    deliveryDate: '',
    notes: '',
  });

  const update = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const totalQty = Object.values(formData.quantities).reduce((a, b) => a + Number(b), 0);

  const handleSubmit = async () => {
    if (!user) { toast.error('Please login first'); return; }
    if (totalQty < 50) { toast.error('Minimum 50 pieces required'); return; }

    setSubmitting(true);
    try {
      await api.post('/bulk-orders', {
        ...formData,
        totalQuantity: totalQty,
        userId: user.uid,
      });
      setSubmitted(true);
      toast.success('Bulk order inquiry submitted! We\'ll get back to you in 24hrs.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 text-center max-w-md shadow-xl"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-4xl text-green-600" />
          </div>
          <h2 className="text-2xl font-black mb-3">Inquiry Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Our team will review your bulk order and send you a quote within 24 hours at <strong>{formData.email}</strong>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setStep(0); }}
            className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl font-black mb-2">Bulk Order</h1>
        <p className="text-gray-500 mb-8">Custom clothing for your business — minimum 50 pieces</p>

        {/* Step Indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? <FiCheck /> : i + 1}
              </div>
              <div className="ml-2 hidden md:block">
                <p className={`text-xs font-semibold ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* Step 0: Category */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">What would you like to order?</h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => update('category', cat)}
                        className={`p-4 rounded-2xl border-2 font-semibold text-sm transition
                          ${formData.category === cat ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fabric</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FABRICS.map(f => (
                        <button
                          key={f}
                          onClick={() => update('fabric', f)}
                          className={`p-3 rounded-xl border-2 text-sm transition
                            ${formData.fabric === f ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Customize */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Customization Details</h2>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3">Colors (select up to 3)</label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map(c => (
                        <button
                          key={c.name}
                          onClick={() => {
                            const sel = formData.colors.includes(c.name);
                            if (!sel && formData.colors.length >= 3) return;
                            update('colors', sel
                              ? formData.colors.filter(x => x !== c.name)
                              : [...formData.colors, c.name]
                            );
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition
                            ${formData.colors.includes(c.name) ? 'border-gray-900 shadow-md' : 'border-gray-200'}`}
                        >
                          <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3">Print / Branding Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PRINT_TYPES.map(p => (
                        <button
                          key={p}
                          onClick={() => update('printType', p)}
                          className={`p-4 rounded-xl border-2 text-sm font-semibold transition
                            ${formData.printType === p ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Custom Text / Tagline (optional)</label>
                    <input
                      type="text"
                      value={formData.customText}
                      onChange={e => update('customText', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="e.g. Company name or tagline"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Upload Logo / Design (optional)</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-500 transition">
                      <FiUpload className="text-2xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {formData.logoFile ? formData.logoFile.name : 'Click to upload PNG/JPG/PDF'}
                      </span>
                      <input type="file" className="hidden" onChange={e => update('logoFile', e.target.files[0])} />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Quantities */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Quantity by Size</h2>
                  <p className="text-sm text-gray-500 mb-6">Minimum 50 pieces total. Current total: <strong>{totalQty} pcs</strong></p>

                  <div className="space-y-3">
                    {SIZES.map(size => (
                      <div key={size} className="flex items-center gap-4">
                        <span className="w-12 font-bold text-gray-700">{size}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => update('quantities', { ...formData.quantities, [size]: Math.max(0, formData.quantities[size] - 10) })}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                          >-</button>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.quantities[size]}
                            onChange={e => update('quantities', { ...formData.quantities, [size]: Number(e.target.value) })}
                            className="w-20 text-center border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <button
                            onClick={() => update('quantities', { ...formData.quantities, [size]: formData.quantities[size] + 10 })}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                          >+</button>
                        </div>
                        <span className="text-sm text-gray-400">pcs</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Quantity</span>
                      <span className={totalQty >= 50 ? 'text-green-600' : 'text-red-500'}>{totalQty} pcs</span>
                    </div>
                    {totalQty < 50 && <p className="text-red-400 text-sm mt-1">Minimum 50 pieces required</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-semibold mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => update('companyName', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-semibold mb-2">Contact Person *</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={e => update('contactPerson', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => update('phone', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => update('email', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-2">Required Delivery Date</label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={e => update('deliveryDate', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={e => update('notes', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                        placeholder="Any special requirements..."
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm space-y-1">
                    <p><strong>Category:</strong> {formData.category} · {formData.fabric}</p>
                    <p><strong>Colors:</strong> {formData.colors.join(', ') || '—'}</p>
                    <p><strong>Print:</strong> {formData.printType || '—'}</p>
                    <p><strong>Total Qty:</strong> {totalQty} pcs</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              <FiChevronLeft /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !formData.category}
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 disabled:opacity-40"
              >
                Continue <FiChevronRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || totalQty < 50}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 disabled:opacity-40"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
