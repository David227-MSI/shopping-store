<template>
    <div class="search-bar">
      <div class="filter-left">
        <div>
          <label>分類：</label>
          <select :value="selectedCategory" @change="onCategoryChange">
            <option value="">全部</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div>
          <label>品牌：</label>
          <select :value="selectedBrand" @change="onBrandChange">
            <option value="">全部</option>
            <option v-for="b in brands" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <input
          type="text"
          :value="searchKeyword"
          @input="onKeywordInput"
          placeholder="商品名稱或關鍵字"
        />
        <button class="search-button" @click="search">搜尋</button>
        <button class="reset-button" @click="reset">清除</button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    categories: Array,
    brands: Array,
    selectedCategory: String,
    selectedBrand: String,
    searchKeyword: String,
  })
  
  const emit = defineEmits([
    'update:selectedCategory',
    'update:selectedBrand',
    'update:searchKeyword',
    'search',
    'reset',
    'categoryChanged'
  ])
  
  const onCategoryChange = (event) => {
    emit('update:selectedCategory', event.target.value)
    emit('categoryChanged')
  }
  
  const onBrandChange = (event) => {
    emit('update:selectedBrand', event.target.value)
  }
  
  const onKeywordInput = (event) => {
    emit('update:searchKeyword', event.target.value)
  }
  
  const search = () => emit('search')
  const reset = () => emit('reset')
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .filter-left,
  .filter-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .filter-left label,
  .filter-right label {
    margin-right: 0.5rem;
  }
  .search-button,
  .reset-button {
    padding: 6px 12px;
    cursor: pointer;
  }
  </style>
  