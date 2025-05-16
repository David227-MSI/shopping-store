<template>
  <el-dialog :model-value="show" :title="isEditMode ? '修改評論' : '撰寫評論'" width="500px" :append-to-body="false"
    @close="$emit('close')">
    <div class="review-form">
      <div class="score-section">
        <div class="score-item">
          <p>商品品質</p>
          <el-rate v-model="form.qualityScore" :max="5" />
        </div>
        <div class="score-item">
          <p>描述相符</p>
          <el-rate v-model="form.descriptionScore" :max="5" />
        </div>
        <div class="score-item">
          <p>出貨速度</p>
          <el-rate v-model="form.shippingScore" :max="5" />
        </div>
      </div>
      <div class="tags-section">
        <p>標籤（最多 3 個）</p>
        <ReviewTagSelector v-model="form.tags" />
      </div>
      <div class="comment-section">
        <p>評論（最多 1000 字）</p>
        <el-input v-model="form.reviewText" type="textarea" :rows="4" maxlength="1000" show-word-limit />
      </div>
      <div v-if="!isEditMode" class="upload-section">
        <p>上傳圖片（最多 3 張，每張 ≤ 3MB）</p>
        <el-upload v-model:file-list="form.images" action="" multiple :limit="3" :auto-upload="false"
          accept="image/jpeg,image/png" :before-upload="beforeUpload" :on-exceed="handleExceed" :show-file-list="true">
          <el-button type="primary">選擇圖片</el-button>
        </el-upload>
      </div>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-section">
        <el-progress :percentage="uploadProgress" />
      </div>
      <div v-if="isEditMode" class="edit-warning-message">
          <p>評價僅只能編輯一次，送出後將無法再次編輯內容。</p>
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
import { ElMessage, ElUpload, ElProgress, ElButton, ElInput, ElDialog, ElIcon, ElRate } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ReviewTagSelector from '@/components/ra/review/ReviewTagSelector.vue'


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

const tagMap = {
  'FAST': '出貨快',
  'QUALITY': '品質好',
  'VALUE': 'CP值高',
  'PACKAGING': '包裝完整',
  'MATCHING': '描述相符',
  'REPURCHASE': '回購意願',
  'SERVICE': '客服親切'
}

const averageScore = computed(() => {
  const { qualityScore, descriptionScore, shippingScore } = form.value
  const total = qualityScore + descriptionScore + shippingScore
  return total > 0 ? (total / 3).toFixed(1) : 0
})

function beforeUpload(file) {
  if (file.size === 0) {
    ElMessage.error('不能上傳空檔案')
    return false
  }
  const isLt3MB = file.size / 1024 / 1024 < 3
  if (!isLt3MB) {
    ElMessage.error('圖片大小不得超過 3MB')
  }
  const allowedTypes = ['image/jpeg', 'image/png'];
  const isAllowedType = allowedTypes.includes(file.type);
  if (!isAllowedType) {
    ElMessage.error('圖片只能是 JPG 或 PNG 格式');
  }
  return isLt3MB && isAllowedType;
}

function handleExceed(files, fileList) {
  ElMessage.error('最多只能上傳 3 張圖片')
}

const isChecking = ref(false)

