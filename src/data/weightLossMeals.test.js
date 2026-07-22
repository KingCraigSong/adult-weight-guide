import { describe, expect, it } from 'vitest'
import { filterWeightLossMeals, weightLossMeals } from './weightLossMeals'

describe('weight-loss meal data', () => {
  it('filters meals by calorie band, meal time, and cooking method', () => {
    const result = filterWeightLossMeals(weightLossMeals, {
      calorieBand: 'under-300',
      meal: '晚餐',
      method: '汤羹',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((meal) => meal.meal === '晚餐' && meal.method === '汤羹' && meal.calories <= 300)).toBe(true)
  })

  it('keeps every meal ready for detail rendering and source attribution', () => {
    expect(weightLossMeals.length).toBeGreaterThanOrEqual(30)
    expect(weightLossMeals.every((meal) => meal.sourceUrl && meal.ingredients.length && meal.steps.length)).toBe(true)
  })

  it('finds portable recipes by preparation timing and category', () => {
    const result = filterWeightLossMeals(weightLossMeals, {
      category: '沙拉',
      prepTiming: '前一晚完成',
      portableOnly: true,
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((meal) => meal.category === '沙拉' && meal.prepTiming === '前一晚完成' && meal.portable)).toBe(true)
  })
})
