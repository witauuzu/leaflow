const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint tes utama
app.get('/', (req, res) => {
  res.send('API Nutrition Tracker Berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server backend menyala di http://localhost:${PORT}`);
});