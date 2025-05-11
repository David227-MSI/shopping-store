<template>
    <div class="category-sidebar">
      <h3>分類快速選單</h3>
      <ul>
        <li v-for="category in sideCategories" :key="category.id">
          <button class="toggle-btn" @click="$emit('toggle-sub', category)">
            {{ category.icon }} {{ category.name }}
          </button>
          <ul v-show="category.show" class="sub-category">
            <li v-for="sub in category.subs" :key="sub.id">
              <a @click.prevent="$emit('filter-category', sub.id)">{{ sub.name }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  defineProps({
    sideCategories: Array
  })
  </script>
  
  <style scoped>
  .category-sidebar {
  width: 250px;
  min-width: 200px;
  background-color: #fff8f0;
  padding: 20px 16px 20px 0; /* 左 padding 調小或設 0 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-left: 0;
}
  .toggle-btn {
    font-weight: bold;
    cursor: pointer;
  }
  .sub-category {
    padding-left: 1rem;
  }
  </style>
  