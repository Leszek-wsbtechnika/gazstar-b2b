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
  price: number; 
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

  const handleFileUpload = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Gazów</h1>
            {/* Poprawka 1: Usunięto napis opisowy */}
          </div>
          
          {isAdmin && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all">
              <Plus className="w-5 h-5" /> {showAddForm ? 'Anuluj' : 'Dodaj Produkt'}
            </button>
          )}
        </div>

        {showAddForm && isAdmin && (
          <div className="mb-12 p-6 bg-white rounded-2xl border-2 border-blue-100 shadow-xl">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Nazwa produktu" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder="Opis..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl border-dashed border-slate-300">
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
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase mb-1 block">Zakup Netto</span>
                      <input type="number" step="0.01" value={newProduct.purchase_price} onChange={e => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value)})} className="w-full p-2 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase mb-1 block">Marża %</span>
                      <input type="number" value={newProduct.margin} onChange={e => setNewProduct({...newProduct, margin: parseFloat(e.target.value)})} className="w-full p-2 border rounded-lg font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <button disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-blue-600 transition-all flex justify-center items-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'OPUBLIKUJ'}
              </button>
            </form>
          </div>
        )}

        {/* Poprawka 2: Zwiększono liczbę kolumn, aby karty były o ok. 50% mniejsze */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      {isEditing ? (
        <div className="p-3 space-y-3 flex-grow bg-slate-50/50">
          <div className="relative h-20 bg-slate-200 rounded-lg overflow-hidden group">
            <img src={editData.image_url} className="w-full h-full object-cover opacity-40" />
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              {isUploading ? <Loader2 className="animate-spin text-blue-600 w-4 h-4" /> : <Upload className="w-4 h-4 text-slate-600" />}
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
          <input className="w-full p-2 border rounded-lg font-bold text-xs bg-white" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="p-1.5 border rounded-lg text-[10px]" value={editData.purchase_price} onChange={e => setEditData({...editData, purchase_price: parseFloat(e.target.value)})} />
            <input type="number" className="p-1.5 border rounded-lg text-[10px]" value={editData.margin} onChange={e => setEditData({...editData, margin: parseFloat(e.target.value)})} />
          </div>
          <div className="flex gap-1 pt-1">
            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold"><Save className="w-3 h-3"/> Ok</button>
            <button onClick={() => setIsEditing(false)} className="bg-slate-200 p-2 rounded-lg"><X className="w-3 h-3"/></button>
          </div>
        </div>
      ) : (
        <>
          {/* Zmniejszona wysokość zdjęcia dla mniejszych kart */}
          <div className="h-32 bg-slate-100 relative overflow-hidden shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm hover:text-blue-600"><FileText className="w-3 h-3" /></button>
                <button onClick={async () => { if(confirm('Usunąć?')) { await supabase.from('products').delete().eq('id', product.id); refresh(); } }} className="p-1.5 bg-red-500 text-white rounded-full shadow-sm"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-bold text-slate-900 mb-1 leading-tight line-clamp-1">{product.name}</h3>
            <p className="text-[10px] text-slate-500 mb-3 flex-grow line-clamp-2 leading-tight">{product.description}</p>
            
            {isAdmin && (
              <div className="mb-3 p-2 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400">Zakup:</span>
                  <span className="font-mono font-bold text-slate-600">{product.purchase_price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400">Marża:</span>
                  <span className="font-mono font-bold text-green-600">{product.margin}%</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-50 mt-auto">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Netto</span>
                  <span className="text-base font-black text-slate-900">{priceNetSales.toFixed(2)} <small className="text-[10px]">zł</small></span>
                </div>
                {/* Poprawka 3: Dodano Cenę Brutto dla klienta */}
                <div className="text-right">
                  <span className="text-[8px] font-bold text-blue-400 uppercase block">Brutto</span>
                  <span className="text-[11px] font-bold text-blue-600">{priceGrossSales.toFixed(2)} <small className="text-[9px]">zł</small></span>
                </div>
              </div>
              <button onClick={() => { addItem({...product, price: priceNetSales, quantity: 1}); }} className="w-full bg-slate-950 text-white py-2 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-sm text-xs font-bold gap-2">
                <ShoppingCart className="w-3.5 h-3.5" /> Dodaj
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}