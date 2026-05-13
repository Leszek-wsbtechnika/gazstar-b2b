"use client";
import { useState, useCallback, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast, { type ToastState } from '@/components/Toast';
import { Trash2, ShoppingCart, CheckCircle, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Koszyk() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: '',
    nip: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  const netTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grossTotal = netTotal * 1.23;

  const closeToast = useCallback(() => setToast(null), []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      router.push('/logowanie');
      return;
    }

    const nipPart = formData.nip ? `NIP: ${formData.nip} | ` : '';
    const deliveryAddress = `${nipPart}${formData.companyName}, ${formData.address} (Tel: ${formData.phone})`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        total_price: netTotal,
        delivery_address: deliveryAddress
      }])
      .select()
      .single();

    if (orderError || !order) {
      setToast({ message: 'Błąd tworzenia zamówienia: ' + orderError?.message, type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    setIsSubmitting(false);

    if (itemsError) {
      setToast({ message: 'Błąd dodawania pozycji do zamówienia.', type: 'error' });
    } else {
      clearCart();
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg w-full">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-900 mb-4">Zamówienie przyjęte!</h1>
            <p className="text-slate-500 mb-8">Nasz zespół wkrótce skontaktuje się w sprawie dostawy. Historię zamówień znajdziesz w swoim panelu klienta.</p>
            <Link href="/profil" className="block w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
              Przejdź do Panelu Klienta
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Toast toast={toast} onClose={closeToast} />
      <div className="pt-32 pb-20 flex-grow max-w-7xl mx-auto px-4 w-full">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-blue-600" /> Twój Koszyk
        </h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Koszyk jest pusty</h2>
            <p className="text-slate-500 mb-8">Dodaj gazy techniczne z naszego katalogu, aby złożyć zamówienie.</p>
            <Link href="/oferta" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Przejdź do Katalogu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 overflow-hidden shrink-0 relative">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm font-mono text-slate-500">{item.price.toFixed(2)} zł netto / szt.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-slate-600 hover:text-blue-600">-</button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-slate-600 hover:text-blue-600">+</button>
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-black text-slate-900">{(item.price * item.quantity).toFixed(2)} zł</span>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-32">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Podsumowanie i Dostawa</h2>

                {isLoggedIn === false && (
                  <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <LogIn className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                    <span>
                      Aby złożyć zamówienie, musisz być zalogowany.{' '}
                      <Link href="/logowanie" className="font-bold underline hover:text-amber-900">
                        Zaloguj się
                      </Link>
                    </span>
                  </div>
                )}

                <form onSubmit={handleOrder} className="space-y-3 mb-8">
                  <input required placeholder="Nazwa Firmy / Imię i Nazwisko" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <div className="relative">
                    <input placeholder="NIP (opcjonalnie)" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-20" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formData.nip.length}/10
                    </span>
                  </div>
                  <input required placeholder="Dokładny adres dostawy" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <input required placeholder="Numer telefonu" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>Wartość Netto:</span>
                      <span className="font-mono">{netTotal.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>Podatek VAT (23%):</span>
                      <span className="font-mono">{(grossTotal - netTotal).toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="font-black text-slate-900 uppercase">Do zapłaty (Brutto)</span>
                      <span className="text-2xl font-black text-blue-600">{grossTotal.toFixed(2)} zł</span>
                    </div>
                  </div>

                  <button disabled={isSubmitting} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ZŁÓŻ ZAMÓWIENIE Z OBOWIĄZKIEM ZAPŁATY'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
