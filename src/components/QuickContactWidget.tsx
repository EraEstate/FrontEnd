import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, X } from 'lucide-react';
import { showSuccess } from '../utils/toast';

const QuickContactWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const submitCallback = () => {
    if (!phone.trim()) {
      return;
    }
    showSuccess('Da gui yeu cau goi lai. Chung toi se lien he som.');
    setName('');
    setPhone('');
    setShowCallForm(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mb-3 w-[calc(100vw-2rem)] sm:w-80 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Lien he nhanh</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <a href="tel:19001234" className="flex items-center gap-2 rounded-xl border p-2 hover:bg-red-50">
                <Phone className="h-4 w-4 text-red-600" />
                Hotline: 1900-1234
              </a>
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border p-2 hover:bg-red-50">
                <MessageCircle className="h-4 w-4 text-red-600" />
                Zalo ho tro
              </a>
              <a href="mailto:support@eraestate.me" className="flex items-center gap-2 rounded-xl border p-2 hover:bg-red-50">
                <Mail className="h-4 w-4 text-red-600" />
                support@eraestate.me
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowCallForm((prev) => !prev)}
              className="mt-3 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Goi lai cho toi
            </button>

            {showCallForm && (
              <div className="mt-3 space-y-2 rounded-xl border border-red-100 p-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-400"
                  placeholder="Ho ten"
                />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-400"
                  placeholder="So dien thoai"
                />
                <button
                  type="button"
                  onClick={submitCallback}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                >
                  Gui yeu cau
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-14 w-14 rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-red-400/60" />
        <Phone className="relative mx-auto h-6 w-6" />
      </button>
    </div>
  );
};

export default QuickContactWidget;

