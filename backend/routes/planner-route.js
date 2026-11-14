const express = require('express')
const authenticateUser = require('../middleware/auth-middleware')
const getGeminiClient = require('../config/gemini')
const getMealImage = require('../utils/meal-image')

const router = express.Router()

// Test autentikasi Planner
router.get('/test', authenticateUser, (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Planner authentication successful.',
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  })
})


router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      duration,
      ...questionnaireAnswers
    } = req.body

    if (!startDate || !endDate || !duration) {
      return res.status(400).json({
        status: 'fail',
        message: 'Start date, end date, and duration are required.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_plans')
      .insert({
        user_id: req.user.id,
        start_date: startDate,
        end_date: endDate,
        duration: Number(duration),
        questionnaire_answers: questionnaireAnswers,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Save meal plan error:', error.message)

      return res.status(500).json({
        status: 'fail',
        message: 'Failed to save meal plan.',
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Meal plan saved successfully.',
      data,
    })
  } catch (error) {
    console.error('Save meal plan error:', error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong.',
    })
  }
})


// Save generated meals to meal_items
router.put('/:id/meals', authenticateUser, async (req, res) => {
  try {
    const { days } = req.body
    const mealPlanId = req.params.id

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Meal plan days are required.',
      })
    }

    // Check whether this meal plan belongs to the logged-in user
    const { data: mealPlan, error: planError } = await req.supabase
      .from('meal_plans')
      .select('id')
      .eq('id', mealPlanId)
      .single()

    if (planError || !mealPlan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found.',
      })
    }

    // Convert meals into database rows
    const mealRows = days.flatMap((day) =>
      (day.meals || []).map((meal) => ({
        meal_plan_id: mealPlanId,
        meal_date: day.date,
        meal_type: meal.mealType || meal.type,
        name: meal.name,
        portion: meal.portion || '1 serving',
        calories: meal.calories ?? null,
        protein: meal.protein ?? null,
        carbs: meal.carbs ?? null,
        fat: meal.fat ?? null,
        planned_time: meal.plannedTime || null,
        preparation_time: meal.preparationTime ?? null,
        ingredients: meal.ingredients || [],
        instructions: meal.instructions || [],
        is_consumed: meal.isConsumed ?? false,
        image_url: meal.imageUrl || null,
        image_source: meal.imageSource || null,
        image_photographer: meal.imagePhotographer || null,
        image_source_url: meal.imageSourceUrl || null,
        updated_at: new Date().toISOString(),
      }))
    )

    if (mealRows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No meals found to save.',
      })
    }

    // Insert or update meals to prevent duplicates
    const { data, error } = await req.supabase
      .from('meal_items')
      .upsert(mealRows, {
        onConflict: 'meal_plan_id,meal_date,meal_type',
      })
      .select()

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Meal plan meals saved successfully.',
      data,
    })
  } catch (error) {
    console.error('Save meals error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to save meal plan meals.',
      error: error.message,
    })
  }
})

// Get saved meals from a meal plan
router.get('/:id/meals', authenticateUser, async (req, res) => {
  try {
    const mealPlanId = req.params.id

    // Check meal plan ownership
    const { data: mealPlan, error: planError } = await req.supabase
      .from('meal_plans')
      .select('id')
      .eq('id', mealPlanId)
      .single()

    if (planError || !mealPlan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found.',
      })
    }

    // Get meals
    const { data: meals, error } = await req.supabase
      .from('meal_items')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .order('meal_date', { ascending: true })
      .order('meal_type', { ascending: true })

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      data: meals,
    })
  } catch (error) {
    console.error('Get meals error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve meals.',
    })
  }
})


// Update a saved meal
router.patch('/meals/:mealItemId', authenticateUser, async (req, res) => {
  try {
    const { name, portion } = req.body
    const mealItemId = req.params.mealItemId

    if (!name?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Meal name is required.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_items')
      .update({
        name: name.trim(),
        portion: portion?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealItemId)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Meal updated successfully.',
      data,
    })
  } catch (error) {
    console.error('Update meal error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to update meal.',
    })
  }
})

router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      duration,
      ...questionnaireAnswers
    } = req.body

    if (!startDate || !endDate || !duration) {
      return res.status(400).json({
        status: 'fail',
        message: 'Start date, end date, and duration are required.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_plans')
      .update({
        start_date: startDate,
        end_date: endDate,
        duration: Number(duration),
        questionnaire_answers: questionnaireAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Update meal plan error:', error.message)

      return res.status(500).json({
        status: 'fail',
        message: 'Failed to update meal plan.',
      })
    }

    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Meal plan updated successfully.',
      data,
    })
  } catch (error) {
    console.error('Update meal plan error:', error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong.',
    })
  }
})

