import guideText from '../../docs/pdf_content.txt?raw'

export const SEASONS = ['春季', '夏季', '秋季', '冬季']
export const REGIONS = ['东北地区', '西北地区', '华北地区', '华东地区', '华中地区', '西南地区', '华南地区']
export const ENERGY_OPTIONS = [1200, 1400, 1600]

const regionPageMap = {
  东北地区: 20,
  西北地区: 26,
  华北地区: 32,
  华东地区: 38,
  华中地区: 44,
  西南地区: 50,
  华南地区: 55,
}

const mealAliases = {
  早餐: 'breakfast',
  中餐: 'lunch',
  午餐: 'lunch',
  加餐: 'snack',
  晚餐: 'dinner',
}

const recipeHeading = /^(春季|夏季|秋季|冬季)食谱([123])（总能量(?:约)?([0-9]+)kcal）/
const regionHeading = /(?:一|二|三|四|五|六|七)、(东北地区|西北地区|华北地区|华东地区|华中地区|西南地区|华南地区)/

function cleanLine(value) {
  return value
    .replace(/\u000c/g, '')
    .replace(/^\d{1,3}(?=(?:一|二|三|四|五|六|七)、)/, '')
    .replace(/^\d{1,3}(?=(?:早餐|中餐|午餐|加餐|晚餐))/, '')
    .trim()
}

function normalizeFat(value) {
  return value > 100 ? Number((value / 100).toFixed(2)) : value
}

function parseNutrition(noteText) {
  const protein = noteText.match(/蛋白质\s*([0-9]+(?:\.[0-9]+)?)g/)
  const carbohydrate = noteText.match(/碳水化合物\s*([0-9]+(?:\.[0-9]+)?)g/)
  const fat = noteText.match(/脂肪\s*([0-9]+(?:\.[0-9]+)?)g/)
  const ratios = [...noteText.matchAll(/(蛋白质|碳水化合物|脂肪)\s*([0-9]+)%/g)]

  return {
    protein: protein ? Number(protein[1]) : null,
    carbohydrate: carbohydrate ? Number(carbohydrate[1]) : null,
    fat: fat ? normalizeFat(Number(fat[1])) : null,
    ratios: ratios.reduce((result, [, name, value]) => {
      const key = { 蛋白质: 'protein', 碳水化合物: 'carbohydrate', 脂肪: 'fat' }[name]
      result[key] = Number(value)
      return result
    }, {}),
  }
}

function parseFoodLine(rawLine) {
  const line = cleanLine(rawLine)
  if (!line) return null

  const opening = line.indexOf('（')
  if (opening === -1) return { name: line, ingredients: '', raw: line }

  const closing = line.lastIndexOf('）')
  const name = line.slice(0, opening).trim()
  const ingredients = line.slice(opening + 1, closing === -1 ? line.length : closing).trim()
  return { name, ingredients, raw: line }
}

function parseRecipeBlock(region, heading, lines) {
  const [, season, sequence, energy] = heading.match(recipeHeading)
  const meals = { breakfast: [], lunch: [], snack: [], dinner: [] }
  let currentMeal = null
  let noteStarted = false

  const addFood = (line, mealKey, hasLabel = false) => {
    if (!mealKey || !line || line.startsWith('油、盐') || line.startsWith('注：') || line.startsWith('注:')) return
    const food = parseFoodLine(line)
    if (!food) return

    const previous = meals[mealKey][meals[mealKey].length - 1]
    const previousIsWrapped = previous && (previous.raw.match(/（/g)?.length ?? 0) > (previous.raw.match(/）/g)?.length ?? 0)

    if (hasLabel || meals[mealKey].length === 0 || !previousIsWrapped) {
      meals[mealKey].push(food)
    } else {
      previous.raw += line
      previous.ingredients = `${previous.ingredients}${line}`.trim()
    }
  }

  for (const rawLine of lines) {
    let line = cleanLine(rawLine)
    if (line.startsWith('注：') || line.startsWith('注:')) {
      noteStarted = true
      continue
    }
    if (noteStarted) continue

    const embeddedMeal = line.match(/^(.*?)(\d{1,3})(早餐|中餐|午餐|加餐|晚餐)(.*)$/)
    if (embeddedMeal) {
      addFood(embeddedMeal[1].trim(), currentMeal)
      currentMeal = mealAliases[embeddedMeal[3]]
      addFood(embeddedMeal[4].trim(), currentMeal, true)
      continue
    }

    line = line.replace(/）\d{1,3}(?=[\u4e00-\u9fa5])/g, '）')

    const label = line.match(/^(早餐|中餐|午餐|加餐|晚餐)/)

    if (label) {
      currentMeal = mealAliases[label[1]]
      line = line.slice(label[1].length).trim()
    }

    addFood(line, currentMeal, Boolean(label))
  }

  const noteText = lines.join(' ')
  const foodMedicine = Object.values(meals)
    .flat()
    .filter((food) => food.raw.includes('*') || food.ingredients.includes('*'))
    .map((food) => food.name.replace('*', ''))

  return {
    id: `${region}-${season}-${energy}`,
    title: `${region} · ${season}食谱${sequence}`,
    region,
    season,
    energyKcal: Number(energy),
    meals,
    nutrition: parseNutrition(noteText),
    foodMedicine: [...new Set(foodMedicine)],
    note: '除括号内特殊标明外，食材份量均以可食部生重计算。',
    sourcePage: regionPageMap[region] ?? null,
  }
}

export function parseRecipes(source) {
  const lines = source.split(/\r?\n/)
  const recipes = []
  let region = null
  let activeHeading = null
  let activeLines = []

  const flush = () => {
    if (region && activeHeading) recipes.push(parseRecipeBlock(region, activeHeading, activeLines))
    activeHeading = null
    activeLines = []
  }

  for (const rawLine of lines) {
    const line = cleanLine(rawLine)
    const regionMatch = line.match(regionHeading)
    const headingMatch = line.match(recipeHeading)

    if (regionMatch) {
      flush()
      region = regionMatch[1]
      continue
    }

    if (headingMatch) {
      flush()
      activeHeading = line
      continue
    }

    if (activeHeading) {
      if (line.startsWith('注：') || line.startsWith('注:')) {
        activeLines.push(line)
      } else if (line.match(/^(春季|夏季|秋季|冬季)食谱/)) {
        flush()
        activeHeading = line
      } else {
        activeLines.push(line)
      }
    }
  }

  flush()
  return recipes
}

export const recipes = parseRecipes(guideText)

export function filterRecipes(items, filters) {
  return items.filter((recipe) => (
    (!filters.season || recipe.season === filters.season) &&
    (!filters.region || filters.region === '全部地域' || recipe.region === filters.region) &&
    (!filters.energy || filters.energy === '全部能量' || recipe.energyKcal === Number(filters.energy))
  ))
}
