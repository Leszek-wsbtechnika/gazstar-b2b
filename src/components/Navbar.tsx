"use client";
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  // Zliczamy wszystkie butle
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Trick dla Next.js, by uniknąć błędu hydratacji
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900">
              GAZ<span className="text-blue-500">STAR</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/oferta" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Oferta</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/koszyk" className="text-gray-900 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/logowanie" className="flex items-center text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors">
              <User className="w-4 h-4 mr-2" />
              Portal B2B
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}