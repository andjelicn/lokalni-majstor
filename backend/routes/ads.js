const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const pool = require("../models/db.js");
const adsController = require("../controllers/adsController");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Math.random().toString(36).slice(2) + ext);
  },
});
const upload = multer({ storage });

// CREATE
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, location, price } = req.body;
    const ownerId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO ads (title, description, category, location, image_url, price, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        title,
        description,
        category || null,
        location || null,
        imageUrl,
        price ? Number(price) : null,
        ownerId,
      ]
    );

    res.status(201).json({
      message: "Oglas je uspjesno kreiran!",
      ad: result.rows[0],
    });
  } catch (error) {
    console.error("create ad error", error);
    res.status(500).json({
      message: "Greška pri kreiranju oglasa.",
      error: error.message,
    });
  }
});

// LIST + SEARCH
router.get("/", async (req, res) => {
  try {
    const { q, category, main_category, subcategory, city, owner, page = 1, limit = 24 } = req.query;

    const where = [];
    const values = [];
    let p = 1;

    where.push(`a.status = 'active'`);

    if (category) {
      where.push(`LOWER(a.category) = $${p++}`);
      values.push(String(category).toLowerCase());
    }

    if (main_category) {
        where.push(`LOWER(a.main_category) = $${p++}`);
        values.push(String(main_category).toLowerCase());
    }

    if (subcategory) {
        where.push(`LOWER(a.subcategory) = $${p++}`);
        values.push(String(subcategory).toLowerCase());
    }

    if (city) {
      where.push(`LOWER(a.location) = $${p++}`);
      values.push(String(city).toLowerCase());
    }

    if (owner && !Number.isNaN(Number(owner))) {
        where.push(`a.owner_id = $${p++}`);
        values.push(Number(owner));
    }

    const raw = (q || "").trim();
    if (raw) {
      const tokens = raw
        .split(/\s+/)
        .map((t) =>
          t
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
        )
        .filter(Boolean);

      if (tokens.length === 0) {
        res.set('Cache-Control', 'no-store');
        return res.json({
          items: [],
          total: 0,
          page: 1,
          pages: 0,
          limit: Number(limit) || 24,
        });
      }

      for (const tok of tokens) {
        const like = `%${tok}%`;
        where.push(
          `(LOWER(a.title) LIKE $${p} OR LOWER(a.description) LIKE $${p} OR LOWER(a.location) LIKE $${p})`
        );
        values.push(like);
        p++;
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT a.*, COUNT(*) OVER() AS __total
      FROM ads a
      ${whereSql}
      ORDER BY a.created_at DESC
      LIMIT $${p++} OFFSET $${p++};
    `;

    const result = await pool.query(sql, [...values, limitNum, offset]);
    const items = result.rows.map(({ __total, ...row }) => row);
    const total = result.rows[0]?.__total ? Number(result.rows[0].__total) : 0;

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    console.error("Greska pri pretrazivanju oglasa:", err);
    res.status(500).json({ message: "Greska na serveru", error: err.message });
  }
});

router.get("/my", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
        SELECT 
        id,
        title,
        description,
        location,
        status,
        category,
        image_Url,
        created_at
        FROM ads
        WHERE owner_id = $1 
        ORDER BY created_at DESC
        `;

        const { rows } = await pool.query(sql, [userId]);
        return res.json(rows);
    }   catch (err) {
        console.error("GET /api/ads/my error:", err);
        res.status(500).json({ message: "Greska na serveru." });
    }
});

router.get("/categories", adsController.getCategories);

router.get("/:id", adsController.getAdById);

router.put("/:id", verifyToken, adsController.updateAd);

router.patch("/:id/status", verifyToken, adsController.updateAdStatus);

router.delete("/:id", verifyToken, adsController.deleteAd);

module.exports = router;
