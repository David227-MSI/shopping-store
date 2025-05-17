<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>選擇適用商家</h3>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="搜尋商家名稱或 ID" />
        </div>
        <div class="brand-table-container">
          <table class="brand-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名稱</th>
                <th>選擇</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="brand in filteredBrands"
                :key="brand.id"
                @click="selectBrand(brand)"
                :class="{ 'selected': selectedBrand && selectedBrand.id === brand.id }"
              >
                <td>{{ brand.id }}</td>
                <td>{{ brand.name }}</td>
                <td>
                  <input
                    type="radio"
                    name="selected-brand"
                    :value="brand.id"
                    :checked="selectedBrand && selectedBrand.id === brand.id"
                    @change="selectBrand(brand)"
                  />
                </td>
              </tr>
              <tr v-if="filteredBrands.length === 0 && searchQuery">
                <td colspan="3">找不到符合的商家</td>
              </tr>
              <tr v-if="brands.length === 0 && !loading && !searchQuery">
                <td colspan="3">暫無商家資料</td>
              </tr>
              <tr v-if="loading">
                <td colspan="3">載入中...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button @click="closeModal">取消</button>
          <button @click="applySelection" :disabled="!selectedBrand">套用</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  
  const props = defineProps({
    selectedId: {
      type: Number,
      default: null
    }
  });
  
  const emit = defineEmits(['brand-selected', 'close']);
  
  const brands = ref([]);
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedBrand = ref(null);
  
  onMounted(async () => {
    loading.value = true;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/brands`);
      brands.value = response.data;
      selectedBrand.value = brands.value.find(b => b.id === props.selectedId) || null;
    } catch (error) {
      console.error('載入商家資料失敗', error);
    } finally {
      loading.value = false;
    }
  });
  
  const filteredBrands = computed(() => {
    if (!searchQuery.value) {
      return brands.value;
    }
    const query = searchQuery.value.toLowerCase();
    return brands.value.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query) ||
        String(brand.id).includes(query)
    );
  });
  
  const selectBrand = (brand) => {
    selectedBrand.value = brand;
  };
  
  const applySelection = () => {
    emit('brand-selected', selectedBrand.value);
    closeModal();
  };
  
  const closeModal = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    width: 80%; /* 調整寬度以適應表格 */
    max-height: 80vh;
    overflow-y: auto;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .search-bar {
    margin-bottom: 15px;
  }
  
  .search-bar input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .brand-table-container {
    overflow-x: auto; /* 如果表格內容過寬，允許水平滾動 */
  }
  
  .brand-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .brand-table th,
  .brand-table td {
    padding: 8px 10px;
    border: 1px solid #eee;
    text-align: left;
  }
  
  .brand-table th {
    background-color: #f8f8f8;
    font-weight: bold;
  }
  
  .brand-table tbody tr:hover {
    background-color: #f5f5f5;
    cursor: pointer; /* 增加點擊提示 */
  }
  
  .brand-table tbody tr.selected {
    background-color: #f0f7ff;
    font-weight: bold;
  }
  
  .modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .modal-actions button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-left: 10px;
  }
  
  .modal-actions button:first-child {
    background-color: #ddd;
    color: #333;
  }
  
  .modal-actions button:last-child {
    background-color: #007bff;
    color: white;
  }
  
  .modal-actions button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  </style>