<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ENERGY_OPTIONS, REGIONS, SEASONS, filterRecipes, recipes } from './data/recipes'
import { CALORIE_BANDS, COOKING_METHODS, MEAL_CATEGORIES, PREP_TIMINGS, WEIGHT_LOSS_MEALS, filterWeightLossMeals, weightLossMeals } from './data/weightLossMeals'
import { readFilters, writeFilters } from './utils/urlState'

const seasonMeta = {
  春季: { icon: '芽', eyebrow: '万物生发', description: '选择清鲜应季食材，给身体一个轻盈的开始。' },
  夏季: { icon: '荷', eyebrow: '清润一夏', description: '以瓜果、绿叶菜和清淡烹调，陪你安稳度过暑热。' },
  秋季: { icon: '穗', eyebrow: '收获时节', description: '顺应秋日丰收，搭配温润、富有层次的全天食谱。' },
  冬季: { icon: '炉', eyebrow: '暖意入冬', description: '用热食和杂粮守住冬日的饱足感与营养平衡。' },
}

const mealMeta = [
  { key: 'breakfast', label: '早餐', icon: '早' },
  { key: 'lunch', label: '中餐', icon: '午' },
  { key: 'snack', label: '加餐', icon: '间' },
  { key: 'dinner', label: '晚餐', icon: '晚' },
]

