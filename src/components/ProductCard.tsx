"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/store';
import Toast, { type ToastState } from '@/components/Toast';
import { FileText, Trash2, ShoppingCart, Plus, Minus, ChevronDown } from 'lucide-react';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  isAdmin: boolean;
  index: number;
  refresh: () => void;
  onUpload: (file: File) => Promise<string>;
};

export default function ProductCard({ product, isAdmin, index, refresh, onUpload }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...product });
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const addItem = useCartStore((state) => state.addItem);
  const closeToast = useCallback(() => setToast(null), []);

  const handleUpdate = async () => {
    const calculatedPrice = editData.purchase_price * (1 + editData.margin / 100);
    const { error } = await supabase.from('products').update({
      ...editData, price: calculatedPrice
    }).eq('id', product.id);
    if (!error) { setIsEditing(false); refresh(); }
  };

  const priceNetSales = product.purchase_price * (1 + (product.margin || 0) / 100);
  const priceGrossSales = priceNetSales * 1.23;

  return (
    <>
      <Toast toast={toast} onClose={closeToast} />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full"
      >
        {isEditing ? (
          <div className="p-3 space-y-3 flex-grow bg-slate-50/50">
            <input className="w-full p-2 border rounded-lg font-bold text-xs" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
            <textarea className="w-full p-2 border rounded-lg text-xs h-16 resize-none" placeholder="Opis..." value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className="p-1.5 border rounded-lg text-[10px]" placeholder="Cena zakupu" value={editData.purchase_price} onChange={e => setEditData({ ...editData, purchase_price: parseFloat(e.target.value) || 0 })} />
              <input type="number" className="p-1.5 border rounded-lg text-[10px]" placeholder="Marża %" value={editData.margin} onChange={e => setEditData({ ...editData, margin: parseFloat(e.target.value) || 0 })} />
            </div>
            <button onClick={handleUpdate} className="w-full bg-green-600 text-white p-2 rounded-lg text-[10px] font-bold uppercase">Zapisz</button>
            <button onClick={() => setIsEditing(false)} className="w-full bg-slate-200 p-2 rounded-lg text-[10px]">Anuluj</button>
          </div>
        ) : (
          <>
            <div className="h-32 bg-slate-100 relative overflow-hidden shrink-0">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm">
                    <FileText className="w-3 h-3" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Usunąć?')) {
                        await supabase.from('products').delete().eq('id', product.id);
                        refresh();
                      }
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>

              {isAdmin && (
                <div className="mb-2 p-1.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-slate-400">Zakup: {product.purchase_price} zł</span>
                    <span className="font-bold text-green-600">M: {product.margin}%</span>
                  </div>
                </div>
              )}

              {product.description && (
                <div className="mb-2">
                  <button
                    onClick={() => setDescOpen(v => !v)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-colors font-bold"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${descOpen ? 'rotate-180' : ''}`} />
                    {descOpen ? 'Ukryj opis' : 'Opis produktu'}
                  </button>
                  <AnimatePresence>
                    {descOpen && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-slate-500 leading-relaxed mt-1 overflow-hidden"
                      >
                        {product.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-50 mt-auto">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Netto</span>
                    <span className="text-base font-black text-slate-900 leading-none">{priceNetSales.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">zł</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-blue-400 uppercase block">Brutto</span>
                    <span className="text-[10px] font-bold text-blue-600 leading-none">{priceGrossSales.toFixed(2)} zł</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-white rounded-md transition-all">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-8 text-center bg-transparent text-[11px] font-bold outline-none"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:bg-white rounded-md transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addItem({ ...product, price: priceNetSales, quantity });
                      setToast({ message: `Dodano ${quantity}× ${product.name} do koszyka.`, type: 'success' });
                    }}
                    className="flex-grow bg-slate-950 text-white py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all text-[11px] font-bold gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" /> Dodaj
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
