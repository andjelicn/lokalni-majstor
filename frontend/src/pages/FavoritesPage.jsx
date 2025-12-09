import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function FavoriteCard({ ad }) {
  return (
    <Link
      to={`/ads/${ad.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl
                border border-slate-800/70 bg-gradient-to-br from slate-900 via-slate-950 to-slate-900
                shadow-[0_18px_40px_rgba(15,23,42,0.75)]
                transition-all duration-300
                hover:-translate-y-1 hover:border-pink-500/70 hover:shadow-[0_25px_60px_rgba(236,72,153,0.55)]"
    >
      {/* gornji badge bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-5 py-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
          Omiljeni oglas
        </span>
        <span className="text-[11px] text-slate-400">
          ID: <span className="font-mono text-slate-200">#{ad.id}</span>
        </span>
      </div>

      {/* sadrzaj kartice */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h2 className="mb-1 line-clamp-2 text-lg font-semibold text-slate-50 group-hover:text-pink-300">
          {ad.title}
        </h2>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {ad.category && (
            <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200">
              {ad.category_name}
            </span>
          )}
          {ad.city && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2.5 py-1 text-[11px]">
              <span className="text-pink-300">📍</span>
              {ad.city}
            </span>
          )}
          {ad.created_at && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300">
              {formatDate(ad.created_at)}
            </span>
          )}
        </div>

        {ad.description && (
          <p className="mb-4 line-clamp-3 text-sm text-slate-300/90">{ad.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1 text-sm">
          <div className="inline-flex items-center gap-2 text-pink-300">
            <span className="text-lg leading-none">❤️</span>
            <span className="text-xs uppercase tracking-wide">Ostavljeno u omiljenim</span>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-pink-500/60
                      bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-200
                      transition-colors duration-200 group-hover:bg-pink-500/20"
          >
            Pogledaj oglas
            <span className="translate-y-px text-sm">↗</span>
          </span>
        </div>
      </div>

      {/* glow efekat ispod */}
      <div
        className="pointer-events-none absolute insert-x-5 bottom-0 h-16
                      translate-y-8 bg-gradient-to-t from-pink-500/40 via-pink-500/0 to-transparent
                      opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
    </Link>
  );
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/favorites/full");
        const list = Array.isArray(res.data.items) ? res.data.items : [];
        if (active) setItems(list);
      } catch (e) {
        console.error("FavoritesPage: Failed to load favorites", e);
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (user) {
      load();
    } else {
      setLoading(false);
      setItems([]);
    }

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3x1 font-bold tracking-tight text-slate-50">Omiljeni oglasi</h1>
          <p className="mt-1 text-sm text-slate-400">
            Brzi pristup majstorima i uslugama koje si sacuvao.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-300">
            Ukupno: <span className="font-semibold text-pink-300">{items.length}</span>
          </span>
        </div>
      </div>

      {/* loading state */}
      {loading && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-900/80" />
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && items.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 text-3xl">
            <span className="animate-pulse">❤️</span>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-slate-50">
            Jos uvijek nemas omiljenih oglasa
          </h2>
          <p className="mb-6 max-w-md text-sm text-slate-400">
            Pronadji majstore ili usluge koje ti se svidjaju i klikni na srce kako bi ih pronasao
            kasnije.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5
            text-sm font-semibold text-white shadow-lg shadow-pink-500/30
            transition-transform duration-150 hover:-translate-y-0.5"
          >
            Pogledaj oglase
          </Link>
        </div>
      )}

      {/* grid sa omiljenim oglasima */}
      {!loading && items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ad) => (
            <FavoriteCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
