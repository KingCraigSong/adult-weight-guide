# Weight-loss Meal Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a source-backed, responsive “减脂餐” page to the existing Vue recipe reference app without disrupting the seasonal recipe page.

**Architecture:** Keep one Vue app and switch between two top-level views using a `page` URL parameter. Keep the source-backed meal records in a focused data module, expose pure filter and URL-state helpers, and reuse the existing Element Plus drawer pattern for details.

**Tech Stack:** Vue 3, Vite, Element Plus, Vitest, native CSS.

---

### Task 1: Add source-backed meal data and pure filters with tests first

**Files:**
- Create: `src/data/weightLossMeals.js`
- Create: `src/data/weightLossMeals.test.js`
- Modify: `src/utils/urlState.js`
- Modify: `src/utils/urlState.test.js`

- [x] **Step 1: Write failing tests for meal filters and page URL state**

```js
import { describe, expect, it } from 'vitest'
import { filterWeightLossMeals, weightLossMeals } from './weightLossMeals'

it('filters weight-loss meals by calories, meal time, and method', () => {
  const result = filterWeightLossMeals(weightLossMeals, { calorieBand: 'under-300', meal: '晚餐', method: '汤羹' })
  expect(result.length).toBeGreaterThan(0)
  expect(result.every((meal) => meal.meal === '晚餐' && meal.method === '汤羹' && meal.calories <= 300)).toBe(true)
})
```

```js
it('round-trips the page and weight-loss filters through the URL', () => {
  const filters = readFilters('?page=weight-loss&calorie=under-300&meal=晚餐&method=汤羹')
  expect(filters.page).toBe('weight-loss')
  expect(writeFilters({ ...filters })).toContain('page=weight-loss')
})
```

- [x] **Step 2: Run focused tests and verify the new behavior fails**

Run: `npm test -- src/data/weightLossMeals.test.js src/utils/urlState.test.js`
Expected: FAIL because the new data module and URL keys do not exist.

- [x] **Step 3: Implement the source-backed recipe library and pure helpers**

Export `weightLossMeals`, `filterWeightLossMeals`, `CALORIE_BANDS`, `WEIGHT_LOSS_MEALS`, `COOKING_METHODS`, `MEAL_CATEGORIES`, and `PREP_TIMINGS`. Store source URL/title on every record, together with便当类型、准备方式、携带方式和保存建议。Use only concise paraphrases of the inspected pages and mark non-explicit calorie values as `calorieIsEstimate: true`.

Extend `readFilters` and `writeFilters` to accept `page`, `calorie`, `meal`, `method`, `category`, `prep`, and `portable` while preserving the seasonal page keys.

- [x] **Step 4: Run focused tests and verify they pass**

Run: `npm test -- src/data/weightLossMeals.test.js src/utils/urlState.test.js`
Expected: PASS.

### Task 2: Add the page switch and weight-loss view

**Files:**
- Modify: `src/App.vue`

- [x] **Step 1: Add reactive page state and URL restoration**

Read `page=weight-loss` on mount and popstate, expose two top-level navigation buttons, and synchronize the new filters without changing the existing seasonal filter behavior.

- [x] **Step 2: Render the weight-loss landing section, expanded filters, and cards**

Render the recipe library as cards with meal type, category, preparation timing, reheating mode, calorie estimate, tags, ingredient preview, and “查看做法” action. Show an empty state and clear-filters action when no record matches.

- [x] **Step 3: Render source-backed details in the existing drawer pattern**

Show calories, ingredient list, paraphrased steps, source title and an external link. Add the disclaimer that calories are estimates and recipes are not personalized medical advice.

### Task 3: Style, document, and verify the new page

**Files:**
- Modify: `src/styles.css`
- Modify: `README.md`

- [x] **Step 1: Add the weight-loss page visual tokens and responsive layout**

Add mint accent classes, page-specific hero/card styles, desktop three-column and mobile one-column layouts, and drawer typography while retaining the existing seasonal styles.

- [x] **Step 2: Update README with page behavior and source policy**

Document the `page=weight-loss` URL, local start/test/build commands, and that public recipe pages are summarized with source links.

- [x] **Step 3: Run full verification**

Run: `npm test && npm run build`
Expected: all tests pass and Vite exits 0.