async function checkReview() {
  console.log('--- 執行 checkReview ---');
  console.log('當前 props:', props);

  if (isChecking.value || !props.show || !props.orderItemId || !props.userId) {
    console.log(`checkReview 跳過執行: isChecking=${isChecking.value}, show=${props.show}, orderItemId=${props.orderItemId}, userId=${props.userId}`);
    if (!props.show || !props.orderItemId || !props.userId) {
      resetForm();
    }
    return;
  }
  isChecking.value = true;
  console.log('isChecking 設置為 true');

  try {
    console.log(`準備檢查訂單項目 ${props.orderItemId} 是否存在評論 (userId: ${props.userId})`);
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/reviews/${props.orderItemId}/exists?userId=${props.userId}`);
    console.log('檢查評論存在性 API 回應:', response.data);

    if (response.data.data && response.data.data.exists) {
      console.log('評論已存在');
      isEditMode.value = true;
      const existingReviewId = response.data.data.reviewId;
      console.log('獲取的已存在評論 ID:', existingReviewId);
      reviewId.value = existingReviewId;

      console.log(`準備獲取評論詳細資料 (reviewId: ${existingReviewId})`);
      const reviewResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/reviews/${existingReviewId}?userId=${props.userId}`);
      const review = reviewResponse.data.data;
      console.log('獲取評論詳細資料 API 回應:', reviewResponse.data);
      console.log('後端返回的原始 review 物件:', review);

      if (review) {
        form.value = {
          qualityScore: review.scoreQuality || 0,
          descriptionScore: review.scoreDescription || 0,
          shippingScore: review.scoreDelivery || 0,
          tags: Array.isArray(review.tags) ? review.tags.map(label => {
            const foundKey = Object.keys(tagMap).find(key => tagMap[key] === label);
            return foundKey || label;
          }).filter(tag => Object.keys(tagMap).includes(tag))
            : [],
          reviewText: review.reviewText || '',

          images: Array.isArray(review.reviewImages) ? review.reviewImages.map((url, index) => ({
            name: `existing-image-${index + 1}`,
            url: url,
            status: 'success',
            uid: Date.now() + index
          })) : []
        };
        console.log('載入評論後，成功賦值給 form:', form.value);
        console.log('form.value.images 內容:', form.value.images);

      } else {
        console.warn('獲取到評論存在，但詳細資料為空:', reviewResponse.data);
        console.log('詳細資料為空，重設表單為新評論模式');
        resetForm();
      }
    } else {
      console.log('評論不存在，進入新評論模式');
      resetForm();
    }

  } catch (error) {
    console.error('載入或檢查評論失敗:', error);
    if (error.response && error.response.status === 404) {
      console.log('收到 404 錯誤，評論不存在，進入新評論模式');
      resetForm();
    } else {
      ElMessage.error('無法載入評論資料');
      resetForm();
    }
  } finally {
    isChecking.value = false;
    console.log('isChecking 設置為 false');
  }
}

function resetForm() {
  form.value = {
    qualityScore: 0,
    descriptionScore: 0,
    shippingScore: 0,
    tags: [],
    reviewText: '',
    images: []
  };
  reviewId.value = null;
  isEditMode.value = false;
  uploadProgress.value = 0;
  console.log('表單已重設:', form.value);
}

watch(
  () => [props.show, props.orderItemId, props.userId],
  ([newShow, newOrderId, newUserId], oldValues) => {
    const [oldShow, oldOrderId, oldUserId] = oldValues || [undefined, undefined, undefined];

    console.log('props 變化觸發 watch:', { newShow, newOrderId, newUserId, oldValues });
    console.log('解構後的舊值:', { oldShow, oldOrderId, oldUserId });

    if (newShow && newOrderId && newUserId) {
      if (newOrderId !== oldOrderId || newUserId !== oldUserId || (!oldShow && newShow)) {
        console.log('props 變更或 modal 顯示，觸發 checkReview');
        checkReview();
      } else {
        console.log('props 未變更或 modal 已顯示，不重複觸發 checkReview');
      }
    } else if (!newShow) {
      console.log('Modal 關閉，重設表單');
      resetForm();
    }
  },
  { immediate: true }
);


