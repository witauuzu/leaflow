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
        estimated_cost: meal.estimatedCost ?? null,
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


// Generate daily nutrition targets using Gemini AI
router.post('/nutrition-targets', authenticateUser, async (req, res) => {
  try {
    const {
      age,
      weight,
      height,
      activityLevel,
      goal,
      nutritionFocus,
    } = req.body

    const validActivityLevels = [
      'sedentary',
      'light',
      'moderate',
      'active',
      'very_active',
    ]

    if (
      !Number.isInteger(Number(age)) ||
      Number(age) < 18 ||
      Number(age) > 100 ||
      !Number.isFinite(Number(weight)) ||
      Number(weight) <= 0 ||
      !Number.isFinite(Number(height)) ||
      Number(height) <= 0 ||
      !validActivityLevels.includes(activityLevel)
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide valid personal information.',
      })
    }

    const ai = await getGeminiClient()

    const prompt = `
You are a nutrition estimation assistant.

Estimate general daily nutrition targets for an adult based on the following information.

USER INFORMATION:
- Age: ${Number(age)} years
- Weight: ${Number(weight)} kg
- Height: ${Number(height)} cm
- Activity level: ${activityLevel}
- Main goal: ${goal || 'General healthy eating'}
- Nutrition focus: ${JSON.stringify(nutritionFocus || [])}

INSTRUCTIONS:
1. Estimate daily calorie requirements using an appropriate evidence-based method.
2. Suggest reasonable daily protein, carbohydrate, and fat targets in grams.
3. Consider the user's activity level and stated goals.
4. Keep the targets balanced and realistic.
5. Do not recommend extreme calorie restriction.
6. Return whole numbers only.
7. These are general estimates, not medical prescriptions.

Return ONLY valid JSON in this format:

{
  "calories": 2000,
  "protein": 100,
  "carbs": 250,
  "fat": 67
}

Do not include Markdown or explanations.
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    })

    const cleanedResponse = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const targets = JSON.parse(cleanedResponse)

    const requiredFields = [
      'calories',
      'protein',
      'carbs',
      'fat',
    ]

    for (const field of requiredFields) {
      if (
        typeof targets[field] !== 'number' ||
        !Number.isFinite(targets[field]) ||
        targets[field] <= 0
      ) {
        throw new Error(`Invalid nutrition target: ${field}`)
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Nutrition targets generated successfully.',
      data: targets,
    })
  } catch (error) {
    console.error('Generate nutrition targets error:', error)

    return res.status(500).json({
      status: 'fail',
      message: 'Failed to generate nutrition targets.',
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
      recordedCost,
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
        recorded_cost: recordedCost ?? null,
        cost_type: recordedCost != null ? 'actual' : null,
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
        recorded_cost: meal.estimated_cost ?? null,
        cost_type: meal.estimated_cost != null ? 'estimated' : null,
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


// Unmark a planned meal as consumed
router.delete('/meals/:mealItemId/consume', authenticateUser, async (req, res) => {
  try {
    const mealItemId = req.params.mealItemId

    // Check the planned meal
    const { data: meal, error: mealError } = await req.supabase
      .from('meal_items')
      .select('id, is_consumed')
      .eq('id', mealItemId)
      .single()

    if (mealError || !meal) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal not found.',
      })
    }

    if (!meal.is_consumed) {
      return res.status(200).json({
        status: 'success',
        message: 'Meal is already marked as not consumed.',
      })
    }

    // Update planned meal status
    const { error: updateError } = await req.supabase
      .from('meal_items')
      .update({
        is_consumed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealItemId)

    if (updateError) throw updateError

    // Delete the related consumption log
    const { error: deleteError } = await req.supabase
      .from('meal_consumption_logs')
      .delete()
      .eq('meal_item_id', mealItemId)
      .eq('user_id', req.user.id)

    if (deleteError) {
      // Restore consumed status if deleting the log fails
      await req.supabase
        .from('meal_items')
        .update({
          is_consumed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mealItemId)

      throw deleteError
    }

    return res.status(200).json({
      status: 'success',
      message: 'Meal consumption successfully undone.',
    })
  } catch (error) {
    console.error('Undo meal consumption error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to undo meal consumption.',
    })
  }
})

// Get nutrition trends
router.get('/nutrition-trends', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Start date and end date are required.',
      })
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (
      !datePattern.test(startDate) ||
      !datePattern.test(endDate) ||
      startDate > endDate
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid date range.',
      })
    }

    const { data, error } = await req.supabase
      .from('meal_consumption_logs')
      .select('meal_date, calories, protein, carbs, fat')
      .gte('meal_date', startDate)
      .lte('meal_date', endDate)
      .order('meal_date', { ascending: true })

    if (error) throw error

    // Group consumption data by date
    const dailyNutrition = {}

    data.forEach((meal) => {
      const date = meal.meal_date

      if (!dailyNutrition[date]) {
        dailyNutrition[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      }

      dailyNutrition[date].calories += Number(meal.calories) || 0
      dailyNutrition[date].protein += Number(meal.protein) || 0
      dailyNutrition[date].carbs += Number(meal.carbs) || 0
      dailyNutrition[date].fat += Number(meal.fat) || 0
    })

    return res.status(200).json({
      status: 'success',
      data: Object.values(dailyNutrition),
    })
  } catch (error) {
    console.error('Get nutrition trends error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve nutrition trends.',
    })
  }
})


// Get food spending summary
router.get('/food-spending', authenticateUser, async (req, res) => {
  try {
    const { selectedDate } = req.query

    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (!selectedDate || !datePattern.test(selectedDate)) {
      return res.status(400).json({
        status: 'fail',
        message: 'A valid selected date is required.',
      })
    }

    // Get active meal plan for the selected date
    const { data: plan, error: planError } = await req.supabase
      .from('meal_plans')
      .select('id, start_date, end_date, questionnaire_answers')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .lte('start_date', selectedDate)
      .gte('end_date', selectedDate)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (planError) throw planError

    if (!plan) {
      return res.status(200).json({
        status: 'success',
        data: {
          budgetAmount: 0,
          budgetPeriod: null,
          actualSpending: 0,
          remainingBudget: 0,
          periodStart: null,
          periodEnd: null,
        },
      })
    }

    const answers = plan.questionnaire_answers || {}
    const budgetAmount = Number(answers.budgetAmount) || 0
    const budgetPeriod = answers.budgetPeriod || 'Per Day'

    // Determine spending period
    const date = new Date(`${selectedDate}T00:00:00.000Z`)
    const periodStart = new Date(date)
    const periodEnd = new Date(date)

    if (budgetPeriod === 'Per Week') {
      const day = date.getUTCDay()
      const daysSinceMonday = (day + 6) % 7

      periodStart.setUTCDate(date.getUTCDate() - daysSinceMonday)
      periodEnd.setUTCDate(periodStart.getUTCDate() + 6)
    } else if (budgetPeriod === 'Per Month') {
      periodStart.setUTCDate(1)
      periodEnd.setUTCMonth(date.getUTCMonth() + 1, 0)
    }

    const formatDate = (value) => value.toISOString().slice(0, 10)

    const startDate = formatDate(periodStart)
    const endDate = formatDate(periodEnd)

    // Get actual spending within the calculated period
    const { data: logs, error: logsError } = await req.supabase
      .from('meal_consumption_logs')
      .select('recorded_cost')
      .eq('meal_plan_id', plan.id)
      .gte('meal_date', startDate)
      .lte('meal_date', endDate)

    if (logsError) throw logsError

    const actualSpending = (logs || []).reduce(
      (total, log) => total + (Number(log.recorded_cost) || 0),
      0
    )

    return res.status(200).json({
      status: 'success',
      data: {
        budgetAmount,
        budgetPeriod,
        actualSpending,
        remainingBudget: budgetAmount - actualSpending,
        periodStart: startDate,
        periodEnd: endDate,
      },
    })
  } catch (error) {
    console.error('Get food spending error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to load food spending.',
    })
  }
})

// Get daily water intake
router.get('/water-intake', authenticateUser, async (req, res) => {
  try {
    const { intakeDate } = req.query

    if (!intakeDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Intake date is required.',
      })
    }

    const { data, error } = await req.supabase
      .from('water_intake_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('intake_date', intakeDate)
      .maybeSingle()

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Get water intake error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to load water intake.',
    })
  }
})

// Save daily water intake
router.post('/water-intake', authenticateUser, async (req, res) => {
  try {
    const { intakeDate, amountMl } = req.body

    if (
      !intakeDate ||
      !Number.isFinite(amountMl) ||
      amountMl < 0
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid intake date and amount are required.',
      })
    }

    const { data, error } = await req.supabase
      .from('water_intake_logs')
      .upsert(
        {
          user_id: req.user.id,
          intake_date: intakeDate,
          amount_ml: amountMl,
        },
        {
          onConflict: 'user_id,intake_date',
        }
      )
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Water intake saved successfully.',
      data,
    })
  } catch (error) {
    console.error('Save water intake error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to save water intake.',
    })
  }
})


// Get all meal plans for Calendar
router.get('/calendar', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('meal_plans')
      .select(`
        id,
        start_date,
        end_date,
        duration,
        status,
        meal_items (
          id,
          meal_date,
          meal_type,
          name,
          portion,
          calories,
          protein,
          carbs,
          fat
        )
      `)
      .eq('user_id', req.user.id)
      .order('start_date', { ascending: true })

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      data: data || [],
    })
  } catch (error) {
    console.error('Get calendar meal plans error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to load calendar meal plans.',
    })
  }
})

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

// Get meal plan details
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('meal_plans')
      .select('id, user_id, questionnaire_answers')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Get meal plan details error:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve meal plan.',
    })
  }
})


// Generate AI meal plan for public AI Trial
router.post('/trial-generate', async (req, res) => {
  try {
    const {
      goal,
      budget,
      diet,
      meals,
      cookingTime,
    } = req.body

    if (
      !goal ||
      !budget ||
      !diet ||
      !Array.isArray(meals) ||
      meals.length === 0 ||
      !cookingTime
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please complete all meal preferences.',
      })
    }

    const ai = await getGeminiClient()

    const prompt = `
You are a professional meal planner and nutrition assistant.

Create a daily meal plan for ONE person based on these preferences:

- Main goal: ${goal}
- Daily food budget: IDR ${budget}
- Diet style: ${diet}
- Selected meals: ${meals.join(', ')}
- Maximum cooking time: ${cookingTime}

IMPORTANT RULES:
1. Generate exactly one meal for each selected meal type.
2. Respect the selected dietary preference.
3. Prioritize the user's main goal.
4. Keep the combined estimated meal costs within the daily budget whenever possible.
5. Use realistic Indonesian ingredient prices.
6. Provide realistic nutrition estimates.
7. Use accessible ingredients.
8. All costs must be in Indonesian Rupiah.
9. Each meal must be for one serving.
10. Cooking time must respect the user's preference whenever possible.

Return ONLY valid JSON using this structure:

{
  "meals": [
    {
      "mealType": "Breakfast",
      "name": "Meal name",
      "calories": 400,
      "protein": 25,
      "estimatedCost": 15000,
      "preparationTime": 20,
      "description": "Short meal description"
    }
  ]
}

Do not include Markdown or text outside the JSON.
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    })

    const cleanedResponse = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const generatedPlan = JSON.parse(cleanedResponse)

    if (!Array.isArray(generatedPlan.meals)) {
      throw new Error('Invalid meal plan response.')
    }

    const imageResults = await Promise.all(
      generatedPlan.meals.map(async (meal) => {
        const image = await getMealImage(meal.name)

        return {
          ...meal,
          imageUrl: image?.imageUrl || null,
          imageSource: image?.imageSource || null,
        }
      })
    )

    return res.status(200).json({
      status: 'success',
      message: 'AI Trial meal plan generated successfully.',
      data: {
        meals: imageResults,
      },
    })
  } catch (error) {
    console.error('AI Trial generation error:', error)

    return res.status(500).json({
      status: 'fail',
      message: 'Failed to generate AI Trial meal plan.',
    })
  }
})

module.exports = router