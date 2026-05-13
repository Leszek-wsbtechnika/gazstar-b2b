"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, FlaskConical } from 'lucide-react';

const PRODUCTS = [
  {
    name: 'Argon (Ar)',
    description: 'Bezwonny, bezbarwny i obojętny chemicznie gaz techniczny. Argon nie wchodzi w reakcje chemiczne, ma większą wagę od powietrza. Pospolity gaz szlachetny, jeden z podstawowych gazów ochronnych stosowanych w spawalnictwie, zarówno metodą MIG jak i TIG. Używany do przecinania, spawania lub jako mieszanka osłonowa podczas spawania materiałów, które mogłyby się utlenić. Dodatkowo argon jest wykorzystywany przy produkowaniu żarówek i dysków twardych, w przemyśle spożywczym, szklarskim, hutniczym, samochodowym czy w laboratoriach medycznych. Najczęściej dostępny w butlach 80 litrów.',
    purchase_price: 140, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Ar+CO₂ (82%/18%)',
    description: 'Najbardziej uniwersalna mieszanka Ar (82%) i CO2 (18%) wykorzystywana do spawana aluminium, stali kwasoodpornych lub tytanowych. Najczęściej stosowana w spawaniu metodą MAG.',
    purchase_price: 130, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Acetylen (C₂H₂)',
    description: 'Bezbarwny gaz palny o najwyższej temperaturze płomienia. Acetylen wytwarza wysokie temperatury, jest więc bardzo wydajny, a spalanie nie wymaga dużo tlenu i wilgoci. Niemal bezwonny, lżejszy od powietrza atmosferycznego. Dzięki tym właściwościom acetylen jest używany w pracy pod ziemią. Stosowany w palnikach acetylenowo-tlenowych do spawania i cięcia metali i do syntezy chemicznej alkoholu etylowego czy chlorku winylu.',
    purchase_price: 180, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Tlen (O₂)',
    description: 'Bezbarwny i bezwonny, najczęściej stosowany jako utleniacz w palnikach acetylenowo-tlenowych. W procesach chemicznych do utleniania amoniaku, chloru czy siarki. Gaz palny otrzymywany podczas rektyfikacji skroplonego powietrza, wykorzystywany podczas spalania gazem – spalania stali, cementu czy szkła w przemyśle. Do spawania (również jako składnik mieszanek osłonowych) i cięcia metali, w przemyśle chemicznym, spożywczym czy w medycynie.',
    purchase_price: 70, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Azot (N₂)',
    description: 'Bezbarwny i bezwonny, efekt rektyfikacji powietrza skroplonego. Gaz obojętny wykorzystywany jako podstawowa atmosfera ochronna w procesach przemysłowych, testowania szczelności instalacji przesyłowych lub napełniania instalacji pneumatycznych. Azot używany jest jako składnik mieszanek osłonowych w procesie spawania stali w hutach, chemii, przemyśle spożywczym, szklarskim czy w medycynie.',
    purchase_price: 90, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1614726365952-510103b1e72e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Azot + Wodór (N₂+H₂)',
    description: 'Mieszanina gazu formującego 5% wodoru (H2) + 95% azotu (N) używana jako czynnik chłodzący oraz w układach klimatyzacji. Jako wykrywacz wycieków.',
    purchase_price: 100, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1614726365952-510103b1e72e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Dwutlenek węgla (CO₂)',
    description: 'Bezbarwny i bezwonny osłonowy gaz techniczny. Dwutlenek węgla ma bardzo szeroką gamę zastosowań w przemyśle, m.in. podstawowy gaz osłonowy w mieszankach spawalniczych (pomaga wyeliminować dym i odpryski w metodzie MIG), czynnik roboczy w przeciwpożarowych gaśnicach śniegowych, przyspiesza dojrzewanie roślin szklarniowych, gaz napędowy broni pneumatycznej. Do produkcji napojów gazowanych, nabijania butli do saturatorów, w przemyśle spożywczym, laboratoriach, medycynie, obróbce metali. Posiadamy własną napełnialnię CO2.',
    purchase_price: 60, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1544099858-75e0d87b7174?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Hel (He)',
    description: 'Bezbarwny i bezwonny gaz techniczny, bez smaku. Najczęściej stosowany w branży rozrywkowej do napełniania balonów, które unoszą się w górę (hel jest lżejszy od powietrza), ale używa się go również m.in. w spawalnictwie, chemii, medycynie, metalurgii czy elektronice. Hel wykorzystywany jest też jako składnik mieszanek do butli do oddychania dla nurków i przy chłodzeniu nadprzewodników.',
    purchase_price: 300, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Propan (C₃H₈)',
    description: 'Bezbarwny i bezwonny, cięższy od powietrza, nierozpuszczalny w wodzie. Najpopularniejszy gaz grzewczy stosowany w gospodarstwach domowych oraz jako paliwo w kuchenkach gazowych lub w samochodach z silnikami spalinowymi. Źródło zasilania urządzeń grzewczych, urządzeń do gastronomii, palników dekarskich, w maszynach drogowych. Propan cechuje się wyższą temperaturą spalania niż mieszanina propan-butan.',
    purchase_price: 70, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1570291009040-ece32fae8600?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Propan-Butan (C₃H₈+C₄H₁₀)',
    description: 'Wykorzystywany do ogrzewania pomieszczeń mieszkalnych lub jako źródło zasilania kuchenek bądź piecyków gazowych. Propan-butan posiada większą wartość opałową niż czysty Propan jednak uzyskany dzięki niemu płomień nie osiągnie tak wysokiej temperatury. Do zastosowania do napędu wózka widłowego, w przemyśle spożywczym, budownictwie, pracach drogowych, obróbce cieplnej metali czy jako paliwo dla pojazdów.',
    purchase_price: 55, margin: 20,
    image_url: 'https://images.unsplash.com/photo-1570291009040-ece32fae8600?auto=format&fit=crop&q=80&w=600',
  },
];

