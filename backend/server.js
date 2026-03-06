require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
 app.use(express.json());
 app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-view-fingerprint"],
}));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.connect()
  .then(() => console.log("✅ Konekcija sa bazom je uspješna!"))
  .catch((err) => console.error("❌ Greška pri konekciji sa bazom:", err));

app.set('etag', false); 

app.get('/', (req, res) => {
    res.send('Dobrodošao na Lokalni Majstor API');
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const adsRoutes = require('./routes/ads');
app.use('/api/ads', adsRoutes);

app.use("/api/favorites", require("./routes/favorites"));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server radi na http://localhost:${process.env.PORT}`);
});
