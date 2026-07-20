# Seasonal Recipe Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 + Vite responsive recipe reference page that turns Appendix 3 of the provided adult obesity dietary guide into searchable seasonal meal cards and a detail drawer.

**Architecture:** Keep the app client-only. Bundle the extracted PDF text as a local source, normalize it once through a pure parser into recipe records, and let the Vue app derive filtered results from season, region, and energy URL state. Split data parsing, URL state, and presentation so the interaction logic can be tested without a browser. Use Element Plus for accessible form controls and the responsive detail drawer, with project CSS tokens overriding its visual defaults.

**Tech Stack:** Vue 3, Vite, Element Plus, Vitest, semantic HTML, native CSS, no external image dependencies.

---

### Task 1: Scaffold the Vue application and test harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/styles.css`
- Create: `vitest.config.js`

- [ ] **Step 1: Add the minimal package and test scripts**

```json
{
  "name": "adult-weight-guide",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": { "@vitejs/plugin-vue": "latest", "element-plus": "latest", "vite": "latest", "vue": "latest" },
  "devDependencies": { "vitest": "latest", "jsdom": "latest" }
}
```

- [ ] **Step 2: Add the Vite entry and Vue mount**

```html
<div id="app"></div>
<script type="module" src="/src/main.js"></script>
```

```js
import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')
```

- [ ] **Step 3: Add Vitest configuration for pure module tests**

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ plugins: [vue()], test: { environment: 'jsdom' } })
```

- [ ] **Step 4: Run the build command to verify the scaffold is recognized**

Run: `npm install && npm run build`
Expected: Vite exits with code 0 and writes `dist/index.html`.

### Task 2: Normalize Appendix 3 content and URL state with tests first

**Files:**
- Use: `docs/pdf_content.txt`
- Create: `src/data/recipes.js`
- Create: `src/utils/urlState.js`
- Create: `src/data/recipes.test.js`
- Create: `src/utils/urlState.test.js`

- [ ] **Step 1: Write failing parser and URL-state tests**

```js
import { describe, expect, it } from 'vitest'
import { parseRecipes, filterRecipes } from './recipes'

const sample = `一、东北地区\n春季食谱1（总能量约1200kcal）\n早餐馒头（面粉50g）\n加餐苹果（200g）\n中餐二米饭（大米30g，小米20g）\n晚餐菜包饭（生菜100g）\n注：1.本食谱提供能量约为1200kcal，其中蛋白质64g，碳水化合物164g及脂肪21g；宏量营养素占总能量比约为：蛋白质20%，碳水化合物52%，脂肪28%。`

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
```

```js
import { describe, expect, it } from 'vitest'
import { readFilters, writeFilters } from './urlState'

it('reads supported filters and drops unknown values', () => {
  expect(readFilters('?season=夏季&region=华南地区&energy=1400&recipe=abc')).toEqual({
    season: '夏季', region: '华南地区', energy: '1400', recipe: 'abc'
  })
})

it('writes filters as a shareable query string', () => {
  expect(writeFilters({ season: '秋季', region: '全部地域', energy: '全部能量', recipe: '' }))
    .toBe('?season=秋季')
})
```

- [ ] **Step 2: Run the focused tests and verify they fail for missing modules**

Run: `npm test -- src/data/recipes.test.js src/utils/urlState.test.js`
Expected: FAIL because the parser and URL-state modules do not exist yet.

- [ ] **Step 3: Import the provided extracted PDF text and implement pure normalization helpers**

`recipes.js` imports `docs/pdf_content.txt` as a Vite raw asset and exports `parseRecipes(source)` and `filterRecipes(recipes, filters)`. Parse the seven region headings, the four season headings, the three energy levels, meal labels (`早餐`, `中餐`, `加餐`, `晚餐`), raw ingredient strings, source page markers, and the nutrition note. Preserve `*` food-medicine markers and append a note that all amounts are edible-part raw weights.

`urlState.js` must export `readFilters(search)` and `writeFilters(filters)`, accepting only `春季|夏季|秋季|冬季`, known regions, `1200|1400|1600`, and a recipe id.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `npm test -- src/data/recipes.test.js src/utils/urlState.test.js`
Expected: PASS with all focused tests green.

### Task 3: Build the Vue page, cards, filters, and detail drawer

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Add the page shell and reactive state**

Use `ref`/`computed` to derive the current season from the local month, read initial filters from `window.location.search`, and keep `selectedRecipe`, filter controls, and the URL query in sync. Use `ElSelect`, `ElTag`, and `ElButton` for controls while keeping semantic headings, a skip link, season buttons, result count, empty state, and a clear-filters action in the page markup.

- [ ] **Step 2: Add recipe card rendering**

Each card shows region, season, energy badge, title, four meal previews, total kcal, protein/carbohydrate/fat values, and a keyboard-accessible “查看详情” button. Use stable recipe ids and `aria-pressed`/`aria-expanded` where appropriate.

- [ ] **Step 3: Add the desktop side panel and mobile bottom drawer**

The detail view must show the title, metadata, nutrition metrics, each meal’s food and ingredient rows, raw-weight/source note, food-medicine explanation, PDF source page, and health disclaimer. Use `ElDrawer` with a desktop right-side placement and mobile bottom placement. Escape and close buttons must restore the list without changing filters.

### Task 4: Add the visual system and responsive behavior

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`

- [ ] **Step 1: Define the visual tokens and base typography**

Use a warm paper background, pine green text/actions, vermilion seasonal accent, and restrained ochre nutrition accents. Add focus-visible rings, reduced-motion support, and no external images.

- [ ] **Step 2: Implement responsive layouts**

Use a single-column mobile layout, two-column tablet grid, and three-column desktop grid. Make season tabs and filter controls scroll-safe on small screens; use a desktop fixed side panel and a mobile bottom-sheet presentation without horizontal overflow.

- [ ] **Step 3: Add document metadata and accessibility labels**

Set the Chinese page title, language, descriptive meta tags, and visually hidden helper text where needed.

### Task 5: Verify behavior and visual output

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full unit test suite**

Run: `npm test`
Expected: PASS with zero failed tests.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: Vite exits 0 and creates a production bundle.

- [ ] **Step 3: Run the app locally and inspect the key flows**

Run: `npm run dev -- --host 127.0.0.1`
Check: default season, season switching, region + energy filtering, empty state, URL restoration, card-to-drawer flow, Escape close, mobile width, tablet grid, and desktop side panel.

- [ ] **Step 4: Document the Vue start commands and source note**

Update `README.md` with `npm install`, `npm run dev`, `npm test`, `npm run build`, and a note that content is normalized from `docs/1743476136267_20714.pdf` / Appendix 3 and is for general reference only.
