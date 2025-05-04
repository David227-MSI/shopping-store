<template>
  <div v-if="show" class="overlay">
    <div class="modal">
      <h3>{{ isEditing ? '編輯我的評論' : '撰寫商品評論' }}</h3>

      <!-- ⭐ 評分 -->
      <div class="stars">
        <ScoreItem label="商品品質" v-model="form.scoreQuality" :disabled="isEditing" />
        <ScoreItem label="商品描述" v-model="form.scoreDescription" :disabled="isEditing" />
        <ScoreItem label="出貨速度" v-model="form.scoreDelivery" :disabled="isEditing" />
      </div>

      <!-- ⭐ 標籤 -->
      <div class="tag-section">
        <label>選擇標籤</label>
        <ReviewTagSelector v-model="form.tags" />
      </div>

      <!-- ⭐ 評論文字 -->
      <textarea v-model="form.reviewText" rows="4" placeholder="填寫評論 (最多 1000 字)"></textarea>

      <!-- ⭐ 上傳圖片 (最多 3) -->
      <div class="upload-area" v-if="!isEditing">
        <input type="file" multiple accept="image/*" @change="handleFiles" :disabled="images.length>=3" />
        <small>最多 3 張，單張 ≤ 3 MB</small>

        <div class="thumbs">
          <div v-for="(img,i) in images" :key="img.url" class="thumb">
            <img :src="img.url" />
            <button @click="removeImg(i)">×</button>
          </div>
        </div>
      </div>
      <div class="existing-images" v-else>
        <div v-for="(url,i) in form.images" :key="url" class="thumb">
          <img :src="url" />
        </div>
      </div>

      <!-- ⭐ 進度條 -->
      <el-progress v-if="submitting" :percentage="uploadProgress" status="success" style="margin-top: 12px;" />

      <!-- ⭐ Buttons -->
      <div class="actions">
        <button @click="submit" :disabled="submitting">{{ isEditing ? '儲存變更' : '送出評論' }}</button>
        <button class="cancel" @click="$emit('close')" :disabled="submitting">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { ElProgress } from 'element-plus'
import ReviewTagSelector from './ReviewTagSelector.vue'
import ScoreItem from './ScoreItem.vue'

/* ===== Props / Emit ===== */
const props = defineProps<{
  show: boolean
  orderItemId: number
  userId: number
}>()
const emit = defineEmits(['close', 'submitted'])

/* ===== 表單 Model ===== */
const form = reactive({
  scoreQuality: 5,
  scoreDescription: 5,
  scoreDelivery: 5,
  reviewText: '',
  tags: [] as string[], // 確保初始化為空陣列
  images: [] as string[] // 儲存現有圖片 URL
})
const images = ref<{ file: File, url: string }[]>([]) // 新增圖片
const submitting = ref(false)
const isEditing = ref(false)
const reviewId = ref<number | null>(null)
const uploadProgress = ref(0) // 進度條百分比

/* ===== 標籤映射 ===== */
const TAG_MAP = {
  FAST: '出貨快', QUALITY: '品質好', VALUE: 'CP值高',
  PACKAGING: '包裝完整', MATCHING: '描述相符',
  REPURCHASE: '回購意願', SERVICE: '客服親切'
}

/* ===== 檢查現有評論 ===== */
async function fetchReview() {
  try {
    const response = await axios.get(`/api/reviews/${props.orderItemId}/exists?userId=${props.userId}`)
    console.log(`檢查評論是否存在 (orderItemId=${props.orderItemId}):`, response.data)
    if (response.data.data.exists) {
      isEditing.value = true
      reviewId.value = response.data.data.reviewId
      // 獲取評論詳情
      const detail = await axios.get(`/api/reviews/${reviewId.value}`)
      console.log(`獲取評論詳情 (reviewId=${reviewId.value}):`, detail.data)
      const review = detail.data.data
      form.scoreQuality = review.scoreQuality
      form.scoreDescription = review.scoreDescription
      form.scoreDelivery = review.scoreDelivery
      form.reviewText = review.reviewText || ''
      form.tags = review.tags ? review.tags.map((tag: string) => TAG_MAP[tag] || tag) : []
      form.images = review.reviewImages || []
      console.log(`載入表單:`, { ...form })
    } else {
      isEditing.value = false
      reviewId.value = null
      resetForm()
    }
  } catch (e) {
    console.error('獲取評論失敗:', e)
    isEditing.value = false
    resetForm()
    Swal.fire('載入失敗', '無法載入評論，請稍後重試', 'error')
  }
}

