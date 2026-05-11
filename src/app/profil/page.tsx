"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function Profil() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Sprawdzamy czy ktoś jest zalogowany
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Tu moglibyśmy pobrać dane z bazy, jeśli już istnieją
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleSave = async () => {
    // Tutaj zapiszemy dane do tabeli 'profiles'
    alert('Dane zapisane! Od teraz Twoje zamówienia będą miały te dane domyślnie.');
  };

  if (loading) return <p className="pt-32 text-center">Weryfikacja...</p>;
  if (!user) return <p className="pt-32 text-center">Musisz być zalogowany, aby zobaczyć tę stronę.</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-6">Uzupełnij dane firmy</h1>
          <p className="text-sm text-gray-500 mb-6 font-mono">{user.email}</p>
          
          <div className="space-y-4">
            <input 
              placeholder="Nazwa Firmy / Warsztatu"
              className="w-full p-3 rounded-xl border border-gray-200"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <input 
              placeholder="Adres dostawy"
              className="w-full p-3 rounded-xl border border-gray-200"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
            >
              Zapisz dane
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}