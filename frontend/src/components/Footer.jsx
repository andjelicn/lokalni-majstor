export default function Footer() {

  return (
    <footer className="mt-auto bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Kolona 1: Brend */}
          <div>
            <h3 className="text-lg font-semibold text-white">Lokalni Majstor</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Platforma za povezivanje lokalnih majstora i klijenata, namijenjena trzistu Bosne i Hercegovine.
            </p>
          </div>

          {/* Kolona 2: Platforma */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Platforma
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-slate-300 hover:text-white" href="/search">Pregled usluga</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/ads/new">Objavi oglas</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/how-it-works">Kako funkcionise</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/faq">Cesta pitanja</a></li>
            </ul>
          </div>

          {/* Kolona 3: Za majstore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Za majstore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-slate-300 hover:text-white" href="/register">Kreiraj nalog</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/safety">Savjeti za bezbjednost</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/support">Podrska</a></li>
            </ul>
          </div>

          {/* Kolona 4: Za korisnike */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Pravne informacije
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-slate-300 hover:text-white" href="/terms">Uslovi koristenja</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/privacy">Politika privatnosti</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/contact">Kontakt</a></li>
            </ul>
          </div>
        </div>

        {/* donja traka */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Lokalni Majstor. Sva prava zadrzana.</span>
            <span>Napravljeno za trziste Bosne i Hercegovine.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}