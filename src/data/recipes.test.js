import { describe, expect, it } from 'vitest'
import { ENERGY_OPTIONS, REGIONS, SEASONS, filterRecipes, parseRecipes, recipes } from './recipes'

const sample = `一、东北地区
春季食谱1（总能量约1200kcal）
早餐馒头（面粉50g）
加餐苹果（200g）
中餐二米饭（大米30g，小米20g）
晚餐菜包饭（生菜100g）
注：1.本食谱提供能量约为1200kcal，其中蛋白质64g，碳水化合物164g及脂肪21g；宏量营养素占总能量比约为：蛋白质20%，碳水化合物52%，脂肪28%。`

describe('recipe data', () => {
  it('parses region, season, energy, meals, and nutrition', () => {
    const [recipe] = parseRecipes(sample)

    expect(recipe).toMatchObject({ region: '东北地区', season: '春季', energyKcal: 1200 })
    expect(recipe.meals.breakfast[0].name).toBe('馒头')
    expect(recipe.meals.dinner[0].ingredients).toContain('生菜100g')
    expect(recipe.nutrition.protein).toBe(64)
  })

  it('filters by all active dimensions', () => {
    const recipes = parseRecipes(sample)

    expect(filterRecipes(recipes, { season: '春季', region: '东北地区', energy: '1200' })).toHaveLength(1)
    expect(filterRecipes(recipes, { season: '冬季', region: '东北地区', energy: '1200' })).toHaveLength(0)
  })

  it('covers every region, season, and energy level from Appendix 3', () => {
    expect(recipes).toHaveLength(84)
    expect(new Set(recipes.map((recipe) => recipe.region))).toEqual(new Set(REGIONS))
    expect(new Set(recipes.map((recipe) => recipe.season))).toEqual(new Set(SEASONS))
    expect(new Set(recipes.map((recipe) => recipe.energyKcal))).toEqual(new Set(ENERGY_OPTIONS))
  })

  it('keeps page-break meal labels and excludes nutrition notes from meals', () => {
    const summerRecipe = recipes.find((recipe) => recipe.id === '东北地区-夏季-1200')
    const northwestRecipe = recipes.find((recipe) => recipe.id === '西北地区-夏季-1600')

    expect(summerRecipe.meals.dinner.map((food) => food.name)).toContain('三豆薏苡仁粥')
    expect(northwestRecipe.meals.dinner.every((food) => !food.raw.includes('宏量营养素'))).toBe(true)
  })
})
