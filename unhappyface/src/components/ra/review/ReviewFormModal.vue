<template>
  <el-dialog
    :model-value="show"
    :title="isEditMode ? '修改評論' : '撰寫評論'"
    width="500px"
    append-to-body
    @close="$emit('close')"
  >
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
import { ElMessage, ElUpload, ElProgress, ElButton, ElInput, ElDialog, ElIcon, ElRate } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ReviewTagSelector from './ReviewTagSelector.vue'
// import ScoreItem from './ScoreItem.vue'

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
  console.log('--- 執行 checkReview ---');
  console.log('當前 props:', props); // 檢查 orderItemId 和 userId 是否正確

  if (isChecking.value) {
    console.log('正在檢查中，跳過本次 checkReview 執行');
    return;
  }
  isChecking.value = true;
  console.log('isChecking 設置為 true');

  try {
    // 1. 檢查評論是否存在
    console.log(`準備檢查訂單項目 ${props.orderItemId} 是否存在評論 (userId: ${props.userId})`);
    const response = await axios.get(`/api/reviews/${props.orderItemId}/exists?userId=${props.userId}`);
    console.log('檢查評論存在性 API 回應:', response.data);

    if (response.data.data && response.data.data.exists) {
      console.log('評論已存在');
      isEditMode.value = true;
      const existingReviewId = response.data.data.reviewId;
      console.log('獲取的已存在評論 ID:', existingReviewId);


      // 2. 如果存在，獲取評論的詳細資料
      console.log(`準備獲取評論詳細資料 (reviewId: ${existingReviewId})`);
      const reviewResponse = await axios.get(`/api/reviews/${existingReviewId}`);
      const review = reviewResponse.data.data;
      console.log('獲取評論詳細資料 API 回應:', reviewResponse.data);
      console.log('後端返回的原始 review 物件:', review); 
      // 3. 將載入的評論資料賦值給 form
      console.log('後端返回的原始 tags:', review.tags); // 檢查原始 tags

      // 檢查 review 物件及其屬性是否存在，避免賦值時報錯
      if (review) {
          form.value = {
              qualityScore: review.scoreQuality || 0,
              descriptionScore: review.scoreDescription || 0,
              shippingScore: review.scoreDelivery || 0,
              tags: Array.isArray(review.tags) ? review.tags : [],
              reviewText: review.reviewText || '',
              images: review.reviewImages || [] // 注意這裡，如果 review.reviewImages 是圖片 URL 陣列，El-Upload 的 v-model 需要的是 File 或 FileList 格式，這裡可能需要轉換
          };
          reviewId.value = review.id; // 儲存評論 ID
          console.log('載入評論後，成功賦值給 form:', form.value); // 檢查 form 的最終內容
      } else {
          console.warn('獲取到評論存在，但詳細資料為空:', reviewResponse.data);
          // 如果詳細資料為空，可能需要重設表單或顯示錯誤
          // 這裡暫時不做任何賦值，保持原樣或重設
      }


    } else {
      // 如果不存在，重設 form 為預設空值 (新評論模式)
      console.log('評論不存在，進入新評論模式');
      isEditMode.value = false;
      form.value = {
        qualityScore: 0,
        descriptionScore: 0,
        shippingScore: 0,
        tags: [],
        reviewText: '',
        images: []
        };
        reviewId.value = null;
        console.log('新評論模式，form 已重設:', form.value);
    }

  } catch (error) { // 使用正確的 error 變數
    console.error('載入或檢查評論失敗:', error); // 使用正確的 error 變數
    ElMessage.error('無法載入評論資料');
  } finally {
    isChecking.value = false; // 檢查結束
    console.log('isChecking 設置為 false');
    }
}

const isChecking = ref(false) // 這個 ref 應該定義在 setup 頂部
watch(() => props.show, async (newVal) => {
 console.log('props.show 變化:', newVal); // 新增 log
 if (newVal) { // 只需要在 show 變為 true 時觸發載入
    // isChecking 的邏輯已經移到 checkReview 內部了
  await checkReview();
  } else {
    // Modal 關閉時，可以考慮清空 form 數據，以便下次打開是乾淨的狀態
    console.log('props.show 為 false，重設表單'); // 新增 log
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
  }
}, { immediate: true });


