"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Plus, Image as ImageIcon, FileText, Tag, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // Cena sprzedaży netto
  purchase_price: number;
  margin: number;
  image_url: string;
};

export default function Oferta() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role === 'admin') setIsAdmin(true);
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Katalog Gazów</h1>
            <p className="text-slate-500">Certyfikowane gazy techniczne i spożywcze.</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              <Plus className="w-5 h-5" /> Dodaj Nowy Produkt
            </button>
          )}
        </div>

        {/* Formularz dodawania (widoczny tylko dla admina po kliknięciu) */}
        {showAddForm && isAdmin && (
          <div className="mb-12 p-8 bg-white rounded-3xl border-2 border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Nowy produkt w ofercie</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input placeholder="Nazwa gazu" className="p-3 border rounded-xl" />
              <input placeholder="URL zdjęcia" className="p-3 border rounded-xl" />
              <button className="bg-slate-900 text-white rounded-xl font-bold">Zapisz produkt</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} isAdmin={isAdmin} index={index} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function ProductCard({ product, isAdmin, index }: { product: Product, isAdmin: boolean, index: number }) {
  const addItem = useCartStore((state) => state.addItem);
  
  // Kalkulacja cen (23% VAT)
  const priceNetSales = product.purchase_price * (1 + product.margin / 100);
  const priceGrossSales = priceNetSales * 1.23;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        {isAdmin && (
          <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:text-blue-600">
            <ImageIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
          {isAdmin && <button className="text-slate-300 hover:text-blue-500"><FileText className="w-4 h-4" /></button>}
        </div>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{product.description}</p>

        {/* Panel Finansowy Admina */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600 font-bold flex items-center gap-1"><Tag className="w-3 h-3"/> Zakup Netto:</span>
              <span className="font-mono font-bold text-blue-900">{product.purchase_price.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600 font-bold flex items-center gap-1"><Percent className="w-3 h-3"/> Marża:</span>
              <span className="font-mono font-bold text-blue-900">{product.margin}%</span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
              <span className="text-[10px] uppercase font-black text-blue-400">Sprzedaż Brutto:</span>
              <span className="text-sm font-black text-blue-700">{priceGrossSales.toFixed(2)} zł</span>
            </div>
          </div>
        )}

        {/* Widok dla klienta */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase block">Cena Netto</span>
            <span className="text-2xl font-black text-slate-900">{priceNetSales.toFixed(2)} zł</span>
          </div>
          <button 
            onClick={() => addItem({ ...product, price: priceNetSales, quantity: 1 })}
            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}