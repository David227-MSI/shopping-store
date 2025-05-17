<template>
  <div class="tag-selector">
    <el-checkbox-group v-model="selectedTags"   :max="3">
      <el-checkbox
        v-for="tag in availableTags"
        :key="tag.value"
        :label="tag.label"
        :value="tag.value"  />
    </el-checkbox-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const availableTags = [
  { value: 'FAST', label: '出貨快' },
  { value: 'QUALITY', label: '品質好' },
  { value: 'VALUE', label: 'CP值高' },
  { value: 'PACKAGING', label: '包裝完整' },
  { value: 'MATCHING', label: '描述相符' },
  { value: 'REPURCHASE', label: '回購意願' },
  { value: 'SERVICE', label: '客服親切' }
]

const selectedTags = ref([...props.modelValue])

watch(selectedTags, (newTags) => {
  emit('update:modelValue', [...newTags])
}, { deep: true })

watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(selectedTags.value)) {
    selectedTags.value = [...newValue]
  }
}, { deep: true })
</script>

<style scoped>
.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>