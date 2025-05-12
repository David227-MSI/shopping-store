<template>
    <div class="score-summary">
      <!-- 平均分數（置中＋大字） -->
      <p class="overall">{{ overall.toFixed(1) }}</p>
  
      <!-- 三列：標籤 ▸ 漸層條 ▸ 分數 -->
      <div v-for="s in rows" :key="s.key" class="row">
        <span class="label">{{ s.label }}</span>
        <div class="bar">
          <div class="fill" :style="{ width: (s.avg/5*100)+'%' }"></div>
        </div>
        <span class="num">{{ s.avg.toFixed(1) }}</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    quality: number
    description: number
    delivery: number
  }>()
  
  const rows = computed(() => ([
    { key:'quality',     label:'商品品質', avg: props.quality },
    { key:'description', label:'商品描述', avg: props.description },
    { key:'delivery',    label:'出貨速度', avg: props.delivery }
  ]))
  const overall = computed(() =>
    (props.quality + props.description + props.delivery) / 3
  )
  </script>
  
  <style scoped>
  .score-summary{border:1px solid #ddd;padding:14px 18px;border-radius:10px;margin-bottom:20px;background:#fff}
  .overall{font-size:2.5rem;font-weight:bold;text-align:center;color:var(--primary,#5C4033);margin:4px 0 10px}
  .row{display:flex;align-items:center;gap:10px;margin:6px 0}
  .label{width:86px;font-size:.9rem;color:#555}
  .bar{flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden}
  .fill{height:100%;background:linear-gradient(90deg,#cc956b,#5C4033)}
  .num{width:42px;text-align:right;font-weight:600}
  </style>
  