const initialFilters = readFilters(window.location.search)
const currentSeasonByMonth = () => {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

const season = ref(initialFilters.season || currentSeasonByMonth())
const region = ref(initialFilters.region || '全部地域')
const energy = ref(initialFilters.energy || '全部能量')
const page = ref(initialFilters.page || 'seasonal')
const calorieBand = ref(initialFilters.calorie || 'all')
const mealFilter = ref(initialFilters.meal || '全部餐次')
const methodFilter = ref(initialFilters.method || '全部方式')
const categoryFilter = ref(initialFilters.category || '全部类型')
const prepTiming = ref(initialFilters.prep || 'all')
const portableOnly = ref(Boolean(initialFilters.portable))
const selectedRecipe = ref(initialFilters.page === 'seasonal' ? recipes.find((recipe) => recipe.id === initialFilters.recipe) || null : null)
const drawerVisible = ref(Boolean(selectedRecipe.value))
const selectedWeightLossMeal = ref(initialFilters.page === 'weight-loss' ? weightLossMeals.find((meal) => meal.id === initialFilters.mealId) || null : null)
const weightLossDrawerVisible = ref(Boolean(selectedWeightLossMeal.value))
const isMobile = ref(false)

const filteredRecipes = computed(() => filterRecipes(recipes, { season: season.value, region: region.value, energy: energy.value }))
const filteredWeightLossMeals = computed(() => filterWeightLossMeals(weightLossMeals, {
  calorieBand: calorieBand.value,
  meal: mealFilter.value,
  method: methodFilter.value,
  category: categoryFilter.value,
  prepTiming: prepTiming.value,
  portableOnly: portableOnly.value,
}))
const currentMeta = computed(() => seasonMeta[season.value])
const activeCount = computed(() => [region.value !== '全部地域', energy.value !== '全部能量'].filter(Boolean).length)
const weightLossActiveCount = computed(() => [calorieBand.value !== 'all', mealFilter.value !== '全部餐次', methodFilter.value !== '全部方式', categoryFilter.value !== '全部类型', prepTiming.value !== 'all', portableOnly.value].filter(Boolean).length)
const drawerDirection = computed(() => (isMobile.value ? 'btt' : 'rtl'))
const drawerSize = computed(() => (isMobile.value ? 'min(86vh, 760px)' : 'min(760px, 92vw)'))

function updateViewport() {
  isMobile.value = window.matchMedia('(max-width: 760px)').matches
}

function syncUrl(recipeId = '', mealId = '') {
  const query = writeFilters({
    page: page.value,
    season: season.value,
    region: region.value,
    energy: energy.value,
    recipe: recipeId,
    calorie: calorieBand.value,
    meal: mealFilter.value,
    method: methodFilter.value,
    category: categoryFilter.value,
    prep: prepTiming.value,
    portable: portableOnly.value,
    mealId,
  })
  window.history.replaceState({}, '', `${window.location.pathname}${query}`)
}

function setPage(nextPage) {
  page.value = nextPage
  drawerVisible.value = false
  weightLossDrawerVisible.value = false
  selectedRecipe.value = null
  selectedWeightLossMeal.value = null
}

function setSeason(nextSeason) {
  season.value = nextSeason
}

function openRecipe(recipe) {
  selectedRecipe.value = recipe
  drawerVisible.value = true
  syncUrl(recipe.id)
}

function closeRecipe() {
  drawerVisible.value = false
  selectedRecipe.value = null
  syncUrl('', selectedWeightLossMeal.value?.id || '')
}

function openWeightLossMeal(meal) {
  selectedWeightLossMeal.value = meal
  weightLossDrawerVisible.value = true
  syncUrl('', meal.id)
}

function closeWeightLossMeal() {
  weightLossDrawerVisible.value = false
  selectedWeightLossMeal.value = null
  syncUrl(selectedRecipe.value?.id || '')
}

function clearFilters() {
  season.value = currentSeasonByMonth()
  region.value = '全部地域'
  energy.value = '全部能量'
}

function clearWeightLossFilters() {
  calorieBand.value = 'all'
  mealFilter.value = '全部餐次'
  methodFilter.value = '全部方式'
  categoryFilter.value = '全部类型'
  prepTiming.value = 'all'
  portableOnly.value = false
}

function mealPreview(recipe, key) {
  return (recipe.meals[key] || []).slice(0, 2).map((food) => food.name).join('、') || '暂无记录'
}

function formatNutrition(value) {
  return value === null || value === undefined ? '—' : `${value}g`
}

function onPopState() {
  const next = readFilters(window.location.search)
  season.value = next.season || currentSeasonByMonth()
  region.value = next.region || '全部地域'
  energy.value = next.energy || '全部能量'
  page.value = next.page || 'seasonal'
  calorieBand.value = next.calorie || 'all'
  mealFilter.value = next.meal || '全部餐次'
  methodFilter.value = next.method || '全部方式'
  categoryFilter.value = next.category || '全部类型'
  prepTiming.value = next.prep || 'all'
  portableOnly.value = Boolean(next.portable)
  selectedRecipe.value = next.page === 'seasonal' ? recipes.find((recipe) => recipe.id === next.recipe) || null : null
  selectedWeightLossMeal.value = next.page === 'weight-loss' ? weightLossMeals.find((meal) => meal.id === next.mealId) || null : null
  drawerVisible.value = Boolean(selectedRecipe.value)
  weightLossDrawerVisible.value = Boolean(selectedWeightLossMeal.value)
}

watch([page, season, region, energy, calorieBand, mealFilter, methodFilter, categoryFilter, prepTiming, portableOnly], () => syncUrl(selectedRecipe.value?.id || '', selectedWeightLossMeal.value?.id || ''))

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  window.addEventListener('popstate', onPopState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
  window.removeEventListener('popstate', onPopState)
})
</script>