/* ===== 重置表單 ===== */
function resetForm() {
  form.scoreQuality = 5
  form.scoreDescription = 5
  form.scoreDelivery = 5
  form.reviewText = ''
  form.tags = []
  form.images = []
  images.value = []
  uploadProgress.value = 0
  console.log('表單已重置')
}

/* ===== 監聽 show 變化 ===== */
watch(() => props.show, (newVal) => {
  if (newVal) {
    console.log('模態框顯示，載入評論')
    fetchReview()
  }
})

/* ===== 監聽標籤變化 ===== */
watch(() => form.tags, (newTags) => {
  console.log('標籤已變更:', newTags)
})

/* ===== 處理圖片選擇 ===== */
function handleFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  for (const f of files) {
    if (images.value.length >= 3) break
    if (f.size > 3 * 1024 * 1024) {
      Swal.fire('檔案過大', '單張需 ≤ 3 MB', 'error')
      continue
    }
    const url = URL.createObjectURL(f)
    images.value.push({ file: f, url })
  }
  (e.target as HTMLInputElement).value = ''
}

/* ===== 移除圖片 ===== */
function removeImg(i: number) {
  URL.revokeObjectURL(images.value[i].url)
  images.value.splice(i, 1)
}

/* ===== 送出表單 ===== */
async function submit() {
  if (form.tags.length === 0) {
    Swal.fire('請至少選 1 個標籤', '', 'warning')
    return
  }
  if (submitting.value) return
  submitting.value = true
  uploadProgress.value = 0

  try {
    if (isEditing.value) {
      // 編輯模式：更新 reviewText 和 tags
      console.log('提交編輯:', { reviewText: form.reviewText, tags: form.tags })
      const response = await axios.put(`/api/reviews/${reviewId.value}`, {
        reviewText: form.reviewText,
        tags: form.tags // 發送中文標籤
      }, {
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`編輯上傳進度：${uploadProgress.value}%`)
        }
      })
      console.log('編輯響應:', response.data)
      Swal.fire('已更新！', '您的評論已儲存', 'success')
    } else {
      // 新增模式
      const formData = new FormData()
      formData.append('userId', String(props.userId))
      formData.append('orderItemId', String(props.orderItemId))
      formData.append('reviewText', form.reviewText)
      formData.append('scoreQuality', String(form.scoreQuality))
      formData.append('scoreDescription', String(form.scoreDescription))
      formData.append('scoreDelivery', String(form.scoreDelivery))
      formData.append('tags', JSON.stringify(form.tags)) // 發送中文標籤

      images.value.forEach((img, index) => {
        formData.append('images', img.file)
        console.log(`附加圖片 ${index}:`, img.file.name, img.file.size)
      })

      for (const [key, value] of formData.entries()) {
        console.log(`FormData: ${key}=${value}`)
      }

      const response = await axios.post(`/api/reviews/${props.orderItemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`新增上傳進度：${uploadProgress.value}%`)
        }
      })
      console.log('新增響應:', response.data)
      Swal.fire('已送出！', '感謝您的評論', 'success')
    }
    emit('submitted')
    emit('close')
  } catch (e: any) {
    console.error('送出錯誤:', e)
    console.error('錯誤詳情:', e.response?.data, e.response?.status)
    Swal.fire('操作失敗', e.response?.data?.message || '請稍後再試', 'error')
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 480px;
  max-width: 92vw;
  max-height: 90vh;
  overflow-y: auto
}
h3 {
  margin-top: 0;
  text-align: center
}
.stars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px
}
.tag-section {
  margin-bottom: 12px;
}
.tag-section label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #333;
}
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin: 8px 0 12px
}
.upload-area small, .existing-images small {
  color: #777;
  font-size: .75rem
}
.thumbs, .existing-images {
  display: flex;
  gap: 8px;
  margin-top: 6px
}
.thumb {
  position: relative
}
.thumb img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 6px
}
.thumb button {
  position: absolute;
  top: -6px;
  right: -6px;
  border: none;
  background: #000a;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: .75rem;
  cursor: pointer
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px
}
.actions button {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer
}
.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed
}
.actions .cancel {
  background: #eee;
  color: #555
}
.actions button:not(.cancel) {
  background: var(--primary, #5C4033);
  color: #fff
}
.actions button:not(:disabled):hover {
  opacity: .9
}
</style>