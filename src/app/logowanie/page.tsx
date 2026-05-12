"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';

export default function Logowanie() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'TOKEN'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Krok 1: Wysyłamy e-mail z 6-cyfrowym kodem
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Pozwalamy na rejestrację nowych
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep('TOKEN');
      setLoading(false);
    }
  };

  // Krok 2: Weryfikujemy kod i sprawdzamy rolę (Admin czy Klient)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (authError) {
      setError('Nieprawidłowy kod. Spróbuj ponownie.');
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Sprawdzamy, czy gość to ADMIN czy KLIENT
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin/zamowienia');
      } else {
        router.push('/profil'); // Klienci lecą do uzupełnienia danych
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4 pt-32">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal B2B</h1>
            <p className="text-slate-500 mt-2 text-sm">
              {step === 'EMAIL' ? 'Zaloguj się do swojego konta gazowego' : 'Wpisz kod zabezpieczający'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}

          {step === 'EMAIL' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Adres E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                    placeholder="jan@firma.pl"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Wyślij kod logowania'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
                  Kod z wiadomości e-mail
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))} // Tylko cyfry
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center text-2xl font-black tracking-widest text-slate-900"
                    placeholder="123456"
                  />
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Wysłaliśmy 6-cyfrowy kod na adres <br/> <strong className="text-slate-700">{email}</strong>
                </p>
              </div>
              <button
                disabled={loading || token.length !== 6}
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zaloguj mnie'}
              </button>
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Zmień adres e-mail
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}