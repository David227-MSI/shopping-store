<template>
  <footer class="footer">
    <div class="footer-social">
      <a href="#"><img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/facebook.png" alt="Facebook" /></a>
      <a href="#"><img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/instagram.png" alt="Instagram" /></a>
      <a href="#"><img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/line.png" alt="LINE" /></a>
    </div>
    <div class="footer-links">
      <a href="#">關於我們</a> |
      <a href="#">客服中心</a> |
      <a href="#">隱私權政策</a> |
      <a href="#">常見問題</a> |
      <a href="#" @click.prevent="showFeedback = true">意見反應</a>
    </div>
    <p class="footer-copy">© 2025 MyGoal購物網站. All rights reserved.</p>

    <Teleport to="body">
      <div v-if="showFeedback" class="modal-overlay">
        <div class="modal-content">
          <button class="close-button" @click="showFeedback = false">&times;</button>
          <h2>填寫意見反應</h2>
          <form @submit.prevent="submitFeedback">
            <input v-model="form.name" type="text" placeholder="您的姓名" required />
            <input v-model="form.email" type="email" placeholder="您的 Email" required />
            <input v-model="form.subject" type="text" placeholder="主旨" required />
            <textarea v-model="form.message" placeholder="請輸入訊息" required></textarea>
            <div class="modal-actions">
              <button type="button" @click="showFeedback = false" class="me-2">取消</button>
              <button type="submit" style="margin-left: 10px;">送出</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </footer>
</template>

<script setup>
import { ref } from 'vue'; // ref 仍然需要 import
import axios from 'axios';
import Swal from 'sweetalert2';

const showFeedback = ref(false);
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

async function submitFeedback() {
  try {
    // 確保 API 路徑正確
    await axios.post('/api/public/contact', form.value);
    Swal.fire({
      icon: 'success',
      title: '感謝您的回饋！',
      text: '我們已收到您的意見。',
      confirmButtonText: '確定'
    });
    showFeedback.value = false;
    form.value = { name: '', email: '', subject: '', message: '' };
  } catch (err) {
    console.error('意見反應送出失敗:', err); // 添加錯誤日誌方便調試
    Swal.fire({
      icon: 'error',
      title: '送出失敗',
      // 使用 err.response?.data?.message 來獲取後端返回的錯誤訊息，如果沒有則顯示通用訊息
      text: err.response?.data?.message || '請稍後再試，或聯繫客服。',
      confirmButtonText: '我知道了'
    });
  }
}
</script>

<style scoped>
.footer {
  background-color: var(--primary);
  color: white; /* 主要的文字顏色 */
  text-align: center;
  padding: 1rem; /* 主要的 padding */
  /* 如果需要次要的 padding，可以修改這裡 */
  /* padding: 30px 20px; */
}

/* 新增社群圖標的樣式 */
.footer-social {
  margin-bottom: 1rem; /* 在社群圖標和連結之間增加一些空間 */
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

.footer-links {
  margin-bottom: 0.5rem; /* 主要的 margin-bottom */
}
.footer-links a {
  color: #ffffff; /* 主要的連結顏色 */
  margin: 0 0.3rem;
  text-decoration: underline;
  cursor: pointer;
}

.footer-copy {
  font-size: 0.9rem; /* 主要的字體大小 */
  margin-top: 10px; /* 採用次要的 margin-top */
  color: #ddd; /* 採用次要的顏色，讓版權文字顏色稍淡 */
}

/* Modal 样式 (來自主要的) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.25s ease-out;
}

.modal-content {
  background-color: #fffaf4;
  color: var(--text-dark);
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  font-family: 'Noto Sans TC', sans-serif;
  animation: scale-up 0.25s ease-out;
}

.modal-content h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary);
  font-weight: bold;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  margin-bottom: 1rem;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d2b48c;
  font-size: 1rem;
  background-color: #fff;
  box-sizing: border-box;
}

.modal-content textarea {
  resize: vertical;
  min-height: 120px;
}

.modal-actions {
  text-align: right;
  margin-top: 12px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.modal-actions button:first-of-type {
  background-color: #ddd;
  color: #333;
}

.modal-actions button:last-of-type {
  background-color: var(--primary);
  color: #fff;
}

.modal-actions button:last-of-type:hover {
  background-color: #40291d;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--primary);
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>