async function submitForm() {
  console.log('--- 執行 submitForm ---');
  console.log('提交前 form 的內容:', form.value);

  if (averageScore.value === 0 && form.value.reviewText.trim() === '') {
    ElMessage.error('請至少評分一項或填寫評論內容');
    return;
  }
  if (form.value.tags.length > 3) {
    ElMessage.error('標籤不可超過 3 個');
    return;
  }

  submitting.value = true;
  uploadProgress.value = 0;
  console.log('submitting 設置為 true');

  try {
    let response;
    const tagsInChineseLabels = Array.isArray(form.value.tags)
      ? form.value.tags.map(value => tagMap[value] || value)
      : [];
    console.log('提交的中文標籤陣列:', tagsInChineseLabels);

    if (isEditMode.value) {
      console.log(`提交修改評論 (reviewId: ${reviewId.value})`);
      const payload = {
        qualityScore: form.value.qualityScore,
        descriptionScore: form.value.descriptionScore,
        shippingScore: form.value.shippingScore,
        reviewText: form.value.reviewText,
        tags: tagsInChineseLabels
      };
      console.log('PUT 請求 payload:', payload);

      response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/reviews/${reviewId.value}?userId=${props.userId}`, payload);
      console.log('PUT 請求回應:', response.data);

    } else { // 新增評論
      console.log(`提交新增評論 (orderItemId: ${props.orderItemId})`);
      const formData = new FormData();

      formData.append('userId', props.userId);
      formData.append('orderItemId', props.orderItemId);

      formData.append('scoreQuality', (form.value.qualityScore ?? 0).toString());
      formData.append('scoreDescription', (form.value.descriptionScore ?? 0).toString());
      formData.append('scoreDelivery', (form.value.shippingScore ?? 0).toString());

      formData.append('reviewText', form.value.reviewText);

      form.value.images.forEach((file) => {
        if (file.raw) {
          formData.append(`images`, file.raw);
        }
      });

      formData.append('tags', JSON.stringify(tagsInChineseLabels));
      
      response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(progressEvent) {
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          } else {
            uploadProgress.value = 0;
          }
        }
      });
      console.log('POST 請求回應:', response.data);
      reviewId.value = response.data.data?.id;

    }
    ElMessage.success(isEditMode.value ? '評論已更新' : '評論已提交');
    emit('submitted', { orderItemId: props.orderItemId, reviewId: reviewId.value });
    emit('close');

  } catch (error) {
    console.error('提交失敗:', error);
    if (error.response && error.response.data) {
      console.error('伺服器返回的錯誤詳情:', error.response.data);
      const errorMessage = error.response.data.message || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      ElMessage.error(`提交失敗：${errorMessage}`);
    } else {
      ElMessage.error(`提交失敗：${error.message || '伺服器錯誤'}`);
    }
  } finally {
    submitting.value = false;
    console.log('submitting 設置為 false');
  }
}

</script>

<style scoped>
.review-entry {
  display: inline-block;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary, #5C4033);
  color: #fff;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

.review-form {
  padding: 0 16px 16px;
}

.score-section {
  margin-bottom: 20px;
  text-align: center;
}

.score-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 10px 8px;
}

.score-item:last-child {
  margin-bottom: 0;
}

.tags-section,
.comment-section,
.upload-section {
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

:global(div.el-dialog) {
  background-color: #fffaf4;
  color: #333;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  display: block;
  --el-text-color-primary: #5C4033 !important;
  --el-dialog-title-font-size: 1.7rem !important;
  --el-dialog-width: 500px !important;
  --el-dialog-padding-primary: 1.5rem 2rem !important;
}

:global(div.el-dialog .el-dialog__header) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem 0.5rem 2rem;
  margin-right: 0;
  border-bottom: 1px solid #eee;
  position: relative;
}

:global(div.el-dialog__title) {
  font-weight: bold;
  flex-grow: 1;
  text-align: center !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  font-family: 'Noto Sans TC', sans-serif !important;
}

:global(div.el-dialog__headerbtn) {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #999;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
}

:global(div.el-dialog__headerbtn:hover) {
  color: #5C4033;
}

:global(div.el-dialog__body) {
  padding: 1.5rem 2rem;
  line-height: 1.6;
  width: 100%;
  box-sizing: border-box;
}

:global(div.el-dialog__body .el-input__wrapper),
:global(div.el-dialog__body .el-textarea__inner) {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d2b48c;
  font-size: 1rem;
  background-color: #fff;
  box-shadow: none !important;
  width: 100%;
  box-sizing: border-box;
}

:global(div.comment-section .el-textarea) {
  margin-top: 8px;
}

:global(div.review-form .actions button.el-button) {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

:global(div.review-form .actions button.el-button:not(.el-button--primary):first-child) {
  background-color: #ddd !important;
  color: #333 !important;
}

:global(div.review-form .actions button.el-button--primary) {
  background-color: #5C4033;
  color: #fff;
}

:global(div.review-form .actions button.el-button--primary:hover) {
  background-color: #40291d;
}

:global(div.el-dialog .el-rate__item) {
  padding: 0 3px;
}
</style>