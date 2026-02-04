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
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [main_category, setMainCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const didInitForm = useRef(false);

  const selectedMain = categories.find((c) => c.name === main_category);
  const subOptions = selectedMain?.subcategories ?? [];

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setErr("Naslov je obavezan.");
      return;
    }
    setSaving(true);
    setErr("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        main_category,
        subcategory: subcategory || null,
      };

      const res = await api.put(`/ads/${id}`, payload);
      setAd(res.data);
    } catch (e) {
      console.error("Greska pri uredjivanju oglasa", e);
      setErr("Greska pri uredjivanju oglasa");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/ads/${id}`);
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
    let active = true;

    (async () => {
      try {
        const res = await api.get("/ads/categories");
        if (!active) return;
        setCategories(Array.isArray(res.data.categories) ? res.data.categories : []);
      } catch (e) {
        console.error("Greska pri ucitavanju kategorija", e);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ad) return;

    setTitle(ad.title);
    setDescription(ad.description || "");
    setMainCategory(ad.main_category || "");
    setSubcategory(ad.subcategory || "");

    didInitForm.current = true;
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
        <Link to="/" className="inline-block mt-3 text-sm text-blue-600 hover:underline">
          ← Nazad
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-slate-900">Uredi oglas</h1>
      {err && <div className="text-red-600 text-sm mb-6">{err}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={title} className="block text-sm font-medium text-slate-700 mb-1">
            Naslov oglasa
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={description} className="block text-sm font-medium text-slate-700 mb-1">
            Opis oglasa
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm gap-6">
          <div className="mb-4">
            <h2 className="text-base font-medium text-slate-900">Kategorija i podkategorija</h2>
            <p className="mt-1 text-sm text-slate-500">
              Prvo izaberi glavnu kategoriju, zatim podkategoriju.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2">
            {/* Main Category */}
            <div>
              <label htmlFor="main_category" className="block text-sm font-medium text-slate-700">
                Kategorija
              </label>

              <div className="mt-1 relative">
                <select
                  id="main_category"
                  value={main_category}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMainCategory(v);
                    setSubcategory("");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-slate-900 shadow-sm outline-none
                            focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50"
                >
                  <option value="" disabled>
                    Izaberi kategoriju
                  </option>

                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* strelice */}
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700">
                Podkategorija
              </label>

              <div className="mt-1 relative">
                <select
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!main_category}
                  className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-slate-900 shadow-sm outline-none
                            focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50
                            ${!main_category} ? "cursor-not-allowed" border-slate-200 bg-slate-50 text-slate-400" : "border-slate-900"}`}
                >
                  <option value="" disabled>
                    {main_category ? "Izaberi kategoriju" : "Prvo izaberi kategoriju"}
                  </option>

                  {subOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  ▼
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {main_category
                  ? "Podkategorija zavisi od izabrane kategorije."
                  : "Podkategorija se otkljucava nakon izbora kategorije."}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Cuvam..." : "Sacuvaj"}
        </button>
      </form>
    </div>
  );
}