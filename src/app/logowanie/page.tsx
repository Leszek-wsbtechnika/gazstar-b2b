"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function Logowanie() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Logowanie Magic Link wysyła link z kodem na maila
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profil`,
      },
    });

    if (error) {
      setMessage(`Błąd: ${error.message}`);
    } else {
      setMessage('Sprawdź swoją skrzynkę e-mail! Wysłaliśmy bezpieczny link i kod do logowania.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Klienta</h1>
          <p className="text-gray-500 mb-8">Wpisz swój adres e-mail, aby zalogować się lub założyć konto B2B.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Adres E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="biuro@twojafirma.pl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? 'Wysyłanie...' : 'Wyślij kod logowania'}
            </button>
            
            {message && (
              <p className="mt-4 text-sm text-center font-medium text-blue-600 bg-blue-50 p-3 rounded-lg">
                {message}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </main>
  );
}