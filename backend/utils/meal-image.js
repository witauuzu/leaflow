
const { supabaseAdmin } = require('../config/supabase')

// Cache hasil pencarian Pixabay selama 24 jam
const pixabaySearchCache = new Map()
const CACHE_DURATION = 24 * 60 * 60 * 1000

// Translate common Indonesian food ingredients into English
const ingredientTranslations = {
  ayam: 'chicken',
  sapi: 'beef',
  daging: 'meat',
  ikan: 'fish',
  salmon: 'salmon',
  tuna: 'tuna',
  udang: 'shrimp',
  cumi: 'squid',
  telur: 'egg',
  tahu: 'tofu',
  tempe: 'tempeh',
  brokoli: 'broccoli',
  wortel: 'carrot',
  kentang: 'potato',
  nasi: 'rice',
  mie: 'noodles',
  mi: 'noodles',
  pasta: 'pasta',
  jamur: 'mushroom',
  bayam: 'spinach',
  jagung: 'corn',
  alpukat: 'avocado',
  pisang: 'banana',
  oatmeal: 'oatmeal',
  oat: 'oatmeal',
  roti: 'bread',
  salad: 'salad',
  kacang: 'beans',
  tomat: 'tomato',
  paprika: 'bell pepper',
  buncis: 'green beans',
  terong: 'eggplant',
  ubi: 'sweet potato',
  keju: 'cheese',
  susu: 'milk',
}

// Remove cooking words and general descriptions
const ignoredWords = [
  'tumis', 'goreng', 'panggang', 'rebus', 'kukus',
  'bakar', 'crispy', 'grilled', 'fried', 'baked',
  'steamed', 'roasted', 'healthy', 'sehat',
  'with', 'and', 'ala', 'dengan', 'saus', 'sauce',
  'bumbu', 'special', 'simple', 'homemade',
  'hidangan', 'menu', 'untuk', 'rendah',
]

const createSearchQueries = (mealName) => {
  const words = mealName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !ignoredWords.includes(word))

  const translatedIngredients = words
    .map((word) => ingredientTranslations[word] || word)
    .filter(Boolean)

  const firstIngredient = translatedIngredients[0]

  if (!firstIngredient) {
    return ['food']
  }

  const queries = [
    translatedIngredients.slice(0, 2).join(' '),
    firstIngredient,
    `${firstIngredient} food`,
  ]

  return [...new Set(queries)]
}

// Search Pixabay with 24-hour cache
const searchPixabay = async (query) => {
  const cached = pixabaySearchCache.get(query)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.image
  }

  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY,
    q: query,
    image_type: 'photo',
    category: 'food',
    safesearch: 'true',
    per_page: '3',
    lang: 'en',
  })

  const response = await fetch(
    `https://pixabay.com/api/?${params.toString()}`
  )

  if (!response.ok) {
    const details = await response.text()

    console.error('Pixabay API Status:', response.status)
    console.error('Pixabay API Details:', details)

    throw new Error('Pixabay image search failed.')
  }

  const data = await response.json()
  const image = data.hits?.[0] || null

  pixabaySearchCache.set(query, {
    image,
    timestamp: Date.now(),
  })

  return image
}

const getMealImage = async (mealName) => {
  try {
    if (!mealName) return null

    if (!process.env.PIXABAY_API_KEY) {
      console.error('Pixabay API key is missing.')
      return null
    }

    const searchQueries = createSearchQueries(mealName)

    const slug = searchQueries[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const fileName = `${slug}.jpg`
    const storagePath = `meals/${fileName}`

    const bucket = supabaseAdmin.storage.from('meal-images')

    // Check whether the image already exists in Supabase
    const { data: existingFiles, error: listError } =
      await bucket.list('meals', {
        search: fileName,
      })

    if (listError) throw listError

    const imageExists = existingFiles?.some(
      (file) => file.name === fileName
    )

    if (imageExists) {
      const { data } = bucket.getPublicUrl(storagePath)

      return {
        imageUrl: data.publicUrl,
        imageSource: 'Pixabay',
      }
    }

    // Try up to three different search queries
    let image = null

    for (const query of searchQueries) {
      console.log(`Searching Pixabay: ${query}`)

      image = await searchPixabay(query)

      if (image) break
    }

    if (!image) {
      console.log(`No Pixabay image found for: ${mealName}`)
      return null
    }

    // Download the selected image
    const imageResponse = await fetch(image.webformatURL)

    if (!imageResponse.ok) {
      throw new Error('Failed to download meal image.')
    }

    const imageBuffer = Buffer.from(
      await imageResponse.arrayBuffer()
    )

    // Save image to Supabase Storage
    const { error: uploadError } = await bucket.upload(
      storagePath,
      imageBuffer,
      {
        contentType: 'image/jpeg',
        upsert: true,
      }
    )

    if (uploadError) throw uploadError

    const { data: publicData } = bucket.getPublicUrl(storagePath)

    return {
      imageUrl: publicData.publicUrl,
      imageSource: 'Pixabay',
      imagePhotographer: image.user,
      imageSourceUrl: image.pageURL,
    }
  } catch (error) {
    console.error('Get meal image error:', error)
    return null
  }
}

module.exports = getMealImage
