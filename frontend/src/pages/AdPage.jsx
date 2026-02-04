import toast from "react-hot-toast"
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api.js";

function timeAgo(iso) {
    if (!iso) return "";
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `prije ${d} ${d === 1 ? "dan" : "dana"}`;
    if (h > 0) return `prije ${h} ${h === 1 ? "sat" : "sati"}`;
    if (m > 0) return `prije ${m} ${m === 1 ? "min" : "minuta"}`;
    return "upravo objavljeno";
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function normalizeImageUrl(u) {
    if (!u) return "";
    const abs = u.startsWith("http://") || u.startsWith("https://");
    if (abs) return u;
    return u.startsWith("/") ? `${API_BASE}${u}` : `${API_BASE}/${u}`;
}

export default function AdPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user, favorites, toggleFavorite } = useAuth();

    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const adIdNum = ad ? Number(ad.id) : null;

    const isFav =
        adIdNum != null &&
        Array.isArray(favorites) &&
        favorites.includes(adIdNum);
    console.log("IsFav stanje:", isFav, "favorites", "ad.id:", ad?.id)

    const [copied, setCopied] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    const lightboxRef = useRef(null);

    console.log("AdPage favorites iz contexta:", favorites, "ad id:", ad?.id);


    // UČITAVANJE OGLASA
    useEffect(() => {
        let active = true;

        async function load() {
            try {
                setLoading(true);
                const res = await api.get(`/ads/${id}`);
                if (!active) return;
                setAd(res.data);
                setErr("");
            }   catch (e) {
                console.error("Greska pri ucitavanju oglasa", e);
            }   finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, [id]);

    // slike iz oglasa
    const images = (() => {
        if (!ad) return null;
        const urls = new Set();
        if (ad.image_url) urls.add(ad.image_url);
        if (Array.isArray(ad.images)) {
            ad.images.forEach((img) => img && urls.add(img));
        }
        if (urls.size === 0) return null;
        return Array.from(urls).map(normalizeImageUrl);
    })();

    const city = ad?.location?.split(">").pop()?.trim() || "";

    async function handleDelete() {
        if (!ad) return;
        if (!window.confirm("Obrisati oglas?")) return;

        try {
            await api.delete(`/ads/${ad.id}`);
            navigate("/");
        }   catch (e) {
            console.error(e);
            alert("Greska pri brisanju oglasa.");
        }
    }
    async function copyLink() {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: ad?.title || "Oglas",
                    url: window.location.href,
                    text: ad?.description?.slice(0, 120),
                });
                return;
            }

            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error(e);
        }
    }

    function handleToggleFavorite() {
        if (!ad) return;

        const adIdNum = Number(ad.id);
        toggleFavorite(adIdNum);

        if (isFav) {
            toast.success("Ukloljeno iz omiljenih");
        }   else {
            toast.success("Dodano u omiljene");
        }
    }

    function openLightbox(i = 0) {
        setIdx(i);
        setIsOpen(true);
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        setIsOpen(false);
        document.body.style.overflow = "";
    }

    function prevImg() {
        if (!images) return;
        setIdx((p) => (p - 1 + images.length) % images.length);
    }

    function nextImg() {
        if (!images) return;
        setIdx((p) => (p + 1) % images.length);
    }

    // tastatura za lightbox
    useEffect(() => {
        if (!isOpen) return;

        function onKey(e) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevImg();
            if (e.key === "ArrowRight") nextImg();
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, images]);

    // LOADING
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="h-56 rounded-2xl bg-slate-100 animate-pulse mb-6" />
                <div className="h-8 w-64 rounded bg-slate-100 animate-pulse mb-3" />
                <div className="h-4 w-40 rounded bg-slate-100 animate-pulse mb-6" />
                <div className="h-28 rounded bg-slate-100 animate-pulse" />
            </div>
        );
    }

    // GREŠKA ILI NEMA OGLASA
    if (err || !ad) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <p className="text-red-600">{err || "Oglas nije pronađen."}</p>
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
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28 sm:pb-6">
            <div className="mb-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    ← Nazad na oglase
                </Link>
            </div>

            <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center mb-3">
                            {images && images.length ? (
                                <img
                                    src={images[0]}
                                    alt={ad.title}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => openLightbox(0)}
                                />
                            ) : (
                                <div className="text-gray-400">Nema slike.</div>
                            )}
                        </div>

                        {images && images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((src, i) => (
                                    <button
                                        key={src}
                                        onClick={() => openLightbox(i)}
                                        className="flex-none rounded-md overflow-hidden border hover:scale-105 transition-transform"
                                    >
                                        <img
                                            src={src}
                                            alt={`thumb-${i}`}
                                            className="h-20 w-32 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{ad.title}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {ad.category && (
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                      {ad.category}
                                     </span>
                                )}
                                {city && (
                                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                       {city}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 text-sm text-slate-500">
                                {ad.created_at && (
                                    <span>
                                        Objavljeno:{" "}
                                        {new Date(ad.created_at).toLocaleDateString("sr-Latn-BA")} ·{" "}
                                        {timeAgo(ad.created_at)}
                                     </span>
                                )}
                            </div>
                        </div>

                        <div className="grow">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Opis</h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                {ad.description}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={copyLink}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border bg-white text-sm text-slate-700 hover:bg-slate-50"
                            >
                                {copied ? "Link kopiran" : "Podijeli / kopiraj link"}
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={`heart ${isFav} ? "heart-active" : ""}`}
                            >
                                <span className="heart__icon"
                                      style={{
                                          transform: isFav ? "scale(1.3)" : "scale(1)",
                                          transition: "transform 150ms ease",
                                          color: isFav ? "red" : "inherit",
                                      }}
                                 >
                                    {isFav ? "♥" : "♡" }
                                </span>
                                <span className="heart__text">
                                {isFav ? "Ukloni iz omiljenih︎" : "Dodaj u omiljene︎"}
                                 </span>
                            </button>

                            {user?.id === ad.owner_id ? (
                                <div className="flex gap-2">
                                    <Link
                                        to={`/edit-ad/${ad.id}/`}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                                    >
                                        Uredi
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                                    >
                                        Obriši
                                    </button>
                                </div>
                            ) : (
                                <a
                                    href={`mailto:info@example.com?subject=Upit za oglas: ${encodeURIComponent(
                                        ad.title
                                    )}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                                >
                                    Kontaktiraj
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t px-6 py-4 bg-white/50">
                    <div className="max-w-5xl mx-auto text-sm text-slate-600 flex flex-wrap gap-4">
                        <div>
                            <strong>Majstor:</strong>{" "}
                            {user.name || user.email || "Nepoznato"}
                        </div>
                        {ad.price && (
                            <div>
                                <strong>Cijena:</strong> {ad.price} KM
                            </div>
                        )}
                        {ad.phone && (
                            <div>
                                <strong>Telefon:</strong> {ad.phone}
                            </div>
                        )}
                        <div>
                            <strong>ID oglasa:</strong> {ad.id}
                        </div>
                    </div>
                </div>
            </article>

            {isOpen && images && (
                <div
                    ref={lightboxRef}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute right-6 top-6 z-60 rounded-full bg-white/90 px-3 py-1 text-sm text-slate-900"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                    >
                        ✕ Zatvori
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImg();
                                }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-slate-900"
                            >
                                ‹
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImg();
                                }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-slate-900"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <img
                        src={images[idx]}
                        alt={ad.title}
                        className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
