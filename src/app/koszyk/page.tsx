"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Trash2, Truck } from 'lucide-react';
import Link from 'next/link';

export default function Koszyk() {
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formularz dla klienta (bez logowania, do szybkiego zamówienia)
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
  });

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Koszyk jest pusty!');
    setLoading(true);

    try {
      // 1. Tworzymy wpis w tabeli zamówień
      const orderData = {
        status: 'pending',
        total_price: getTotalPrice(),
        delivery_address: `${formData.companyName}, ${formData.address}, Tel: ${formData.phone}`,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Zapisujemy konkretne gazy (butle) dla tego zamówienia
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // 3. Sukces! Czyścimy koszyk.
      clearCart();
      setSuccess(true);
      
    } catch (error) {
      console.error('Błąd zamówienia:', error);
      alert('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Twoje Zamówienie</h1>

        {success ? (
          <div className="bg-white p-12 rounded-3xl border border-green-100 text-center shadow-sm">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Zamówienie przyjęte!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Twoje gazy zostały przekazane do realizacji. Zapłacisz wygodnie u naszego kierowcy przy odbiorze butli.
            </p>
            <Link href="/" className="px-8 py-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-cyan-500 hover:text-slate-900 transition-colors">
              Wróć na stronę główną
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
            <p className="text-gray-500 mb-6">Twój wirtualny magazyn jest pusty.</p>
            <Link href="/oferta" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl">Przejdź do oferty</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista produktów */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} zł netto / szt.</p>
                  </div>
                  <div className="font-bold text-lg text-slate-900 px-4">
                    {item.quantity} szt.
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formularz Dostawy */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Dane do dostawy</h3>
              
              <form onSubmit={handleOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa Firmy / Warsztatu</label>
                  <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dokładny adres dostawy</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon dla kierowcy</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-500 font-medium">Suma netto:</span>
                    <span className="text-3xl font-black text-slate-900">{getTotalPrice().toFixed(2)} zł</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-cyan-500 hover:text-slate-900 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Przetwarzanie...' : 'Zamawiam i płacę przy odbiorze'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}