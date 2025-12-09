const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const verifyToken = require("../middleware/auth");

router.use(verifyToken);

router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `SELECT ad_id
             FROM favorites
             WHERE user_id = $1
             ORDER BY ad_id ASC`;

        const result = await pool.query(sql, [userId]);
        const ids = result.rows.map((r) => r.ad_id);

        console.error("favorites GET debug:", { userId, ids });

        res.json({ ids });
    } catch (err) {
    console.error("GET /favorites/ids error:", err);
    res.status(500).json({ message: "Greska pri azuriranju omiljenih oglasa."});
    }
});

router.get("/full", async (req, res) => {
    try {
    const userId = req.user.id;

    const sql = `
        SELECT a.*
        FROM favorites f
        JOIN ads a ON a.id = f.ad_id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC `;

    const result = await pool.query(sql, [userId]);
    const items = result.rows || [];

    console.log("favorites FULL debug:", {userId, count: items.length});

    res.json({items});
}   catch (err) {
    console.error("GET /favorites/full error", err);
    res.status(500).json({message: "Greska na serveru0 "});
    }
});

router.post("/:adId", async (req, res) => {
    try {
        const userId = req.user.id;
        const adId  = Number(req.params.adId);

        console.log("favorites POST debug:", { userId, adId, user: req.user});

        if (!adId) {
            return res.status(400).json({ message: "Nedostaje adId" });
        }

        await pool.query(
            `
      INSERT INTO favorites (user_id, ad_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, ad_id) DO NOTHING
      `,
            [userId, adId]
        );

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error("POST /favorites error:", err);
        res.status(500).json({ message: "Greška na serveru" });
    }
});

router.delete("/:adId", async (req, res) => {
    try {
        const userId = req.user.id;
        const adId = Number(req.params.adId);

        await pool.query(
            `DELETE FROM favorites WHERE user_id = $1 AND ad_id = $2`,
            [userId, adId]
        );

        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /favorites/:adId error", err);
        res.status(500).json({ message: "Greška na serveru" });
    }
});

module.exports = router;
