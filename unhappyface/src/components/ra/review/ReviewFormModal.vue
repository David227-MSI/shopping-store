<template>
  <el-dialog
    :model-value="show"
    title="撰寫評論"
    width="500px"
    append-to-body
    @close="$emit('close')"
  >
    <div class="review-form">
      <div class="score-section">
        <p>商品品質</p>
        <ScoreItem v-model="form.qualityScore" />
        <p>描述相符</p>
        <ScoreItem v-model="form.descriptionScore" />
        <p>出貨速度</p>
        <ScoreItem v-model="form.shippingScore" />
      </div>
      <div class="tags-section">
        <p>標籤（最多 3 個）</p>
        <ReviewTagSelector v-model="form.tags" />
      </div>
      <div class="comment-section">
        <p>評論（最多 1000 字）</p>
        <el-input
          v-model="form.reviewText"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
        />
      </div>
      <div v-if="!isEditMode" class="upload-section">
        <p>上傳圖片（最多 3 張，每張 ≤ 3MB）</p>
        <el-upload
          v-model:file-list="form.images"
          action=""
          multiple
          :limit="3"
          :auto-upload="false"
          accept="image/jpeg,image/png"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
        >
          <el-button type="primary">選擇圖片</el-button>
        </el-upload>
      </div>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-section">
        <el-progress :percentage="uploadProgress" />
      </div>
      <div class="actions">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" :disabled="submitting" @click="submitForm">
          {{ submitting ? '提交中...' : '提交' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import ReviewTagSelector from './ReviewTagSelector.vue'
import ScoreItem from './ScoreItem.vue'

const props = defineProps({
  show: Boolean,
  orderItemId: Number,
  userId: Number
})

const emit = defineEmits(['close', 'submitted'])

const form = ref({
  qualityScore: 0,
  descriptionScore: 0,
  shippingScore: 0,
  tags: [],
  reviewText: '',
  images: []
})

const isEditMode = ref(false)
const reviewId = ref(null)
const submitting = ref(false)
const uploadProgress = ref(0)

// 可用標籤，用於驗證和映射
const tagMap = {
  'FAST': '出貨快',
  'QUALITY': '品質好',
  'VALUE': 'CP值高',
  'PACKAGING': '包裝完整',
  'MATCHING': '描述相符',
  'REPURCHASE': '回購意願',
  'SERVICE': '客服親切'
}
const availableTagLabels = Object.values(tagMap)

const averageScore = computed(() => {
  const { qualityScore, descriptionScore, shippingScore } = form.value
  const total = qualityScore + descriptionScore + shippingScore
  return total ? (total / 3).toFixed(1) : 0
})

// 檢查檔案大小（≤ 3MB）和空檔案
function beforeUpload(file) {
  if (file.size === 0) {
    ElMessage.error('不能上傳空檔案')
    return false
  }
  const isLt3MB = file.size / 1024 / 1024 < 3
  if (!isLt3MB) {
    ElMessage.error('圖片大小不得超過 3MB')
  }
  return isLt3MB
}

// 處理圖片上傳超限
function handleExceed(files, fileList) {
  ElMessage.error('最多只能上傳 3 張圖片')
}

// 檢查是否已有評論
async function checkReview() {
  try {
    const response = await axios.get(`/api/reviews/${props.orderItemId}/exists?userId=${props.userId}`)
    if (response.data.data.exists) {
      isEditMode.value = true
      const reviewResponse = await axios.get(`/api/reviews/${response.data.data.reviewId}`)
      const review = reviewResponse.data.data
      // 記錄原始 tags 以診斷
      console.log('後端返回的原始 tags:', review.tags)
      // 將英文 value 映射為中文 label
      const mappedTags = Array.isArray(review.tags)
        ? review.tags.map(tag => tagMap[tag] || tag).filter(tag => availableTagLabels.includes(tag))
        : []
      form.value = {
        qualityScore: review.scoreQuality || 0,
        descriptionScore: review.scoreDescription || 0,
        shippingScore: review.scoreDelivery || 0,
        tags: mappedTags,
        reviewText: review.reviewText || '',
        images: review.reviewImages || []
      }
      reviewId.value = review.id
      console.log('載入評論:', form.value)
    } else {
      isEditMode.value = false
      form.value = {
        qualityScore: 0,
        descriptionScore: 0,
        shippingScore: 0,
        tags: [],
        reviewText: '',
        images: []
      }
      reviewId.value = null
    }
  } catch (e) {
    console.error('載入評論失敗:', e)
    ElMessage.error('無法載入評論資料')
  }
}

// 提交表單
async function submitForm() {
  if (averageScore.value === 0) {
    ElMessage.error('請至少評分一項')
    return
  }
  if (form.value.tags.length > 3) {
    ElMessage.error('標籤不可超過 3 個')
    return
  }
  submitting.value = true
  uploadProgress.value = 0

  try {
    let response
    if (isEditMode.value) {
      const payload = {
        reviewText: form.value.reviewText,
        tags: form.value.tags
      }
      console.log('PUT 請求 payload:', payload)
      response = await axios.put(`/api/reviews/${reviewId.value}?userId=${props.userId}`, payload)
    } else {
      const formData = new FormData()
      formData.append('scoreQuality', form.value.qualityScore.toString())
      formData.append('scoreDescription', form.value.descriptionScore.toString())
      formData.append('scoreDelivery', form.value.shippingScore.toString())
      formData.append('reviewText', form.value.reviewText)
      formData.append('tags', JSON.stringify(form.value.tags))
      form.value.images.forEach((file, index) => {
        if (file.raw) {
          formData.append(`images`, file.raw)
        }
      })
      console.log('FormData:', Object.fromEntries(formData))
      response = await axios.post(`/api/reviews/${props.orderItemId}?userId=${props.userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(progressEvent) {
          if (progressEvent.total && progressEvent.total > 0) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`上傳進度：${uploadProgress.value}%`)
          } else {
            uploadProgress.value = 0
            console.log('無法計算上傳進度：total 無效')
          }
        }
      })
    }
    ElMessage.success(isEditMode.value ? '評論已更新' : '評論已提交')
    emit('submitted', { orderItemId: props.orderItemId, reviewId: response.data.data?.id || reviewId.value })
    emit('close')
  } catch (e) {
    console.error('提交失敗:', e)
    ElMessage.error(`提交失敗：${e.response?.data?.message || '伺服器錯誤'}`)
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}

// 當 show 變化時載入評論，防止重複請求
const isChecking = ref(false)
watch(() => props.show, async (newVal) => {
  if (newVal && !isChecking.value) {
    isChecking.value = true
    try {
      await checkReview()
    } finally {
      isChecking.value = false
    }
  }
})
</script>

<style scoped>
.review-form {
  padding: 16px;
}
.score-section, .tags-section, .comment-section, .upload-section, .progress-section {
  margin-bottom: 16px;
}
.actions {
  text-align: right;
}
</style>