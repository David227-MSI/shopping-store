<template>
    <div class="template-card">
      <div class="image-container">
        <img
          v-if="template.couponMedia?.mediaData"
          :src="getImageSrc(template.couponMedia.mediaData)"
          alt="template image"
        />
        <span v-else>-</span>
      </div>
      <div class="info">
        <p>ID: {{ template.id }}</p>
        <p>適用類型: {{ formatApplicableType(template.applicableType) }}</p>
        <p>適用 ID: {{ template.applicableId || '-' }}</p>
        <p>折扣值: {{ template.discountValue }}</p>
        <p>開始時間: {{ formatDateTime(template.startTime) }}</p>
        <p>到期時間: {{ formatDateTime(template.endTime) }}</p>
      </div>
      <div class="actions">
        <button @click="editTemplate(template.id)">編輯</button>
        <button @click="deleteTemplate(template.id)">刪除</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    template: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['edit', 'delete']);
  
  const formatApplicableType = (type) => {
    const types = {
      ALL: '全品項適用',
      PRODUCT: '商品適用',
      BRAND: '品牌適用'
    };
    return types[type] || type;
  };
  
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getImageSrc = (base64) => {
    if (!base64) return '';
    return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  };
  
  const editTemplate = (id) => {
    emit('edit', id);
  };
  
  const deleteTemplate = (id) => {
    emit('delete', id);
  };
  </script>
  
  <style scoped>
  .template-card {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding: 12px;
  }
  
  .image-container {
    width: 80px;
    height: 80px;
    margin-right: 16px;
    overflow: hidden;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f9f9f9;
  }
  
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .info {
    flex-grow: 1;
  }
  
  .info p {
    margin: 4px 0;
    font-size: 0.9em;
    color: #333;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .actions button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
  }
  
  .actions button:first-child {
    background-color: #007bff;
    color: white;
  }
  
  .actions button:first-child:hover {
    background-color: #0056b3;
  }
  
  .actions button:last-child {
    background-color: #dc3545;
    color: white;
  }
  
  .actions button:last-child:hover {
    background-color: #c82333;
  }
  </style>