const express = require('express');
const cors = require('cors');
require('dotenv').config();

const getGeminiClient = require('./config/gemini')
const authRoute = require('./routes/auth-route')
const plannerRoute = require('./routes/planner-route')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint tes utama
app.get('/', (req, res) => {
  res.send('API Leaflow Berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server backend menyala di http://localhost:${PORT}`);
});

app.use('/api/auth', authRoute);
app.use('/api/planner', plannerRoute)

// Endpoint tes koneksi Gemini
app.get('/api/ai/test', async (req, res) => {
  try {
    const ai = await getGeminiClient()

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: 'Balas dengan teks: Gemini Leaflow berhasil terhubung!',
    })

    res.json({
      success: true,
      message: response.text,
    })
  } catch (error) {
    console.error('Gemini API Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Gagal menghubungkan Gemini API.',
    })
  }
})
