"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Toast, { type ToastState } from '@/components/Toast';
import { Clock, CheckCircle, Loader2, Phone, MapPin, Building, Hash } from 'lucide-react';
import type { Order } from '@/lib/types';

type StatusKey = 'pending' | 'in_progress' | 'completed';

const STATUS_CONFIG: Record<StatusKey, { label: string; colors: string }> = {
  pending:     { label: 'Nowe',        colors: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'W realizacji', colors: 'bg-blue-100 text-blue-700' },
  completed:   { label: 'Zakończone',  colors: 'bg-green-100 text-green-700' },
};

const NEXT_STATUS: Record<StatusKey, StatusKey> = {
  pending:     'in_progress',
  in_progress: 'completed',
  completed:   'pending',
};

function parseAddress(raw: string) {
  let nip = '';
  let rest = raw;

  const nipMatch = raw.match(/^NIP:\s*(\d{10})\s*\|\s*/);
  if (nipMatch) {
    nip = nipMatch[1];
    rest = raw.slice(nipMatch[0].length);
  }

  const phoneMatch = rest.match(/\(Tel:\s*(.+?)\)\s*$/);
  const phone = phoneMatch ? phoneMatch[1] : '';
  const withoutPhone = phoneMatch ? rest.slice(0, rest.lastIndexOf(phoneMatch[0])).trim() : rest;

  const commaIdx = withoutPhone.indexOf(',');
  const company = commaIdx >= 0 ? withoutPhone.slice(0, commaIdx).trim() : withoutPhone;
  const address = commaIdx >= 0 ? withoutPhone.slice(commaIdx + 1).trim() : '';

  return { nip, company, address, phone };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const router = useRouter();
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/logowanie'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') { router.push('/'); return; }

      await loadOrders();
    }
    init();
  }, [router]);

  async function loadOrders() {
    const { data } = await supabase
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

    if (data) setOrders(data as unknown as Order[]);
    setLoading(false);
  }

  async function updateStatus(orderId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus as StatusKey] ?? 'pending';
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: next })
      .eq('id', orderId);

    if (error) {
      setToast({ message: 'Błąd zmiany statusu.', type: 'error' });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
      setToast({ message: `Status zmieniony na: ${STATUS_CONFIG[next].label}`, type: 'success' });
    }
    setUpdatingId(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Toast toast={toast} onClose={closeToast} />
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Panel Zarządzania</h1>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
            ADMIN
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 font-bold pt-8">
            <Loader2 className="w-5 h-5 animate-spin" /> Ładowanie zamówień...
          </div>
        ) : orders.length === 0 ? (
          <p className="text-slate-500 text-center pt-12">Brak zamówień w systemie.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const netTotal = order.order_items.reduce(
                (sum, item) => sum + item.price_at_time * item.quantity, 0
              );
              const grossTotal = netTotal * 1.23;
              const status = (order.status as StatusKey) in STATUS_CONFIG ? order.status as StatusKey : 'pending';
              const cfg = STATUS_CONFIG[status];
              const parsed = parseAddress(order.delivery_address);

              return (
                <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                  <div className="p-5 bg-slate-50/60 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Zamówienie</span>
                      <p className="font-mono text-sm font-bold text-slate-700">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${cfg.colors}`}>
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => updateStatus(order.id, status)}
                        disabled={updatingId === order.id}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : status === 'completed'
                            ? <><Clock className="w-3 h-3" /> Wróć do Nowe</>
                            : status === 'pending'
                              ? <><Clock className="w-3 h-3" /> Realizuj</>
                              : <><CheckCircle className="w-3 h-3" /> Zakończ</>
                        }
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Zamówione produkty</h3>
                      <ul className="space-y-2">
                        {order.order_items.map((item, i) => (
                          <li key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-600">{item.products?.name} <span className="text-slate-400">×{item.quantity}</span></span>
                            <span className="font-bold text-slate-900 font-mono">{(item.price_at_time * item.quantity).toFixed(2)} zł</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Dane klienta</h3>

                      <div className="flex items-start gap-2 text-sm">
                        <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-700">{parsed.company || '—'}</span>
                      </div>
                      {parsed.nip && (
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-600">NIP: {parsed.nip}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{parsed.address || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${parsed.phone}`} className="text-blue-600 font-bold hover:underline">{parsed.phone || '—'}</a>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Netto:</span>
                          <span className="font-mono">{netTotal.toFixed(2)} zł</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>VAT (23%):</span>
                          <span className="font-mono">{(grossTotal - netTotal).toFixed(2)} zł</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Brutto:</span>
                          <span className="text-2xl font-black text-blue-600">{grossTotal.toFixed(2)} zł</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
