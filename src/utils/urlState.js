import { REGIONS, SEASONS } from '../data/recipes'

const validEnergies = new Set(['1200', '1400', '1600'])
const validPages = new Set(['seasonal', 'weight-loss'])
const validCalories = new Set(['all', 'under-300', '301-450', 'over-450'])
const validMeals = new Set(['早餐', '午餐', '晚餐', '加餐'])
const validMethods = new Set(['蒸煮', '煎炒', '汤羹', '拌饭'])
const validCategories = new Set(['沙拉', '杂粮饭盒', '冷面', '全麦主食', '蒸煮便当', '热菜便当', '汤羹'])
const validPrepTimings = new Set(['前一晚完成', '早上快做', '前一晚备料', '无需加热'])

export function readFilters(search = '') {
  const params = new URLSearchParams(search)
  const page = validPages.has(params.get('page')) ? params.get('page') : 'seasonal'
  const season = SEASONS.includes(params.get('season')) ? params.get('season') : ''
  const region = REGIONS.includes(params.get('region')) ? params.get('region') : ''
  const energy = validEnergies.has(params.get('energy')) ? params.get('energy') : ''
  const recipe = params.get('recipe')?.trim() || ''
  const calorie = validCalories.has(params.get('calorie')) ? params.get('calorie') : ''
  const meal = validMeals.has(params.get('meal')) ? params.get('meal') : ''
  const method = validMethods.has(params.get('method')) ? params.get('method') : ''
  const category = validCategories.has(params.get('category')) ? params.get('category') : ''
  const prep = validPrepTimings.has(params.get('prep')) ? params.get('prep') : ''
  const portable = params.get('portable') === '1'
  const mealId = params.get('mealId')?.trim() || ''
  return { page, season, region, energy, recipe, calorie, meal, method, category, prep, portable, mealId }
}

export function writeFilters(filters) {
  const params = new URLSearchParams()
  if (validPages.has(filters.page) && filters.page !== 'seasonal') params.set('page', filters.page)
  if (SEASONS.includes(filters.season)) params.set('season', filters.season)
  if (REGIONS.includes(filters.region)) params.set('region', filters.region)
  if (validEnergies.has(String(filters.energy))) params.set('energy', String(filters.energy))
  if (filters.recipe) params.set('recipe', filters.recipe)
  if (validCalories.has(filters.calorie) && filters.calorie !== 'all') params.set('calorie', filters.calorie)
  if (validMeals.has(filters.meal)) params.set('meal', filters.meal)
  if (validMethods.has(filters.method)) params.set('method', filters.method)
  if (validCategories.has(filters.category)) params.set('category', filters.category)
  if (validPrepTimings.has(filters.prep)) params.set('prep', filters.prep)
  if (filters.portable) params.set('portable', '1')
  if (filters.mealId) params.set('mealId', filters.mealId)

  const query = params.toString()
  return query ? `?${decodeURIComponent(query)}` : ''
}