async function submitForm() {
  console.log('--- 執行 submitForm ---');
  console.log('提交前 form 的內容:', form.value);

  // 檢查評分
  if (averageScore.value === 0) {
    ElMessage.error('請至少評分一項');
    return;
  }
  // 檢查標籤數量
  if (form.value.tags.length > 3) {
    ElMessage.error('標籤不可超過 3 個');
    return;
  }

  submitting.value = true;
  uploadProgress.value = 0;
  console.log('submitting 設置為 true');

  try {
    let response;
    if (isEditMode.value) {
      const tagsInChineseLabels = Array.isArray(form.value.tags)
            ? form.value.tags.map(value => tagMap[value] || value) // 使用 tagMap 進行映射
            : [];
      console.log('提交 PUT 請求的中文標籤陣列:', tagsInChineseLabels);

      const payload = {
        qualityScore: form.value.qualityScore,
        descriptionScore: form.value.descriptionScore,
        shippingScore: form.value.shippingScore,
        reviewText: form.value.reviewText,
        tags: tagsInChineseLabels
      };
      console.log('PUT 請求 payload:', payload);

      response = await axios.put(`/api/reviews/${reviewId.value}?userId=${props.userId}`, payload);
      console.log('PUT 請求回應:', response.data);
  } else {
      // 新增模式
      const formData = new FormData();
      formData.append('scoreQuality', form.value.qualityScore.toString());
      formData.append('scoreDescription', form.value.descriptionScore.toString());
      formData.append('scoreDelivery', form.value.shippingScore.toString());
      formData.append('reviewText', form.value.reviewText);

      const tagsInChineseLabels = Array.isArray(form.value.tags)
            ? form.value.tags.map(value => tagMap[value] || value) // 使用 tagMap 進行映射
            : [];
      console.log('提交 POST 請求的中文標籤陣列 (JSON.stringify 前):', tagsInChineseLabels);
      formData.append('tags', JSON.stringify(tagsInChineseLabels));

      form.value.images.forEach((file) => {
        if (file.raw) {
          formData.append(`images`, file.raw);
        }
      });
      console.log('POST 請求 FormData:', Object.fromEntries(formData.entries())); // 查看 FormData 內容
      response = await axios.post(`/api/reviews/${props.orderItemId}?userId=${props.userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(progressEvent) {
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          } else {
              // 如果 total 無效，可以選擇將進度設為 0 或 100，或者隱藏進度條
              uploadProgress.value = 0;
          }
        }
      });
      console.log('POST 請求回應:', response.data);

    }
    ElMessage.success(isEditMode.value ? '評論已更新' : '評論已提交');
    emit('submitted', { orderItemId: props.orderItemId, reviewId: response.data.data?.id || reviewId.value });
    emit('close'); // 成功後關閉 Modal
  } catch (error) { // 使用正確的 error 變數
    console.error('提交失敗:', error); // 使用正確的 error 變數
    if (error.response && error.response.data) {
      console.error('伺服器返回的錯誤詳情:', error.response.data);
      if (typeof error.response.data.message === 'string') {
        ElMessage.error(`提交失敗：${error.response.data.message}`);
      } else if (typeof error.response.data === 'object') {
        ElMessage.error(`提交失敗：${JSON.stringify(error.response.data)}`);
      } else {
        ElMessage.error(`提交失敗：伺服器返回未知錯誤`);
      }
    } else {
      ElMessage.error(`提交失敗：${error.message || '伺服器錯誤'}`);
    }
  } finally {
    submitting.value = false;
    uploadProgress.value = 0;
    console.log('submitting 設置為 false');
  }
}
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
.score-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}
.score-item:last-child {
    margin-bottom: 0;
}
:global(div.el-dialog) {
    background-color: #fffaf4;
    color: #333;
    border-radius: 16px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    font-family: 'Noto Sans TC', sans-serif;
}
:global(div.el-dialog .el-dialog__header) {
    padding: 1.5rem 1rem -0rem 2.9rem;
    margin-right: 0;
}
:global(div.el-dialog .el-dialog__body) {
    padding: 0.3rem 2rem 0.8rem 2rem;
    line-height: 1.6;
}
:global(div.el-dialog .el-dialog__footer) {
    padding: 1rem 2rem 1.5rem 2rem;
    text-align: right;
    margin-top: 0;
}
:global(div.el-dialog .el-dialog__title) {
    font-size: 1.5rem;
    color: #5C4033;
    font-weight: bold;
}
:global(div.el-dialog .el-dialog__headerbtn) {
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1.5rem;
    color: #999;
    transition: color 0.2s;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
}
:global(div.el-dialog .el-dialog__headerbtn:hover) {
    color: #5C4033;
}
:global(div.el-dialog__body) {
    line-height: 1.2;
}
:global(div.el-dialog__body .el-input__wrapper),
:global(div.el-dialog__body .el-textarea__inner) {
    margin-bottom: 1rem;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #d2b48c;
    font-size: 1rem;
    background-color: #fff;
    box-shadow: none !important;
}
:global(div.el-dialog__body .el-input:last-of-type .el-input__wrapper),
:global(div.el-dialog__body .el-textarea:last-of-type .el-textarea__inner) {
    margin-bottom: 0;
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
    margin-left: 12px;
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