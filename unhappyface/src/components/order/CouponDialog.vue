<template>
  <div class="overlay" @click.self="close">
    <div class="dialog">
      <h2 class="title">選擇優惠券</h2>

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
                : `打 ${coupon.discountValue} 折（最多折 $${coupon.maxDiscount ?? '無'})` }}
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
        <button class="confirm-btn" @click="confirm">確認使用</button>
        <button class="cancel-btn" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

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
  color: #333;
  margin-bottom: 20px;
}

.coupon-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border: 2px solid #d6bce6;
  margin-bottom: 16px;
  border-radius: 10px;
  background: #fcf8ff;
  transition: 0.3s;
  cursor: pointer;
}
.coupon-item:hover {
  border-color: #a275c8;
  background: #f7f0ff;
}

.coupon-item input {
  margin-top: 6px;
  transform: scale(1.2);
  accent-color: #7e3b92;
}

.content {
  flex: 1;
}
.discount {
  font-size: 18px;
  font-weight: bold;
  color: #4a1d5d;
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
  background: #7e3b92;
  color: white;
}
.confirm-btn:hover {
  background: #9d50c3;
}
.cancel-btn {
  background: #eee;
  color: #333;
}
.cancel-btn:hover {
  background: #ddd;
}
</style>
