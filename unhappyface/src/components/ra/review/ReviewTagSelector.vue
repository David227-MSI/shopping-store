<template>
  <div class="tag-selector">
    <el-checkbox-group v-model="selectedTags" @change="updateTags">
      <el-checkbox
        v-for="tag in tagOptions"
        :key="tag.value"
        :value="tag.label"
        :disabled="selectedTags.length >= 3 && !selectedTags.includes(tag.label)"
      >
        {{ tag.label }}
      </el-checkbox>
    </el-checkbox-group>
    <small>最多選擇 3 個標籤</small>
    <small v-if="selectedTags.length >= 3" style="color: red;">已達標籤上限 (3 個)</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElCheckboxGroup, ElCheckbox } from 'element-plus'

const props = defineProps<{
  modelValue: string[]
}>()
const emit = defineEmits(['update:modelValue'])

const tagOptions = [
  { value: 'FAST', label: '出貨快' },
  { value: 'QUALITY', label: '品質好' },
  { value: 'VALUE', label: 'CP值高' },
  { value: 'PACKAGING', label: '包裝完整' },
  { value: 'MATCHING', label: '描述相符' },
  { value: 'REPURCHASE', label: '回購意願' },
  { value: 'SERVICE', label: '客服親切' }
]
const selectedTags = ref<string[]>(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  selectedTags.value = newVal
  console.log('標籤更新 (來自父組件):', newVal)
})

watch(() => selectedTags.value, (newVal) => {
  console.log('selectedTags 變化:', newVal)
})

function updateTags(tags: string[]) {
  if (tags.length > 3) {
    tags = tags.slice(0, 3)
  }
  selectedTags.value = tags
  emit('update:modelValue', tags)
  console.log('標籤選擇:', tags)
}
</script>

<style scoped>
.tag-selector {
  margin-bottom: 12px;
}
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.el-checkbox {
  margin-right: 12px;
}
small {
  display: block;
  color: #777;
  font-size: 0.75rem;
  margin-top: 4px;
}
</style>