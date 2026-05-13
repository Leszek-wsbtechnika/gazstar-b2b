"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Plus, Image as ImageIcon, FileText, Tag, Percent, Trash2, Loader2, Save, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import imageCompression from 'browser-image-compression';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // Cena sprzedaży netto (wyliczana)
  purchase_price: number;
  margin: number;
  image_url: string;
};

export default function Oferta() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
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

  // GŁÓWNA FUNKCJA KOMPRESJI I WGRYWANIA
  const handleFileUpload = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.8,           // Celujemy w < 1MB
        maxWidthOrHeight: 1200, // Max rozdzielczość
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Błąd pliku:', error);
      alert('Błąd podczas przetwarzania zdjęcia.');
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
    if (error) alert(error.message);
    else {
      setShowAddForm(false);
      fetchProducts();
      setNewProduct({ name: '', description: '', purchase_price: 0, margin: 20, image_url: '' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="pt-32 pb-20 flex-grow max-w-7xl mx-auto px-4 w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Katalog Gazów</h1>
            <p className="text-slate-500 mt-2">Zarządzaj asortymentem i marżami GAZSTAR.</p>
          </div>
          
          {isAdmin && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all">
              <Plus className="w-5 h-5" /> {showAddForm ? 'Anuluj' : 'Dodaj Produkt'}
            </button>
          )}
        </div>

        {showAddForm && isAdmin && (
          <div className="mb-12 p-8 bg-white rounded-3xl border-2 border-blue-200 shadow-xl">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Podstawowe informacje</label>
                  <input required placeholder="Nazwa produktu (np. Argon 4.8)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder="Opis techniczny i zastosowanie..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Media i Finanse</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border rounded-xl border-dashed border-slate-300">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <input type="file" accept="image/*" onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        setIsSubmitting(true);
                        const url = await handleFileUpload(e.target.files[0]);
                        setNewProduct({...newProduct, image_url: url});
                        setIsSubmitting(false);
                      }
                    }} className="text-xs" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase mb-1 block">Zakup Netto</span>
                      <input type="number" step="0.01" value={newProduct.purchase_price} onChange={e => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value)})} className="w-full p-3 border rounded-lg font-mono" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase mb-1 block">Marża %</span>
                      <input type="number" value={newProduct.margin} onChange={e => setNewProduct({...newProduct, margin: parseFloat(e.target.value)})} className="w-full p-3 border rounded-lg font-mono" />
                    </div>
                  </div>
                </div>
              </div>
              <button disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-blue-600 transition-all flex justify-center items-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'OPUBLIKUJ PRODUKT'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} isAdmin={isAdmin} index={index} refresh={fetchProducts} onUpload={handleFileUpload} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function ProductCard({ product, isAdmin, index, refresh, onUpload }: { product: Product, isAdmin: boolean, index: number, refresh: () => void, onUpload: (file: File) => Promise<string> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({...product});
  const [isUploading, setIsUploading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleUpdate = async () => {
    const calculatedPrice = editData.purchase_price * (1 + editData.margin / 100);
    const { error } = await supabase.from('products').update({
      name: editData.name,
      description: editData.description,
      purchase_price: editData.purchase_price,
      margin: editData.margin,
      image_url: editData.image_url,
      price: calculatedPrice
    }).eq('id', product.id);

    if (error) alert(error.message);
    else {
      setIsEditing(false);
      refresh();
    }
  };

  const priceNetSales = product.purchase_price * (1 + (product.margin || 0) / 100);
  const priceGrossSales = priceNetSales * 1.23;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
      {isEditing ? (
        <div className="p-6 space-y-4 flex-grow bg-slate-50/50">
          <div className="relative h-32 bg-slate-200 rounded-xl overflow-hidden group">
            <img src={editData.image_url} className="w-full h-full object-cover opacity-40" />
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/10 transition-all">
              {isUploading ? <Loader2 className="animate-spin text-blue-600" /> : <Upload className="w-6 h-6 text-slate-600" />}
              <input type="file" className="hidden" onChange={async (e) => {
                if(e.target.files?.[0]) {
                  setIsUploading(true);
                  const url = await onUpload(e.target.files[0]);
                  setEditData({...editData, image_url: url});
                  setIsUploading(false);
                }
              }} />
            </label>
          </div>
          <input className="w-full p-3 border rounded-xl font-bold bg-white" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
          <textarea className="w-full p-3 border rounded-xl text-sm bg-white h-20" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-2 rounded-xl border">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Zakup</span>
              <input type="number" className="w-full font-mono font-bold" value={editData.purchase_price} onChange={e => setEditData({...editData, purchase_price: parseFloat(e.target.value)})} />
            </div>
            <div className="bg-white p-2 rounded-xl border">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Marża %</span>
              <input type="number" className="w-full font-mono font-bold" value={editData.margin} onChange={e => setEditData({...editData, margin: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold"><Save className="w-4 h-4"/> Zapisz</button>
            <button onClick={() => setIsEditing(false)} className="bg-slate-200 p-3 rounded-xl hover:bg-slate-300 transition-colors"><X className="w-4 h-4"/></button>
          </div>
        </div>
      ) : (
        <>
          <div className="h-56 bg-slate-100 relative overflow-hidden shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setIsEditing(true)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:text-blue-600 transition-all"><FileText className="w-4 h-4" /></button>
                <button onClick={async () => { if(confirm('Usunąć?')) { await supabase.from('products').delete().eq('id', product.id); refresh(); } }} className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{product.name}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-3 leading-relaxed">{product.description}</p>
            
            {isAdmin && (
              <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Koszt zakupu:</span>
                  <span className="font-mono font-bold text-slate-600">{product.purchase_price?.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Zysk (marża):</span>
                  <span className="font-mono font-bold text-green-600">+{product.margin}%</span>
                </div>
                <div className="pt-2 mt-1 border-t border-blue-200/50 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-blue-500">Brutto (z VAT 23%):</span>
                  <span className="text-sm font-black text-blue-700">{priceGrossSales.toFixed(2)} zł</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cena Netto</span>
                <span className="text-2xl font-black text-slate-900">{priceNetSales.toFixed(2)} <small className="text-sm font-medium">zł</small></span>
              </div>
              <button onClick={() => { addItem({...product, price: priceNetSales, quantity: 1}); alert(`Dodano: ${product.name}`); }} className="bg-slate-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}