// Generate meal plan using Gemini AI
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const {
      questionnaireAnswers,
      duration,
      startDate,
      customRequest,
      mealType,
      currentMeal,
    } = req.body

    if (!questionnaireAnswers || !duration || !startDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Questionnaire answers, duration, and start date are required.',
      })
    }

    const ai = await getGeminiClient()

    const isSingleMeal = Boolean(mealType)

    const prompt = `
You are a professional meal planner and nutrition assistant.

Create a meal ${isSingleMeal ? 'replacement' : 'plan'} based on the user's questionnaire answers.

USER PREFERENCES:
${JSON.stringify(questionnaireAnswers, null, 2)}

PLAN DETAILS:
- Start date: ${startDate}
- Duration: ${duration} days
- Only one person
- Generate meals only for the meal types selected by the user.

${isSingleMeal ? `
SINGLE MEAL REQUEST:
- Meal type: ${mealType}
- Previous meal: ${currentMeal || 'None'}
- User's custom request: ${customRequest || 'None'}
- Generate EXACTLY ONE meal.
- The meal must be for the requested meal type.
- The meal date must be ${startDate}.
- If a previous meal is provided, create a different meal.
- Follow the user's custom request whenever possible.
` : ''}

IMPORTANT RULES:
1. Respect all allergies and dietary restrictions.
2. Avoid all disliked foods.
3. Consider the user's budget and preparation time.
4. Follow the user's preferred cuisines and nutrition goals.
5. Provide realistic meals with accessible ingredients.
6. Use Indonesian Rupiah (IDR) for estimated meal costs.
7. Provide ingredients with quantities.
8. Provide clear cooking instructions.
9. Estimate calories, protein, carbohydrates, and fat.
10. Do not include meals that violate the user's allergies or dietary restrictions.
11. Estimate the cost of each meal for one serving in Indonesian Rupiah (IDR).
12. The estimatedCost must represent the estimated cost of ingredients used for one serving, not the full package purchase price.
13. Consider the user's total budget when estimating meal costs.
14. Keep the combined estimated meal costs within the user's daily budget whenever possible.
15. Use realistic ingredient prices in Indonesia.

Return ONLY valid JSON using this structure:

{
  "meals": [
    {
      "date": "YYYY-MM-DD",
      "mealType": "Breakfast",
      "name": "Meal name",
      "portion": "1 serving",
      "calories": 400,
      "protein": 25,
      "carbs": 45,
      "fat": 12,
      "estimatedCost": 15000,
      "plannedTime": "07:00",
      "preparationTime": 20,
      "ingredients": [
        {
          "name": "Ingredient name",
          "quantity": "100g"
        }
      ],
      "instructions": [
        "First cooking instruction",
        "Second cooking instruction"
      ]
    }
  ]
}

${isSingleMeal
  ? 'Generate exactly ONE meal matching the requested meal type.'
  : 'Generate all requested days and selected meal types.'}

Do not add Markdown formatting or text outside the JSON.
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    })

    const responseText = response.text

    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const generatedPlan = JSON.parse(cleanedResponse)
    // Get images for generated meals
    const uniqueMealNames = [
      ...new Set(generatedPlan.meals.map((meal) => meal.name)),
    ]

    const imageResults = await Promise.all(
      uniqueMealNames.map(async (mealName) => {
        const image = await getMealImage(mealName)
        return [mealName, image]
      })
    )

    const imageMap = new Map(imageResults)

    const mealsWithImages = generatedPlan.meals.map((meal) => {
      const image = imageMap.get(meal.name)

      return {
        ...meal,
        imageUrl: image?.imageUrl || null,
        imageSource: image?.imageSource || null,
        imagePhotographer: image?.imagePhotographer || null,
        imageSourceUrl: image?.imageSourceUrl || null,
      }
    })

    return res.status(200).json({
      status: 'success',
      message: 'Meal plan generated successfully.',
      data: {
        ...generatedPlan,
        meals: mealsWithImages,
      },
    })
  } catch (error) {
    console.error('Generate meal plan error:', error)

    return res.status(500).json({
      status: 'fail',
      message: 'Failed to generate meal plan.',
    })
  }
})

// Log an actual consumed meal
router.post('/consumption', authenticateUser, async (req, res) => {
  try {
    const {
      mealPlanId,
      mealItemId,
      mealDate,
      mealType,
      mealName,
      portion,
      calories,
      protein,
      carbs,
      fat,
    } = req.body

    if (!mealDate || !mealType || !mealName?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Meal date, type, and name are required.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_consumption_logs')
      .insert({
        user_id: req.user.id,
        meal_plan_id: mealPlanId || null,
        meal_item_id: mealItemId || null,
        meal_date: mealDate,
        meal_type: mealType,
        meal_name: mealName.trim(),
        portion: portion?.trim() || null,
        calories: calories ?? null,
        protein: protein ?? null,
        carbs: carbs ?? null,
        fat: fat ?? null,
        consumed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({
      status: 'success',
      message: 'Meal consumption logged successfully.',
      data,
    })
  } catch (error) {
    console.error('Log consumed meal error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to log consumed meal.',
    })
  }
})


// Estimate nutrition for an actual consumed meal
router.post('/estimate-nutrition', authenticateUser, async (req, res) => {
  try {
    const { mealName, portion, additionalDetails } = req.body

    if (!mealName?.trim() || !portion?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Meal name and portion are required.',
      })
    }

    const ai = await getGeminiClient()

    const prompt = `
