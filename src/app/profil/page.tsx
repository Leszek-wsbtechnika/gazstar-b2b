"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast, { type ToastState } from '@/components/Toast';
import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Package, RefreshCw, Clock, Building, MapPin } from 'lucide-react';
import type { Order } from '@/lib/types';

type User = { id: string; email?: string };

export default function Profil() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  async function fetchProfileAndOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id, created_at, status, delivery_address, total_price,
          order_items (
            quantity, price_at_time,
            products (id, name, price, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData as unknown as Order[]);
    }
    setLoading(false);
  }

  const handleReorder = (orderItems: Order['order_items']) => {
    orderItems.forEach(item => {
      if (item.products) {
        addItem({
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.image_url,
          quantity: item.quantity
        });
      }
    });
    setToast({ message: 'Produkty dodano do koszyka (ceny zaktualizowane na dzisiejsze).', type: 'success' });
    router.push('/koszyk');
  };

  if (loading) return (
    <main className="min-h-screen bg-slate-50"><Navbar /><div className="pt-32 text-center font-bold text-slate-400 animate-pulse">Ładowanie panelu...</div></main>
  );

  if (!user) return (
    <main className="min-h-screen bg-slate-50"><Navbar /><div className="pt-32 text-center text-slate-500">Musisz być zalogowany.</div></main>
  );

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Toast toast={toast} onClose={closeToast} />
      <div className="pt-32 pb-20 flex-grow max-w-5xl mx-auto px-4 w-full">

        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Twój Panel B2B</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-32">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-slate-900 mb-1">Konto klienta</h2>
              <p className="text-sm text-slate-500 mb-6 font-mono break-words">{user.email}</p>

              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Wyloguj się
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Historia Zamówień
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900">Brak zamówień</h3>
                <p className="text-sm text-slate-500 mt-2">To dobre miejsce, aby zacząć współpracę z GAZSTAR.</p>
              </div>
            ) : (
              orders.map((order) => {
                const netTotal = order.order_items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
                const grossTotal = netTotal * 1.23;

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Data zamówienia
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {new Date(order.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3" /> {order.delivery_address}
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {order.status === 'pending' ? 'W realizacji' : 'Zakończone'}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        {order.order_items.map((item, i) => {
                          const itemTotalNet = item.price_at_time * item.quantity;
                          return (
                            <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                  <img src={item.products?.image_url} className="w-full h-full object-cover" alt="gaz" />
                                </div>
                                <span className="font-bold text-slate-800">{item.products?.name || 'Produkt niedostępny'}</span>
                              </div>
                              <div className="text-right font-mono text-slate-600 text-xs sm:text-sm bg-slate-50 p-2 rounded-lg">
                                <span className="text-slate-500">{item.quantity} szt. x {item.price_at_time.toFixed(2)} zł =</span>
                                <span className="font-black text-slate-900 ml-2">{itemTotalNet.toFixed(2)} zł <span className="text-[9px] uppercase text-slate-400">netto</span></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <button
                          onClick={() => handleReorder(order.order_items)}
                          className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-sm h-full"
                        >
                          <RefreshCw className="w-4 h-4" /> Skopiuj do koszyka
                        </button>

                        <div className="bg-slate-50 p-4 rounded-2xl text-right">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Razem Netto:</span>
                            <span className="font-mono font-bold text-slate-700">{netTotal.toFixed(2)} zł</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] mb-2">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">VAT (23%):</span>
                            <span className="font-mono font-bold text-slate-700">{(grossTotal - netTotal).toFixed(2)} zł</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Do zapłaty Brutto:</span>
                            <span className="font-black text-blue-700 text-xl">{grossTotal.toFixed(2)} zł</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
