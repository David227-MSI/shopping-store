<!-- <template>
    <label class="score-row">
      {{ label }}
      <select v-model.number="localValue">
        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  /* ---- 雙向綁定 props ---- */
  const props = defineProps<{
    label: string
    modelValue: number         // 父層 v-model 傳入
  }>()
  const emit  = defineEmits(['update:modelValue'])
  
  /* ---- 建立中繼 computed ---- */
  const localValue = computed({
    get: () => props.modelValue,
    set: (val: number) => emit('update:modelValue', val)
  })
  </script>
  
  <style scoped>
  .score-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:6px;
  }
  select{
    padding:4px 8px;
    border:1px solid #ccc;
    border-radius:4px;
  }
  </style>
   -->