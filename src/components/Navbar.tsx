"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

type AuthUser = { id: string; email?: string } | null;

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        supabase.from('profiles').select('*').eq('id', newUser.id).single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900">
              GAZ<span className="text-blue-500">STAR</span>
            </Link>

            <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {user ? `${profile?.role || 'klient'}: ${user.email}` : 'Logowanie'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/oferta" className="text-sm font-bold text-slate-600 hover:text-blue-600">Oferta</Link>

            <Link href="/koszyk" className="text-gray-900 hover:text-blue-600 relative">
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/logowanie'))}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/logowanie" className="flex items-center text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all">
                <User className="w-4 h-4 mr-2" />
                Zaloguj
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
