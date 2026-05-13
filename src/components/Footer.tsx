import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="text-2xl font-black tracking-tighter text-white mb-6 block">
              GAZ<span className="text-blue-500">STAR</span>
            </span>
            <p className="text-sm leading-relaxed text-slate-400">
              Jesteśmy wiodącym dostawcą gazów technicznych, spożywczych i specjalistycznych.
              Zapewniamy najwyższą czystość produktów i niezawodne dostawy dla przemysłu,
              warsztatów spawalniczych oraz gastronomii.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Szybkie linki</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/oferta" className="hover:text-blue-400 transition-colors">Katalog Gazów</Link></li>
              <li><Link href="/logowanie" className="hover:text-blue-400 transition-colors">Portal Zamówień B2B</Link></li>
              <li><Link href="/profil" className="hover:text-blue-400 transition-colors">Twój Panel Klienta</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Skontaktuj się z nami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>ul. Przemysłowa 12, 00-000 Warszawa</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="tel:+48500600700" className="hover:text-blue-400 transition-colors">+48 500 600 700</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:zamowienia@gazstar.pl" className="hover:text-blue-400 transition-colors">zamowienia@gazstar.pl</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GAZSTAR. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
