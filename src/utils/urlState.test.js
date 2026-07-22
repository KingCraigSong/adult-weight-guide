import { describe, expect, it } from 'vitest'
import { readFilters, writeFilters } from './urlState'

describe('URL filter state', () => {
  it('reads supported filters and drops unknown values', () => {
    expect(readFilters('?season=夏季&region=华南地区&energy=1400&recipe=abc')).toEqual({
      page: 'seasonal',
      season: '夏季',
      region: '华南地区',
      energy: '1400',
      recipe: 'abc',
      calorie: '',
      meal: '',
      method: '',
      category: '',
      prep: '',
      portable: false,
      mealId: '',
    })
  })

  it('writes filters as a shareable query string', () => {
    expect(writeFilters({ season: '秋季', region: '全部地域', energy: '全部能量', recipe: '' })).toBe('?season=秋季')
  })

  it('round-trips page and weight-loss filters through the URL', () => {
    const filters = readFilters('?page=weight-loss&calorie=under-300&meal=晚餐&method=汤羹&category=沙拉&prep=前一晚完成&portable=1&mealId=shrimp-tofu-soup')

    expect(filters).toMatchObject({
      page: 'weight-loss',
      calorie: 'under-300',
      meal: '晚餐',
      method: '汤羹',
      category: '沙拉',
      prep: '前一晚完成',
      portable: true,
      mealId: 'shrimp-tofu-soup',
    })
    expect(writeFilters(filters)).toContain('page=weight-loss')
    expect(writeFilters(filters)).toContain('mealId=shrimp-tofu-soup')
  })
})