type Status = 'idle' | 'checking' | 'ready' | 'seeding' | 'done' | 'error';

export default function SeedPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [log, setLog] = useState<string[]>([]);
  const [existingCount, setExistingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/logowanie'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/'); return; }

      const { count } = await supabase.from('products').select('id', { count: 'exact', head: true });
      setExistingCount(count ?? 0);
      setStatus('ready');
    }
    check();
  }, [router]);

  async function handleSeed() {
    setStatus('seeding');
    setLog([]);

    const productsWithPrice = PRODUCTS.map(p => ({
      ...p,
      price: p.purchase_price * (1 + p.margin / 100),
    }));

    let added = 0;
    for (const product of productsWithPrice) {
      const { error } = await supabase.from('products').insert([product]);
      if (error) {
        setLog(l => [...l, `✗ ${product.name} — ${error.message}`]);
      } else {
        setLog(l => [...l, `✓ ${product.name}`]);
        added++;
      }
    }

    setLog(l => [...l, `\nGotowe: dodano ${added} z ${productsWithPrice.length} produktów.`]);
    setStatus('done');
  }

  if (status === 'checking') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 max-w-lg w-full">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
          <FlaskConical className="w-7 h-7 text-blue-600" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Seed — Katalog Gazów</h1>
        <p className="text-sm text-slate-500 mb-6">
          Doda <strong>{PRODUCTS.length} produktów</strong> do bazy. Aktualnie w bazie: <strong>{existingCount}</strong>.
        </p>

        {existingCount > 0 && status === 'ready' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            Baza już zawiera produkty. Seed doda kolejne bez usuwania istniejących.
          </div>
        )}

        {log.length > 0 && (
          <div className="mb-6 bg-slate-950 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1 max-h-60 overflow-y-auto">
            {log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}

        {status === 'ready' && (
          <button
            onClick={handleSeed}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-blue-600 transition-colors"
          >
            Dodaj {PRODUCTS.length} produktów do katalogu
          </button>
        )}

        {status === 'seeding' && (
          <button disabled className="w-full py-4 bg-slate-900 text-white rounded-xl font-black opacity-50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Dodawanie...
          </button>
        )}

        {status === 'done' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle className="w-5 h-5" /> Produkty zostały dodane!
            </div>
            <button
              onClick={() => router.push('/oferta')}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Przejdź do Katalogu
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertCircle className="w-5 h-5" /> Wystąpił błąd. Sprawdź konsolę.
          </div>
        )}
      </div>
    </main>
  );
}
