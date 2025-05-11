<template>
    <aside class="category-sidebar">
      <h3>分類</h3>
      <ul>
        <li><a href="#">香水</a></li>
        <li><a href="#">衣服</a></li>
        <li><a href="#">3C</a></li>
        
      </ul>
    </aside>
  </template>
  
  <script setup>
 
  </script>
  
  <style scoped>
  .category-sidebar {
    width: 220px;
    background-color: #f9f5f0;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .category-sidebar h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #5c4328;
  }
  .category-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .category-sidebar li {
    margin-bottom: 10px;
  }
  .category-sidebar a {
    font-size: 14px;
    color: #7a5a38;
    text-decoration: none;
    transition: color 0.3s;
  }
  .category-sidebar a:hover {
    color: #b5854d;
  }
  </style>
  