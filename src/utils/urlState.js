import { REGIONS, SEASONS } from '../data/recipes'

const validEnergies = new Set(['1200', '1400', '1600'])

export function readFilters(search = '') {
  const params = new URLSearchParams(search)
  const season = SEASONS.includes(params.get('season')) ? params.get('season') : ''
  const region = REGIONS.includes(params.get('region')) ? params.get('region') : ''
  const energy = validEnergies.has(params.get('energy')) ? params.get('energy') : ''
  const recipe = params.get('recipe')?.trim() || ''
  return { season, region, energy, recipe }
}

export function writeFilters(filters) {
  const params = new URLSearchParams()
  if (SEASONS.includes(filters.season)) params.set('season', filters.season)
  if (REGIONS.includes(filters.region)) params.set('region', filters.region)
  if (validEnergies.has(String(filters.energy))) params.set('energy', String(filters.energy))
  if (filters.recipe) params.set('recipe', filters.recipe)

  const query = params.toString()
  return query ? `?${decodeURIComponent(query)}` : ''
}
