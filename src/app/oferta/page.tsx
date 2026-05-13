"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Plus, Upload, Loader2, Search, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { Product } from '@/lib/types';

export default function Oferta() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');

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
    if (data) setProducts(data as Product[]);
  }

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const ext = compressedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicUrl;
    } catch {
      alert('Błąd przetwarzania zdjęcia.');
      return '';
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const calculatedPrice = newProduct.purchase_price * (1 + newProduct.margin / 100);
    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      price: calculatedPrice,
      image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1610493215573-0975e526435c?auto=format&fit=crop&q=80&w=600'
    }]);
    setIsSubmitting(false);
    if (!error) {
      setShowAddForm(false);
      fetchProducts();
      setNewProduct({ name: '', description: '', purchase_price: 0, margin: 20, image_url: '' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="pt-32 pb-20 flex-grow max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Gazów</h1>
            <p className="text-sm text-slate-400 mt-1">{filteredProducts.length} {filteredProducts.length === 1 ? 'produkt' : 'produktów'}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj gazu..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all shrink-0">
                <Plus className="w-5 h-5" /> {showAddForm ? 'Anuluj' : 'Dodaj'}
              </button>
            )}
          </div>
        </div>

        {showAddForm && isAdmin && (
          <div className="mb-12 p-6 bg-white rounded-2xl border-2 border-blue-100 shadow-xl">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Nazwa produktu" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  <textarea placeholder="Opis produktu..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl h-24 outline-none" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl border-dashed border-slate-300">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <input type="file" accept="image/*" onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        setIsSubmitting(true);
                        const url = await handleFileUpload(e.target.files[0]);
                        setNewProduct({ ...newProduct, image_url: url });
                        setIsSubmitting(false);
                      }
                    }} className="text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cena zakupu (zł)</label>
                      <input
                        type="number"
                        value={newProduct.purchase_price}
                        onChange={e => setNewProduct({ ...newProduct, purchase_price: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Marża (%)</label>
                      <input
                        type="number"
                        value={newProduct.margin}
                        onChange={e => setNewProduct({ ...newProduct, margin: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  {newProduct.purchase_price > 0 && (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-sm">
                      <span className="text-slate-500">Cena sprzedaży: </span>
                      <span className="font-black text-green-700">{(newProduct.purchase_price * (1 + newProduct.margin / 100)).toFixed(2)} zł netto</span>
                    </div>
                  )}
                </div>
              </div>
              <button disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : 'OPUBLIKUJ'}
              </button>
            </form>
          </div>
        )}

        {filteredProducts.length === 0 && query ? (
          <div className="text-center py-20 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">Brak wyników dla &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} index={index} refresh={fetchProducts} onUpload={handleFileUpload} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
