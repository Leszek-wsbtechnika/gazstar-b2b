"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store'; // Import na samej górze - tak jest poprawnie!

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function Oferta() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="pt-32 pb-20 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Gazów</h2>
          <p className="text-gray-500 mt-2">Wybierz gazy techniczne i spożywcze dla Twojego biznesu.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url
    });
    // Możesz to zostawić lub usunąć, jeśli alert Cię denerwuje
    alert(`Dodano do zamówienia: ${quantity}x ${product.name}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="h-48 rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
        />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed">{product.description}</p>
      
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Cena Netto</span>
          <span className="text-3xl font-black text-blue-600">{product.price.toFixed(2)} <small className="text-sm">zł</small></span>
        </div>
        <div className="text-right">
           <span className="text-[10px] text-slate-400 font-medium block">Dostępność:</span>
           <span className="text-xs font-bold text-green-500 uppercase">W magazynie</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase px-1">Ilość</span>
          <input 
            type="number" 
            min="1" 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 px-3 py-3 border border-gray-200 rounded-xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-50"
          />
        </div>
        <button 
          onClick={handleAddToCart}
          className="flex-1 mt-auto bg-slate-950 text-white rounded-xl h-[52px] flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-slate-950 transition-all font-black uppercase text-xs tracking-widest shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          Dodaj do butli
        </button>
      </div>
    </motion.div>
  );
}