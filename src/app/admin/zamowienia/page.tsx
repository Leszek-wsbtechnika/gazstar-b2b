"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Package, Clock, CheckCircle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      // Pobieramy zamówienia wraz z listą produktów (dzięki relacji w bazie)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            products ( name )
          )
        `)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Panel Zarządzania</h1>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
            ADMIN
          </div>
        </div>

        {loading ? (
          <p>Ładowanie zamówień...</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Zamówienie ID</span>
                    <p className="font-mono text-sm text-slate-600">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</span>
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <Clock className="w-4 h-4" /> Oczekujące
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-100 py-6 mb-6">
                  <h3 className="font-bold text-slate-900 mb-4">Zamówione gazy:</h3>
                  <ul className="space-y-2">
                    {order.order_items.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.products?.name} x {item.quantity}</span>
                        <span className="font-bold text-slate-900">{(item.price_at_time * item.quantity).toFixed(2)} zł</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap justify-between items-end gap-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adres i Kontakt</span>
                    <p className="text-sm text-slate-700 max-w-xs">{order.delivery_address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-sm">Suma do zapłaty:</span>
                    <p className="text-3xl font-black text-blue-600">{order.total_price.toFixed(2)} zł</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}