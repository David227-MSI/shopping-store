<template>
    <header class="topbar">
      <a href="/">🏠 回首頁</a>
      <a href="#">📱 App下載</a>
      <a href="#">💎 點點購</a>
      <a href="#">📚 書店</a>
      <a href="#">🔑 登入</a>
      <a href="#">🆕 註冊</a>
      <a href="#">👤 會員中心</a>
      <a href="#">📦 查訂單</a>
      <a href="#">⭐️ 追蹤清單</a>
      <a href="#">🎫 折價券</a>
      <a href="#">🛒 購物車(<span>{{ cartCount }}</span>)</a>
    </header>
</template>

<script setup>
</script>

<style scoped>
/* 🔝 頂部導覽列 */
.topbar {
  background-color: var(--primary);
  padding: 8px 20px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.topbar a {
  flex: 1;
  text-align: center;
  color: var(--text-light);
  text-decoration: none;
  font-weight: bold;
  min-width: 80px;
}
.topbar a:hover {
  text-decoration: underline;
}
</style>