You are a professional nutrition assistant.

Estimate the nutritional values of this actual meal consumed by one person.

MEAL INFORMATION:
- Food name: ${mealName}
- Portion: ${portion}
- Additional details: ${additionalDetails || 'None'}

RULES:
1. Estimate calories in kcal.
2. Estimate protein, carbohydrates, and fat in grams.
3. Consider the stated portion carefully.
4. Use realistic nutritional estimates.
5. If details are missing, use reasonable assumptions.
6. Return numeric values only.
7. Do not include Markdown or explanations.

Return ONLY valid JSON in this format:

{
  "calories": 450,
  "protein": 20,
  "carbs": 55,
  "fat": 15
}
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    })

    const cleanedResponse = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const nutrition = JSON.parse(cleanedResponse)

    const requiredFields = ['calories', 'protein', 'carbs', 'fat']

    for (const field of requiredFields) {
      if (
        typeof nutrition[field] !== 'number' ||
        !Number.isFinite(nutrition[field]) ||
        nutrition[field] < 0
      ) {
        throw new Error(`Invalid nutrition value: ${field}`)
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Nutrition estimated successfully.',
      data: nutrition,
    })
  } catch (error) {
    console.error('Estimate nutrition error:', error)

    return res.status(500).json({
      status: 'fail',
      message: 'Failed to estimate meal nutrition.',
    })
  }
})


// Mark a planned meal as consumed
router.post('/meals/:mealItemId/consume', authenticateUser, async (req, res) => {
  try {
    const mealItemId = req.params.mealItemId

    // Get the planned meal
    const { data: meal, error: mealError } = await req.supabase
      .from('meal_items')
      .select('*, meal_plans(user_id)')
      .eq('id', mealItemId)
      .single()

    if (mealError) throw mealError

    if (meal.is_consumed) {
      return res.status(409).json({
        status: 'fail',
        message: 'This meal has already been marked as consumed.',
      })
    }

    // Save actual consumption
    const { data: log, error: logError } = await req.supabase
      .from('meal_consumption_logs')
      .insert({
        user_id: req.user.id,
        meal_plan_id: meal.meal_plan_id,
        meal_item_id: meal.id,
        meal_date: meal.meal_date,
        meal_type: meal.meal_type,
        meal_name: meal.name,
        portion: meal.portion,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        consumed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) throw logError

    // Update planned meal status
    const { error: updateError } = await req.supabase
      .from('meal_items')
      .update({
        is_consumed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealItemId)

    if (updateError) throw updateError

    return res.status(200).json({
      status: 'success',
      message: 'Meal marked as consumed.',
      data: log,
    })
  } catch (error) {
    console.error('Mark meal consumed error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to mark meal as consumed.',
    })
  }
})


// Get actual meal consumption logs
router.get('/consumption', authenticateUser, async (req, res) => {
  try {
    const { mealPlanId, mealDate } = req.query

    if (!mealPlanId || !mealDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Meal plan ID and meal date are required.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_consumption_logs')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_date', mealDate)
      .order('created_at', { ascending: true })

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Get consumption logs error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve consumption logs.',
    })
  }
})

module.exports = router