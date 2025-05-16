<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>選擇適用商品</h3>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="搜尋商品名稱或 ID" />
        </div>
        <div class="product-table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名稱</th>
                <th>庫存</th>
                <th>單價</th>
                <th>選擇</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                @click="selectProduct(product)"
                :class="{ 'selected': selectedProduct && selectedProduct.id === product.id }"
              >
                <td>{{ product.id }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.stock }}</td>
                <td>NT${{ product.unitPrice }}</td>
                <td>
                  <input
                    type="radio"
                    name="selected-product"
                    :value="product.id"
                    :checked="selectedProduct && selectedProduct.id === product.id"
                    @change="selectProduct(product)"
                  />
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0 && searchQuery">
                <td colspan="5">找不到符合的商品</td>
              </tr>
              <tr v-if="products.length === 0 && !loading && !searchQuery">
                <td colspan="5">暫無商品資料</td>
              </tr>
              <tr v-if="loading">
                <td colspan="5">載入中...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button @click="closeModal">取消</button>
          <button @click="applySelection" :disabled="!selectedProduct">套用</button>
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
  
  const emit = defineEmits(['product-selected', 'close']);
  
  const products = ref([]);
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedProduct = ref(null);
  
  onMounted(async () => {
    loading.value = true;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/products/productSelector`);
      if (response.data.success) {
        products.value = response.data.data;
        selectedProduct.value = products.value.find(p => p.id === props.selectedId) || null;
      } else {
        console.error('載入商品資料失敗:', response.data.message);
      }
    } catch (error) {
      console.error('載入商品資料時發生錯誤', error);
    } finally {
      loading.value = false;
    }
  });
  
  const filteredProducts = computed(() => {
    if (!searchQuery.value) {
      return products.value;
    }
    const query = searchQuery.value.toLowerCase();
    return products.value.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        String(product.id).includes(query)
    );
  });
  
  const selectProduct = (product) => {
    selectedProduct.value = product;
  };
  
  const applySelection = () => {
    emit('product-selected', selectedProduct.value);
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
    width: 90%; /* 調整寬度以適應表格 */
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
  
  .product-table-container {
    overflow-x: auto; /* 如果表格內容過寬，允許水平滾動 */
  }
  
  .product-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .product-table th,
  .product-table td {
    padding: 8px 10px;
    border: 1px solid #eee;
    text-align: left;
  }
  
  .product-table th {
    background-color: #f8f8f8;
    font-weight: bold;
  }
  
  .product-table tbody tr:hover {
    background-color: #f5f5f5;
    cursor: pointer; /* 增加點擊提示 */
  }
  
  .product-table tbody tr.selected {
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