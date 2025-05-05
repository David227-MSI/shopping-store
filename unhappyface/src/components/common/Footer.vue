<template>
    <footer class="site-footer">
      <div class="footer-social">
        <a href="#"><img src="/images/facebook.png" alt="Facebook" /></a>
        <a href="#"><img src="/images/instagram.png" alt="Instagram" /></a>
        <a href="#"><img src="/images/line.png" alt="LINE" /></a>
      </div>
      <div class="footer-copy">© 2025 麥豹購物網站. All rights reserved.</div>
    </footer>
  </template>
  
  <script setup>
  // 無需 script
  </script>
  
  <style scoped>
  .site-footer {
    background: var(--primary);
    color: var(--text-light);
    padding: 30px 20px;
    text-align: center;
  }
  .footer-social img {
    width: 24px;
    height: 24px;
    margin: 0 10px;
    transition: transform 0.3s ease;
  }
  .footer-social img:hover {
    transform: scale(1.2);
  }
  .footer-copy {
    margin-top: 10px;
    color: #ddd;
  }
  </style>
  