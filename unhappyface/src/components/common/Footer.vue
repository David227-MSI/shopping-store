<template>
    <footer class="site-footer">
      <div class="footer-links">
        <a href="#">關於我們</a> |
        <a href="#">客服中心</a> |
        <a href="#">隱私權政策</a> |
        <a href="#">常見問題</a>
      </div>
      <p class="footer-copy">© 2025 專題商城 All Rights Reserved.</p>
    </footer>
</template>

<script setup>
</script>

<style scoped>
/* 📎 Footer */
.site-footer {
  background: var(--primary);
  color: var(--text-light);
  padding: 30px 20px;
  text-align: center;
}
.site-footer a {
  color: var(--text-light);
  text-decoration: none;
  margin: 0 10px;
}
.footer-copy {
  margin-top: 10px;
  color: #ddd;
}
.footer-social img {
  width: 24px;                /* App 大小的 icon */
  height: 24px;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
 
  transition: transform 0.3s ease;
}

.footer-social img:hover {
  transform: scale(1.2);
}
</style>