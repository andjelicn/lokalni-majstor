import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export function EditAdPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ad, setAd] = useState(null);


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const didInitForm = useRef(false);


  function handleSubmit(e) {
    e.preventDefault();
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/ads/${id}`)
        if (!active) return;
        setAd(res.data);
        setErr("");
      } catch (e) {
        console.error("Greska pri ucitavanju oglasa", e);
        setErr("Ovaj oglas ne postoji ili nemate pristup istom.");
      } finally {
        if (active) setLoading(false);
      }
    }

    didInitForm.current = false;
    load();
    return () => {
      active = false;
    };
  }, [id]);


  useEffect(() => {
    if (!ad) return;
    didInitForm.current = true;

    setTitle(ad.title);
    setDescription(ad.description || "");
  }, [ad]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-56 rounded-2xl bg-slate-100 animate-pulse mb-6" />
        <div className="h-8 w-64 rounded bg-slate-100 animate-pulse mb-3" />
        <div className="h-8 w-40 rounded bg-slate-100 animate-pulse mb-6" />
        <div className="h-28 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (err || !ad) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-red-600">{err || "Oglas nije pronadjen."}</p>
        <Link
          to="/"
          className="inline-block mt-3 text-sm text-blue-600 hover:underline"
        >
          ← Nazad

        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-slate-900">Uredi oglas</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={title} className="block text-sm font-medium text-slate-700 mb-1">Naslov oglasa</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor={description} className="block text-sm font-medium text-slate-700 mb-1">Opis oglasa</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Sacuvaj izmjene</button>
      </form>
    </div>
  );
}