<template>
  <div class="app-shell" :class="`season-${season}`">
    <a class="skip-link" :href="page === 'seasonal' ? '#recipe-library' : '#weight-loss-library'">跳转到食谱列表</a>

    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="返回应季食谱参考首页">
          <span class="brand-mark" aria-hidden="true">食</span>
          <span>
            <strong>应季食谱参考</strong>
            <small>成人肥胖食养指南 · 附录 3</small>
          </span>
        </a>
        <nav class="page-nav" aria-label="内容页面">
          <button class="page-nav-button" :class="{ active: page === 'seasonal' }" type="button" @click="setPage('seasonal')">应季食谱</button>
          <button class="page-nav-button" :class="{ active: page === 'weight-loss' }" type="button" @click="setPage('weight-loss')">减脂餐</button>
        </nav>
        <span class="header-note">轻量查阅工具 <i aria-hidden="true">·</i> 仅作一般参考</span>
      </div>
    </header>

    <main class="page-content">
      <template v-if="page === 'seasonal'">
      <section class="hero-section" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="kicker"><span aria-hidden="true">✳</span> 依时而食，知量而行</p>
          <h1 id="page-title">把今天的餐桌，<em>交给当季。</em></h1>
          <p class="hero-description">从指南附录的地区食谱示例中，找到适合当前季节的全天搭配。按地域与能量档筛选，打开详情查看每一餐的食材份量。</p>
        </div>
        <div class="hero-stamp" aria-label="内容来源提示">
          <span>GUIDE</span>
          <strong>2024</strong>
          <small>食养参考</small>
        </div>
      </section>

      <section class="season-section" aria-labelledby="season-title">
        <div class="section-heading-row">
          <div>
            <p class="section-eyebrow">季节入口</p>
            <h2 id="season-title">{{ season }}食谱参考</h2>
          </div>
          <p class="season-description">{{ currentMeta.description }}</p>
        </div>

        <div class="season-tabs" role="tablist" aria-label="选择季节">
          <button
            v-for="item in SEASONS"
            :key="item"
            class="season-tab"
            :class="{ active: season === item }"
            type="button"
            role="tab"
            :aria-selected="season === item"
            @click="setSeason(item)"
          >
            <span class="season-icon" aria-hidden="true">{{ seasonMeta[item].icon }}</span>
            <span><b>{{ item }}</b><small>{{ seasonMeta[item].eyebrow }}</small></span>
          </button>
        </div>
      </section>

      <section class="filter-bar" aria-label="筛选条件">
        <div class="filter-intro">
          <span class="filter-symbol" aria-hidden="true">⌕</span>
          <span><strong>组合筛选</strong><small>让结果更贴近你的日常</small></span>
        </div>
        <div class="filter-control">
          <label for="region-select">地域</label>
          <el-select id="region-select" v-model="region" aria-label="按地域筛选" placeholder="全部地域" size="large">
            <el-option label="全部地域" value="全部地域" />
            <el-option v-for="item in REGIONS" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <div class="filter-control">
          <label for="energy-select">能量档</label>
          <el-select id="energy-select" v-model="energy" aria-label="按能量档筛选" placeholder="全部能量" size="large">
            <el-option label="全部能量" value="全部能量" />
            <el-option v-for="item in ENERGY_OPTIONS" :key="item" :label="`${item} kcal`" :value="String(item)" />
          </el-select>
        </div>
        <el-button v-if="activeCount" class="clear-button" text type="primary" @click="clearFilters">清除筛选</el-button>
      </section>

      <section id="recipe-library" class="library-section" aria-labelledby="library-title">
        <div class="library-heading">
          <div>
            <p class="section-eyebrow">全天食谱</p>
            <h2 id="library-title">找到一份刚刚好的安排</h2>
          </div>
          <span class="result-count">共 {{ filteredRecipes.length }} 份参考</span>
        </div>

        <div v-if="filteredRecipes.length" class="recipe-grid">
          <article v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
            <div class="card-topline">
              <span class="region-label">{{ recipe.region }}</span>
              <el-tag class="energy-tag" effect="plain" round>{{ recipe.energyKcal }} kcal</el-tag>
            </div>
            <div class="card-title-row">
              <div>
                <p class="card-season">{{ recipe.season }} · 全天示例</p>
                <h3>{{ recipe.title }}</h3>
              </div>
              <span class="card-index" aria-hidden="true">{{ String(recipe.energyKcal).slice(0, 2) }}</span>
            </div>
            <div class="meal-preview-list">
              <div v-for="meal in mealMeta" :key="meal.key" class="meal-preview">
                <span class="meal-badge" aria-hidden="true">{{ meal.icon }}</span>
                <span><small>{{ meal.label }}</small><strong>{{ mealPreview(recipe, meal.key) }}</strong></span>
              </div>
            </div>
            <div class="card-footer">
              <div class="nutrition-inline" aria-label="主要营养素">
                <span><b>{{ formatNutrition(recipe.nutrition.protein) }}</b><small>蛋白质</small></span>
                <span><b>{{ formatNutrition(recipe.nutrition.carbohydrate) }}</b><small>碳水</small></span>
                <span><b>{{ formatNutrition(recipe.nutrition.fat) }}</b><small>脂肪</small></span>
              </div>
              <el-button class="detail-button" type="primary" @click="openRecipe(recipe)">查看详情 <span aria-hidden="true">↗</span></el-button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <span class="empty-icon" aria-hidden="true">⌁</span>
          <h3>这组条件暂时没有匹配的食谱</h3>
          <p>换一个地域或能量档，看看指南中的其他搭配。</p>
          <el-button type="primary" plain @click="clearFilters">清除筛选</el-button>
        </div>
      </section>

      <section class="reference-note" aria-label="使用提示">
        <div class="note-icon" aria-hidden="true">!</div>
        <div>
          <strong>健康参考提示</strong>
          <p>本页面整理自《成人肥胖食养指南（2024年版）》附录 3，仅用于成人肥胖人群的一般食养参考，不替代指南原文、医生诊断或个体化营养方案。孕妇、乳母、老年人、慢性病或并发症人群，请在医生或营养专业人员指导下使用。</p>
        </div>
      </section>
      </template>

      <template v-else>
        <section class="weight-loss-hero" aria-labelledby="weight-loss-title">
          <div class="hero-copy">
            <p class="kicker"><span aria-hidden="true">✳</span> 轻盈日常，吃得有滋味</p>
            <h1 id="weight-loss-title">把减脂餐，做成<em>可以坚持的日常。</em></h1>
            <p class="hero-description">从公开菜谱中整理出高蛋白、蔬菜充足的家常搭配。先看餐次和热量，再按手边食材做灵活替换。</p>
          </div>
          <div class="hero-stamp" aria-label="减脂餐内容提示">
            <span>LEAN</span>
            <strong>{{ weightLossMeals.length }}</strong>
            <small>份便当参考</small>
          </div>
        </section>

        <section class="weight-loss-intro" aria-labelledby="weight-loss-library-title">
          <div>
            <p class="section-eyebrow">减脂餐库</p>
            <h2 id="weight-loss-library-title">先选适合今天的那一餐</h2>
          </div>
          <p>重点收录沙拉、杂粮饭、全麦主食和冷面等适合带到单位的组合。菜谱热量优先沿用来源页标注，没有明确数值的条目使用常见份量估算。</p>
        </section>

        <section class="filter-bar weight-loss-filter-bar" aria-label="减脂餐筛选条件">
          <div class="filter-intro">
            <span class="filter-symbol" aria-hidden="true">⌕</span>
            <span><strong>按需筛选</strong><small>找到更容易坚持的组合</small></span>
          </div>
          <div class="filter-control">
            <label for="calorie-select">热量</label>
            <el-select id="calorie-select" v-model="calorieBand" aria-label="按热量筛选" size="large">
              <el-option v-for="item in CALORIE_BANDS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div class="filter-control">
            <label for="meal-select">餐次</label>
            <el-select id="meal-select" v-model="mealFilter" aria-label="按餐次筛选" size="large">
              <el-option label="全部餐次" value="全部餐次" />
              <el-option v-for="item in WEIGHT_LOSS_MEALS" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="filter-control">
            <label for="method-select">做法</label>
            <el-select id="method-select" v-model="methodFilter" aria-label="按做法筛选" size="large">
              <el-option label="全部方式" value="全部方式" />
              <el-option v-for="item in COOKING_METHODS" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="filter-control">
            <label for="category-select">类型</label>
            <el-select id="category-select" v-model="categoryFilter" aria-label="按菜谱类型筛选" size="large">
              <el-option label="全部类型" value="全部类型" />
              <el-option v-for="item in MEAL_CATEGORIES" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="filter-control">
            <label for="prep-select">准备</label>
            <el-select id="prep-select" v-model="prepTiming" aria-label="按准备方式筛选" size="large">
              <el-option v-for="item in PREP_TIMINGS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <el-checkbox v-model="portableOnly" class="portable-checkbox">只看便当友好</el-checkbox>
          <el-button v-if="weightLossActiveCount" class="clear-button" text type="primary" @click="clearWeightLossFilters">清除筛选</el-button>
        </section>

        <section id="weight-loss-library" class="library-section weight-loss-library" aria-labelledby="weight-loss-list-title">
          <div class="library-heading">
            <div>
              <p class="section-eyebrow">公开菜谱整理</p>
              <h2 id="weight-loss-list-title">轻盈、饱足、做法不复杂</h2>
            </div>
            <span class="result-count">共 {{ filteredWeightLossMeals.length }} 份参考</span>
          </div>

          <div v-if="filteredWeightLossMeals.length" class="weight-loss-grid">
            <article v-for="meal in filteredWeightLossMeals" :key="meal.id" class="weight-loss-card">
              <div class="card-topline">
                <span class="meal-type-label">{{ meal.meal }}</span>
                <el-tag class="energy-tag" effect="plain" round>约 {{ meal.calories }} kcal</el-tag>
              </div>
              <div class="weight-loss-card-heading">
                <p>{{ meal.category }} · {{ meal.method }} · {{ meal.prepTiming }}</p>
                <h3>{{ meal.title }}</h3>
              </div>
              <div class="tag-list">
                <el-tag v-for="tag in meal.tags" :key="tag" effect="plain" round>{{ tag }}</el-tag>
              </div>
              <p class="ingredient-preview"><strong>主要食材</strong>{{ meal.ingredients.slice(0, 3).join(' · ') }}</p>
              <div class="weight-loss-card-footer">
                <span>{{ meal.reheat }}</span>
                <el-button class="detail-button" type="primary" @click="openWeightLossMeal(meal)">查看做法 <span aria-hidden="true">↗</span></el-button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <span class="empty-icon" aria-hidden="true">⌁</span>
            <h3>这组条件暂时没有匹配的菜谱</h3>
            <p>换一个热量区间、餐次或做法，看看其他轻盈搭配。</p>
            <el-button type="primary" plain @click="clearWeightLossFilters">清除筛选</el-button>
          </div>
        </section>

        <section class="reference-note" aria-label="减脂餐使用提示">
          <div class="note-icon" aria-hidden="true">!</div>
          <div>
            <strong>减脂餐使用提示</strong>
            <p>减脂效果取决于全天总能量、蛋白质、蔬菜和活动量的整体平衡。带饭建议使用保冷袋或单位冰箱，饭菜放凉后再密封；页面热量不替代个体化营养计算。</p>
          </div>
        </section>
      </template>
    </main>

    <footer class="site-footer">
      <span>内容来源：成人肥胖食养指南（2024年版） · 附录 3 不同地区食谱示例</span>
      <span>食药物质以 <b>*</b> 标识，避免误解为药物处方</span>
    </footer>

    <el-drawer
      v-model="drawerVisible"
      class="recipe-drawer"
      :direction="drawerDirection"
      :size="drawerSize"
      :with-header="false"
      :destroy-on-close="false"
      @closed="closeRecipe"
    >
      <div v-if="selectedRecipe" class="drawer-content">
        <div class="drawer-topline">
          <el-tag class="energy-tag" effect="plain" round>{{ selectedRecipe.energyKcal }} kcal · {{ selectedRecipe.region }}</el-tag>
          <el-button class="drawer-close" text circle aria-label="关闭详情" @click="closeRecipe">×</el-button>
        </div>
        <p class="section-eyebrow">{{ selectedRecipe.season }} · 全天食谱示例</p>
        <h2>{{ selectedRecipe.title }}</h2>
        <p class="drawer-lede">按照指南的全天搭配示例，除括号内特殊标明外，食材份量均以可食部生重计算。</p>

        <div class="nutrition-panel" aria-label="营养数据">
          <div class="nutrition-total"><strong>{{ selectedRecipe.energyKcal }}</strong><span>kcal<br />全天总能量</span></div>
          <div v-for="item in [['protein', '蛋白质'], ['carbohydrate', '碳水化合物'], ['fat', '脂肪']]" :key="item[0]" class="nutrition-metric">
            <strong>{{ formatNutrition(selectedRecipe.nutrition[item[0]]) }}</strong>
            <span>{{ item[1] }}</span>
            <small>{{ selectedRecipe.nutrition.ratios[item[0]] || '—' }}% 供能比</small>
          </div>
        </div>

        <div class="drawer-meals">
          <section v-for="meal in mealMeta" :key="meal.key" class="drawer-meal-section">
            <div class="drawer-meal-heading"><span class="meal-badge" aria-hidden="true">{{ meal.icon }}</span><h3>{{ meal.label }}</h3></div>
            <ul>
              <li v-for="food in selectedRecipe.meals[meal.key]" :key="food.raw">
                <strong>{{ food.name.replaceAll('*', '') }}</strong>
                <span v-if="food.ingredients">{{ food.ingredients }}</span>
                <em v-if="food.raw.includes('*') || food.ingredients.includes('*')">食药物质</em>
              </li>
            </ul>
          </section>
        </div>

        <div class="drawer-source">
          <strong>原文标识</strong>
          <span>《成人肥胖食养指南（2024年版）》附录 3 · 第 {{ selectedRecipe.sourcePage || '—' }} 页起</span>
          <span v-if="selectedRecipe.foodMedicine.length">本食谱标记的食药物质：{{ selectedRecipe.foodMedicine.join('、') }}。相关内容仅作食材标识，不能视为药物处方。</span>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="weightLossDrawerVisible"
      class="recipe-drawer weight-loss-drawer"
      :direction="drawerDirection"
      :size="drawerSize"
      :with-header="false"
      :destroy-on-close="false"
      @closed="closeWeightLossMeal"
    >
      <div v-if="selectedWeightLossMeal" class="drawer-content">
        <div class="drawer-topline">
          <el-tag class="energy-tag" effect="plain" round>{{ selectedWeightLossMeal.meal }} · 约 {{ selectedWeightLossMeal.calories }} kcal</el-tag>
          <el-button class="drawer-close" text circle aria-label="关闭详情" @click="closeWeightLossMeal">×</el-button>
        </div>
        <p class="section-eyebrow">{{ selectedWeightLossMeal.category }} · {{ selectedWeightLossMeal.method }} · {{ selectedWeightLossMeal.prepTiming }}</p>
        <h2>{{ selectedWeightLossMeal.title }}</h2>
        <p class="drawer-lede">以下内容是对公开菜谱的简要整理，食材重量、用油和调味量会影响最终热量，请按自己的需要调整。</p>

        <div class="weight-loss-detail-summary">
          <div><strong>{{ selectedWeightLossMeal.calories }}</strong><span>kcal<br />单份参考</span></div>
          <div><strong>{{ selectedWeightLossMeal.meal }}</strong><span>适合餐次</span></div>
          <div><strong>{{ selectedWeightLossMeal.reheat }}</strong><span>携带方式</span></div>
        </div>

        <div class="weight-loss-detail-sections">
          <section class="weight-loss-detail-section">
            <div class="drawer-section-heading"><span class="meal-badge" aria-hidden="true">材</span><h3>食材清单</h3></div>
            <ul class="ingredient-list">
              <li v-for="ingredient in selectedWeightLossMeal.ingredients" :key="ingredient">{{ ingredient }}</li>
            </ul>
          </section>
          <section class="weight-loss-detail-section">
            <div class="drawer-section-heading"><span class="meal-badge" aria-hidden="true">做</span><h3>简要做法</h3></div>
            <ol class="step-list">
              <li v-for="(step, index) in selectedWeightLossMeal.steps" :key="step"><span>{{ index + 1 }}</span>{{ step }}</li>
            </ol>
          </section>
        </div>

        <div class="carry-tip"><strong>前置准备与携带</strong><span>{{ selectedWeightLossMeal.storageTip }}</span></div>

        <div class="drawer-source">
          <strong>菜谱来源</strong>
          <span>{{ selectedWeightLossMeal.sourceTitle }}</span>
          <span>{{ selectedWeightLossMeal.sourceNote }}</span>
          <a :href="selectedWeightLossMeal.sourceUrl" target="_blank" rel="noreferrer">查看公开来源页面 ↗</a>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
