<template>
  <div class="overlay" @click.self="close">
    <div class="dialog">
      <h2 class="title">選擇優惠券</h2>

      <label class="coupon-item">
        <input
            type="radio"
            name="coupon"
            :value="null"
            v-model="tempSelectedId"
        />
        <div class="content">
          <p class="discount">不使用優惠券</p>
        </div>
      </label>

      <div v-if="couponList.length > 0" class="coupon-list">
        <label
            v-for="coupon in couponList"
            :key="coupon.id"
            class="coupon-item"
        >
          <input
              type="radio"
              name="coupon"
              :value="coupon.id"
              v-model="tempSelectedId"
          />
          <div class="content">
            <p class="discount">
              {{ coupon.discountType === 'VALUE'
                ? `折抵 $${coupon.discountValue}`
                : `${coupon.discountValue}% 折扣（最多折 $${coupon.maxDiscount ?? '無'})` }}
            </p>
            <p class="scope">
              適用範圍：{{ formatScope(coupon.applicableType, coupon.applicableId) }}
            </p>
            <p class="min-spend" v-if="coupon.minSpend > 0">
              最低消費：滿 ${{ coupon.minSpend }} 元可使用
            </p>
            <p class="date">
              有效期間：{{ formatDate(coupon.startTime) }} ～ {{ formatDate(coupon.endTime) }}
            </p>
          </div>
        </label>
      </div>
      <div v-else>
        <p>目前無可用優惠券</p>
      </div>

      <div class="actions">
        <button
            class="confirm-btn"
            @click="confirm"
        >
          確認使用
        </button>
        <button class="cancel-btn" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const formatScope = (type, id) => {
  if (type === 'ALL') return '全站商品';
  if (type === 'BRAND') return `品牌（ID：${id}）`;
  if (type === 'CATEGORY') return `分類（ID：${id}）`;
  if (type === 'PRODUCT') return `指定商品（ID：${id}）`;
  return '未知';
};

const props = defineProps({
  couponList: Array,
  selectedId: Number,
});
const emits = defineEmits(['close', 'confirm']);

const tempSelectedId = ref(props.selectedId);

watch(
    () => props.selectedId,
    (val) => {
      tempSelectedId.value = val;
    }
);

const confirm = () => {
  console.log('確認送出的優惠券 ID：', tempSelectedId.value);
  emits('confirm', tempSelectedId.value);
};

const close = () => {
  emits('close');
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};
</script>

<style scoped>

.scope {
  font-size: 14px;
  color: #5a4632;
  margin-top: 4px;
}
.min-spend {
  font-size: 14px;
  color: #8b4513;
  margin-top: 4px;
}

.confirm-btn.disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog {
  background: white;
  padding: 28px;
  border-radius: 14px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 20px;
}

.coupon-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border: 2px solid #e2cfc0;
  margin-bottom: 16px;
  border-radius: 10px;
  background: #fdfaf5;
  transition: 0.3s;
  cursor: pointer;
}
.coupon-item:hover {
  border-color: var(--primary);
  background: #f5ede5;
}

.coupon-item input {
  margin-top: 6px;
  transform: scale(1.2);
  accent-color: var(--primary);
}

.coupon-item input[type="radio"] {
  width: 18px;
  height: 18px;
}

.content {
  flex: 1;
}
.discount {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary);
}
.date {
  font-size: 14px;
  color: #666;
  margin-top: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.confirm-btn,
.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}
.confirm-btn {
  background: var(--primary);
  color: white;
}
.confirm-btn:hover {
  background-color: #40291d;
}
.cancel-btn {
  background: #eee;
  color: #333;
}
.cancel-btn:hover {
  background: #ddd;
}

</style>
