"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Truck, Zap, Activity, Info } from 'lucide-react';

const gasFacts = [
  "Azot stanowi 78% atmosfery. Po skropleniu osiąga temp. -196°C i jest znacznie chłodniejszy niż lód!",
  "Gazy szlachetne (krypton, ksenon) są pozyskiwane z powietrza i służą do potężnej izolacji termicznej nowoczesnych okien.",
  "Do produkcji gazów technicznych, zasysane powietrze musi zostać sprężone do ciśnienia aż 6 barów.",
  "Ciekły azot w farmacji jest kluczowy do przechowywania substancji biologicznych i szczepionek w sterylnych warunkach.",
  "Krypton w powietrzu to zaledwie 0,001% objętości, a ksenon to zaledwie 0,00001%. To prawdziwa rzadkość!"
];

export default function Home() {
  const snowParticles = Array.from({ length: 30 });

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      {/* MROCZNE HERO Z BĄBLAMI CIEKAWOSTEK */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
        
        {/* Tło i Efekty Wizualne (Mgła i śnieg) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-500/20 rounded-full blur-[120px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          {snowParticles.map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ left: `${(i * 3.7) % 100}vw`, opacity: 0.1 + (i % 5) * 0.15 }}
              initial={{ y: -20 }}
              animate={{ y: '120vh', x: `${((i * 3.7) % 100) + (i % 2 === 0 ? 5 : -5)}vw` }}
              transition={{ duration: 4 + (i % 6), repeat: Infinity, ease: "linear", delay: (i % 10) * 0.5 }}
            />
          ))}
        </div>

        {/* Główna zawartość Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Lewa strona - Tekst główny */}
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md text-cyan-400 text-sm font-semibold tracking-wide mb-6 border border-cyan-500/30"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                Kriogenika & Gazy Techniczne
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight"
              >
                Zimno, które <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  napędza przemysł.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-6 text-lg md:text-xl text-slate-300 font-light leading-relaxed"
              >
                Zaopatrujemy profesjonalne warsztaty spawalnicze, zakłady przemysłowe i gastronomię. 
                Gwarantujemy certyfikowaną czystość gazów i wygodne zarządzanie butlami online.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Link href="/oferta" className="px-8 py-4 bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2">
                  Zobacz Ofertę <Zap className="w-4 h-4" />
                </Link>
                <Link href="/logowanie" className="px-8 py-4 bg-slate-900/50 backdrop-blur-sm text-white font-medium rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-center">
                  Portal Klienta
                </Link>
              </motion.div>
            </div>

            {/* Prawa strona - Opadające, ogromne kule gazowe (bąble) */}
            <div className="hidden lg:flex relative h-[600px] w-full overflow-hidden mask-image-vertical justify-center items-start">
              {gasFacts.map((fact, index) => {
                const dropDuration = 30; // 12 sekund na pełen spadek (bardzo wolno i majestatycznie)
                const totalFacts = gasFacts.length;

                return (
                  <motion.div
                    key={index}
                    className="absolute w-80 h-80 bg-slate-800/40 backdrop-blur-xl border border-cyan-500/40 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center p-12 text-center"
                    initial={{ y: -350, opacity: 0, scale: 0.8 }}
                    animate={{ 
                      y: 650, // Leci daleko w dół poza widok
                      opacity: [0, 1, 1, 0], // Pojawia się gładko i tak samo znika
                      scale: [0.9, 1, 1, 0.9] // Lekkie puchnięcie w trakcie lotu
                    }}
                    transition={{
                      duration: dropDuration,
                      repeat: Infinity,
                      ease: "easeInOut", // Gładki start i stop
                      delay: index * dropDuration, // Opóźnienie = startuje dokładnie jak poprzedni zniknie
                      repeatDelay: (totalFacts - 1) * dropDuration // Czeka, aż reszta kul zrobi swoje okrążenie
                    }}
                  >
                    <div className="mb-4 w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.6)] shrink-0">
                      <Info className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">
                      {fact}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Reszta strony bez zmian... */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Standard <span className="text-cyan-600">GAZSTAR</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Zaprojektowaliśmy nasz łańcuch dostaw z myślą o maksymalnej wydajności Twojego biznesu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-cyan-500" />}
              title="Certyfikowana Czystość"
              desc="Gazy techniczne i spożywcze spełniające rygorystyczne normy jakościowe (np. Argon 4.8). Bezpieczeństwo i powtarzalność każdej partii."
            />
            <FeatureCard 
              icon={<Truck className="w-8 h-8 text-cyan-500" />}
              title="Własna Flota Transportowa"
              desc="Brak przestojów w Twojej firmie. Dostarczamy pełne butle i odbieramy puste prosto do Twojego warsztatu lub sklepu."
            />
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-cyan-500" />}
              title="Cyfrowy Magazyn"
              desc="Innowacyjny panel B2B. Złóż zamówienie w 3 sekundy, monitoruj faktury i wczytuj stany magazynowe za pomocą skanów PDF."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">10k+</div>
              <div className="text-slate-400 text-sm font-medium">Dostarczonych butli</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">99.9%</div>
              <div className="text-slate-400 text-sm font-medium">Czystości Argonu</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">24h</div>
              <div className="text-slate-400 text-sm font-medium">Czas realizacji</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">150+</div>
              <div className="text-slate-400 text-sm font-medium">Stałych klientów B2B</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}