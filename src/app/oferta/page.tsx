"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Plus, Image as ImageIcon, FileText, Tag, Percent, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number; 
  purchase_price: number;
  margin: number;
  image_url: string;
};

export default function Oferta() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Stany formularza dodawania
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    purchase_price: 0,
    margin: 20,
    image_url: ''
  });

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

  // --- FUNKCJA DODAWANIA PRODUKTU ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Obliczamy cenę netto sprzedaży do zapisania w bazie
    const calculatedPrice = newProduct.purchase_price * (1 + newProduct.margin / 100);

    const { error } = await supabase.from('products').insert([{
      name: newProduct.name,
      description: newProduct.description,
      purchase_price: newProduct.purchase_price,
      margin: newProduct.margin,
      price: calculatedPrice,
      image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1610493215573-0975e526435c?auto=format&fit=crop&q=80&w=600'
    }]);

    setIsSubmitting(false);

    if (error) {
      alert('Błąd dodawania: ' + error.message);
    } else {
      setShowAddForm(false);
      fetchProducts(); // Odświeżamy listę
      setNewProduct({ name: '', description: '', purchase_price: 0, margin: 20, image_url: '' }); // Czyścimy formularz
    }
  };

  // --- FUNKCJA USUWANIA PRODUKTU ---
  const handleDeleteProduct = async (id: string) => {
    if(!window.confirm("Czy na pewno chcesz usunąć ten produkt?")) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) alert("Błąd usuwania: " + error.message);
    else fetchProducts();
  };

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
              <Plus className="w-5 h-5" /> {showAddForm ? 'Anuluj Dodawanie' : 'Dodaj Nowy Produkt'}
            </button>
          )}
        </div>

        {/* --- FORMULARZ DODAWANIA (Tylko Admin) --- */}
        {showAddForm && isAdmin && (
          <form onSubmit={handleAddProduct} className="mb-12 p-8 bg-white rounded-3xl border-2 border-blue-200 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Nowy produkt w ofercie</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nazwa Gazu</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" placeholder="np. Mieszanka MIX 18" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link do zdjęcia (URL)</label>
                <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" placeholder="https://..." />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opis krótki</label>
              <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 h-24" placeholder="Opisz zastosowanie gazu..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2"><Tag className="w-4 h-4"/> Cena zakupu (Netto)</label>
                <div className="relative">
                  <input required type="number" step="0.01" value={newProduct.purchase_price} onChange={e => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value) || 0})} className="w-full p-4 border border-blue-200 rounded-xl font-mono text-xl" />
                  <span className="absolute right-4 top-4 text-slate-400 font-bold">PLN</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2"><Percent className="w-4 h-4"/> Planowana Marża</label>
                <div className="relative">
                  <input required type="number" value={newProduct.margin} onChange={e => setNewProduct({...newProduct, margin: parseFloat(e.target.value) || 0})} className="w-full p-4 border border-blue-200 rounded-xl font-mono text-xl" />
                  <span className="absolute right-4 top-4 text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-lg hover:bg-blue-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Zapisz i Opublikuj Produkt'}
            </button>
          </form>
        )}

        {/* --- LISTA KART PRODUKTÓW --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isAdmin={isAdmin} 
              index={index} 
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

// --- KOMPONENT POJEDYNCZEJ KARTY ---
function ProductCard({ product, isAdmin, index, onDelete }: { product: Product, isAdmin: boolean, index: number, onDelete: () => void }) {
  const addItem = useCartStore((state) => state.addItem);
  
  // Kalkulacja cen na podstawie bazy
  const priceNetSales = product.purchase_price * (1 + (product.margin || 0) / 100);
  const priceGrossSales = priceNetSales * 1.23;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
    >
      <div className="h-48 bg-slate-100 relative overflow-hidden shrink-0">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        {/* Przyciski Admina na zdjęciu */}
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:text-blue-600 tooltip" title="Zmień zdjęcie">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 bg-red-500/90 backdrop-blur text-white rounded-full shadow-sm hover:bg-red-600 tooltip" title="Usuń produkt">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
          {isAdmin && <button className="text-slate-300 hover:text-blue-500"><FileText className="w-4 h-4" /></button>}
        </div>
        
        <p className="text-sm text-slate-500 mb-6 flex-grow">{product.description}</p>

        {/* Panel Finansowy Admina */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1"><Tag className="w-3 h-3"/> Zakup:</span>
              <span className="font-mono font-bold text-slate-700">{product.purchase_price?.toFixed(2) || '0.00'} zł</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1"><Percent className="w-3 h-3"/> Marża:</span>
              <span className="font-mono font-bold text-slate-700">{product.margin || 0}%</span>
            </div>
            <div className="pt-3 mt-1 border-t border-blue-200/50 flex justify-between items-center">
              <span className="text-[10px] uppercase font-black text-blue-500">Sprzedaż Brutto:</span>
              <span className="text-sm font-black text