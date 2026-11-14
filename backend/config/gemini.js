
let geminiClient = null

const getGeminiClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi')
  }

  if (!geminiClient) {
    const { GoogleGenAI } = await import('@google/genai')

    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  }

  return geminiClient
}

module.exports = getGeminiClient
