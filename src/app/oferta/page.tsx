"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Plus, Image as ImageIcon, FileText, Tag, Percent, Trash2, Loader2, Save, X, Upload, Minus } from 'lucide-react';
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
      const fileName = `${Math.random()}.${compressedFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Gazów</h1>
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
                  <input required placeholder="Nazwa produktu" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  <textarea placeholder="Opis..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl h-24 outline-none" />
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
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                    <input type="number" placeholder="Zakup" value={newProduct.purchase_price} onChange={e => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value)})} className="p-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Marża %" value={newProduct.margin} onChange={e => setNewProduct({...newProduct, margin: parseFloat(e.target.value)})} className="p-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
              <button disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : 'OPUBLIKUJ'}
              </button>
            </form>
          </div>
        )}

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
  const [quantity, setQuantity] = useState(1); // Stan dla ilości zamawianej
  
  const addItem = useCartStore((state) => state.addItem);

  const handleUpdate = async () => {
    const calculatedPrice = editData.purchase_price * (1 + editData.margin / 100);
    const { error } = await supabase.from('products').update({
      ...editData, price: calculatedPrice
    }).eq('id', product.id);
    if (!error) { setIsEditing(false); refresh(); }
  };

  const priceNetSales = product.purchase_price * (1 + (product.margin || 0) / 100);
  const priceGrossSales = priceNetSales * 1.23;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full">
      {isEditing ? (
        <div className="p-3 space-y-3 flex-grow bg-slate-50/50">
          <input className="w-full p-2 border rounded-lg font-bold text-xs" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="p-1.5 border rounded-lg text-[10px]" value={editData.purchase_price} onChange={e => setEditData({...editData, purchase_price: parseFloat(e.target.value)})} />
            <input type="number" className="p-1.5 border rounded-lg text-[10px]" value={editData.margin} onChange={e => setEditData({...editData, margin: parseFloat(e.target.value)})} />
          </div>
          <button onClick={handleUpdate} className="w-full bg-green-600 text-white p-2 rounded-lg text-[10px] font-bold uppercase">Zapisz</button>
          <button onClick={() => setIsEditing(false)} className="w-full bg-slate-200 p-2 rounded-lg text-[10px]">Anuluj</button>
        </div>
      ) : (
        <>
          <div className="h-32 bg-slate-100 relative overflow-hidden shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm"><FileText className="w-3 h-3" /></button>
                <button onClick={async () => { if(confirm('Usunąć?')) { await supabase.from('products').delete().eq('id', product.id); refresh(); } }} className="p-1.5 bg-red-500 text-white rounded-full"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
            
            {isAdmin && (
              <div className="mb-2 p-1.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-0.5">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="text-slate-400">Zakup: {product.purchase_price} zł</span>
                  <span className="font-bold text-green-600">M: {product.margin}%</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-50 mt-auto">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Netto</span>
                  <span className="text-base font-black text-slate-900 leading-none">{priceNetSales.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-blue-400 uppercase block">Brutto</span>
                  <span className="text-[10px] font-bold text-blue-600 leading-none">{priceGrossSales.toFixed(2)}</span>
                </div>
              </div>

              {/* LICZNIK ILOŚCI + PRZYCISK */}
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-white rounded-md transition-all"><Minus className="w-3 h-3"/></button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-8 text-center bg-transparent text-[11px] font-bold outline-none"
                  />
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:bg-white rounded-md transition-all"><Plus className="w-3 h-3"/></button>
                </div>
                <button 
                  onClick={() => { addItem({...product, price: priceNetSales, quantity: quantity}); alert(`Dodano ${quantity}x ${product.name}`); }}
                  className="flex-grow bg-slate-950 text-white py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all text-[11px] font-bold gap-1"
                >
                  <ShoppingCart className="w-3 h-3" /> Dodaj
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}