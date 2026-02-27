const {
  createAd,
  getAllAds,
  getAdById: getAdByIdModel,
  updateAd: updateAdModel,
  deleteAd,
  getCategories,
  updateAdStatus: updateAdStatusModel,
} = require('../models/ads');
const pool = require("../models/db");
const countRes = require("pg/lib/query");

exports.postAd = async (req, res) => {
  try {
    const ad = await createAd({
      owner_id:    req.user.id,          
      title:       req.body.title,
      description: req.body.description,
      category:    req.body.category ?? null,
      location:    req.body.location ?? null,
      image_url:   req.file ? '/uploads/' + req.file.filename : null,
      price:       req.body.price ?? null,
    });
    res.status(201).json(ad);
  } catch (err) {
    console.error('Greška u postAd:', err);
    res.status(500).json({ message: 'Greška pri kreiranju oglasa.' });
  }
};

exports.getAds = async (req, res) => {
  try {
    const ads = await getAllAds();
    res.json(ads);
  } catch (err) {
    console.error('Greška u getAds:', err);
    res.status(500).json({ message: 'Greška pri dohvatu oglasa.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories= [
      {
        name: "Auto i Transport",
        subcategories: ["Automehaničar", "Autoelektričar", "Auto limar", "Vulkanizer", "Autolakirer", "Šlep Služba"]
      },
      {
        name: "Građevina",
        subcategories: ["Zidar", "Keramičar", "Tesar", "Krovopokrivač", "Armirač", "Moler / Farbar", "Fasadni radnik", "Izolater", "Gipsar"]
      },
      {
        name: "Elektrika",
        subcategories: ["Električar", "Elektroinstalater", "Serviser bijele tehnike", "Klima majstor", "Serviser TV-a i elektronike", "Antenski serviser", "Video nadzor / Alarm sistemi", "IT serviser"]
      },
      {
        name: "Vodoinstalacaije",
        subcategories: ["Vodoinstalater", "Servis bojlera / kotlova", "Centralno grijanje (montaža i održavanje", "Plinoinstalater"]
      },
      {
        name: "Drvoprerada",
        subcategories: ["Stolar", "Tapetar", "Montaža kuhinja / plakara / ormara", "Ugradnja sobnih vrata", "Parketar"]
      },
      {
        name: "Čišćenje i održavanje",
        subcategories: ["Čistačica", "Održavanje zgrada / haustora", "Servis za pranje tepiha", "Deratizacija"]
      },
      {
        name: "Ostale kategorije",
        subcategories: ["Bravar", "Varioc", "Kamenorezac", "Kućni majstor", "Rukovodilac bagerom", "Majstor za namještaj po mjeri", "Kuhar za privatna slavlja", "Izrada konstrukcija"]
      }
    ];

    res.json({categories});
  } catch (err) {
    console.error('Greška u getCategories:', err);
    res.status(500).json({ message: 'Greška pri dohvatu kategorija.' });
  }
};


exports.getAdById = async (req, res) => {
  try {
    const ad = await getAdByIdModel(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Nije pronađen oglas.' });
    res.json(ad);
  } catch (err) {
    console.error('Greška u getAdById:', err);
    res.status(500).json({ message: 'Greška pri dohvatu oglasa.' });
  }
};


exports.updateAd = async (req, res) => {
 const existingAd = await getAdByIdModel(req.params.id);
 if (!existingAd) return res.status(404).json({ message: "Oglas nije pronadjen."})

  try {
    const ad = await updateAdModel({
      id:          req.params.id,
      owner_id:    req.user.id,
      title:       req.body.title,
      description: req.body.description,
      category:    req.body.category ?? existingAd.category,
      location:    req.body.location ?? existingAd.location,
      image_url:   req.body.image_url ?? existingAd.image_url,
      main_category: req.body.main_category.trim() ? req.body.main_category : existingAd.main_category,
      subcategory: req.body.subcategory?.trim() ? req.body.subcategory : existingAd.subcategory,
      price:       req.body.price ?? existingAd.price,
      status:     req.body.status ?? existingAd.status,
    });

    if (!ad) return res.status(404).json({ message: 'Oglas nije pronađen ili nije tvoj.' });
    res.json(ad);
  } catch (err) {
    console.error('Greška u updateAd:', err);
    res.status(500).json({ message: 'Greška pri ažuriranju oglasa.' });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const row = await deleteAd({ id: req.params.id, owner_id: req.user.id });
    if (!row) return res.status(404).json({ message: 'Oglas nije pronađen ili nije tvoj.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Greška u deleteAd:', err);
    res.status(500).json({ message: 'Greška pri brisanju oglasa.' });
  }
};


exports.updateAdStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "paused"].includes(status)) {
            return res.status(400).json({ message: "Neispravan status." });
        }

        const row = await updateAdStatusModel({
            id: req.params.id,
            owner_id: req.user.id,
            status,
        });

        if (!row) return res.status(404).json({ message: "Oglas nije pronadjen ili nije tvoj" });

        res.json(row);
    }   catch (err) {
        console.error("Greska u updateAdStatus:", err);
        res.status(500).json({ message: "Greska pri promjeni statusa" });
    }

};

exports.registerAdView = async (req, res) => {
    try {
       const adId = Number(req.params.id);
       if (!Number.isFinite(adId)) {
           return res.status(400).json({ message: "Neispravan ad id." });
       }

       const userId = req.user?.id || null;
       const fingerprint = req.headers['x-view-fingerprint'] || null;

       if (!userId && !fingerprint) {
           return res.status(400).json({ message: "Neispravana identifikacija korisnika" });
       }

    const since = "NOW() - INTERVAL '24 hours'";

    let existsQuery;
    let existsParams;

    if (userId) {
        existsQuery = `
            SELECT 1
            FROM public.ad_views
            WHERE ad_id = $1
             AND viewer_user_id = $2
             AND viewed_at >=  ${since}
            LIMIT 1`;
        existsParams = [adId, userId];
    }   else {
        existsQuery = `
            SELECT 1
            FROM public.ad_views
            WHERE ad_id = $1
             AND fingerprint = $2
             AND viewed_at >=  ${since}
            LIMIT 1`;
        existsParams = [adId, fingerprint];
    }

    const existsRes = await pool.query(existsQuery, existsParams);

    if (existsRes.rows.length > 0) {
        const countRes = await pool.query(
            `SELECT COUNT(*)::int AS views FROM public.ad_views WHERE ad_id = $1`,
            [adId]
        );
        return res.json({ registered: false, views: countRes.rows[0].views });
    }

    await pool.query(
        `INSERT INTO public.ad_views (ad_id, viewer_user_id, fingerprint, viewed_at)
         VALUES ($1, $2, $3, NOW())`,
        [adId, userId, fingerprint]
    );

    const CountRes = await pool.query(
        `SELECT COUNT(*)::int AS views FROM public.ad_views WHERE ad_id = $1`,
        [adId]
    );

    return res.json({ registered: true, views: CountRes.rows[0].views });
 }  catch (err) {
    console.error("Greska registerAdView;", err);
    return res.status(500).json({message: "Greska na serveru"});
    }
};
