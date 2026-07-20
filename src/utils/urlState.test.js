import { describe, expect, it } from 'vitest'
import { readFilters, writeFilters } from './urlState'

describe('URL filter state', () => {
  it('reads supported filters and drops unknown values', () => {
    expect(readFilters('?season=夏季&region=华南地区&energy=1400&recipe=abc')).toEqual({
      season: '夏季',
      region: '华南地区',
      energy: '1400',
      recipe: 'abc',
    })
  })

  it('writes filters as a shareable query string', () => {
    expect(writeFilters({ season: '秋季', region: '全部地域', energy: '全部能量', recipe: '' })).toBe('?season=秋季')
  })
})
