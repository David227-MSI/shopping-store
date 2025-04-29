<template>
  <div style="min-height: 100vh; background: #f9fafb; padding: 2rem; font-family: Arial, sans-serif;">
    <!-- 網站標題 -->
    <header style="margin-bottom: 2rem; text-align: center;">
      <h1 style="font-size: 2rem; color: #333;">商品評論</h1>
    </header>

    <!-- 評論總結區塊 -->
    <section style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 2rem; color: #ff9b05; font-weight: bold;">{{ overallAverage.toFixed(1) }}</div>
        <div>
          <span v-for="n in 5" :key="n" style="font-size: 1.5rem; color: gold;">
            {{ n <= Math.round(overallAverage) ? '★' : '☆' }}
          </span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div v-for="item in scoreItems" :key="item.label" style="display: flex; align-items: center;">
          <div style="width: 120px; text-align: right; margin-right: 1rem; color: #555;">{{ item.label }}</div>
          <div style="flex: 1; background: #eee; border-radius: 9999px; overflow: hidden; height: 10px;">
            <div :style="barStyle(item.average)"></div>
          </div>
          <div style="width: 30px; text-align: left; margin-left: 0.5rem; font-size: 0.9rem; color: #555;">{{ item.average.toFixed(1) }}</div>
        </div>
      </div>
    </section>

    <!-- 篩選條件 -->
    <section style="margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <label><input type="checkbox" v-model="filters.hasComment"> 有評論</label>
        <label><input type="checkbox" v-model="filters.hasImage"> 有圖/影片</label>
        <label v-for="n in 5" :key="n">
          <input type="checkbox" v-model="filters.stars" :value="n"> {{ n }}星
        </label>
      </div>
    </section>

    <!-- 排序下拉選單 -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
      <select v-model="selectedSort" style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 5px;">
        <option value="latest">最新</option>
        <option value="mostLiked">最讚</option>
        <option value="withImages">有圖</option>
      </select>
    </div>

    <!-- 評論列表 -->
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div
        v-for="review in paginatedReviews"
        :key="review.id"
        style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
      >
        <!-- 使用者資訊 -->
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div style="width: 40px; height: 40px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            {{ review.username.charAt(0) }}
          </div>
          <div style="margin-left: 0.75rem;">
            <div style="font-weight: bold; color: #333;">{{ review.username.charAt(0) }}**</div>
            <div style="font-size: 0.8rem; color: green;">已購買 ✅</div>
          </div>
        </div>

        <!-- 三種星星評分 -->
        <div style="margin-bottom: 0.5rem;">
          <div>商品品質：
            <span v-for="n in 5" :key="'q' + n" style="font-size: 1.25rem; color: gold;">
              {{ n <= review.scoreQuality ? '★' : '☆' }}
            </span>
          </div>
          <div>商品符合：
            <span v-for="n in 5" :key="'d' + n" style="font-size: 1.25rem; color: gold;">
              {{ n <= review.scoreDescription ? '★' : '☆' }}
            </span>
          </div>
          <div>出貨速度：
            <span v-for="n in 5" :key="'s' + n" style="font-size: 1.25rem; color: gold;">
              {{ n <= review.scoreDelivery ? '★' : '☆' }}
            </span>
          </div>
        </div>

        <!-- 評論文字 -->
        <p style="color: #555; margin-bottom: 0.75rem;">
          {{ review.text }}
        </p>

        <!-- 標籤 -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
          <span
            v-for="tag in review.tags"
            :key="tag"
            :style="tagStyle(tag)"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 上傳圖片 -->
        <div v-if="review.images.length" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <img
            v-for="(img, index) in review.images"
            :key="index"
            :src="img"
            style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
          />
        </div>

        <!-- 按讚數和日期 -->
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #888;">
          <div>
            👍 {{ review.likes }} 個人覺得有幫助
          </div>
          <div>
            {{ review.date }}
          </div>
        </div>
      </div>
    </div>

    <!-- 換頁按鈕 -->
    <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
      <button @click="prevPage" :disabled="page === 1" style="padding: 0.5rem 1rem; border: none; background: #ccc; border-radius: 5px; cursor: pointer;">上一頁</button>
      <button @click="nextPage" :disabled="page === totalPages" style="padding: 0.5rem 1rem; border: none; background: #ccc; border-radius: 5px; cursor: pointer;">下一頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const selectedSort = ref('latest');
const filters = ref({ hasComment: false, hasImage: false, stars: [] });
const page = ref(1);
const size = 10;

const reviews = ref([
{
    id: 1,
    username: '王小明',
    scoreQuality: 5,
    scoreDescription: 5,
    scoreDelivery: 5,
    text: '出貨速度超快，商品也很有質感，會再回購！',
    tags: ['出貨快', '品質好', '回購意願'],
    images: ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjwwSf7-nJTQXRavYV_ZZEPn-emCxkNz9VPBzCUx_P6eQJe5G4028zk4NT1Ws2fFAsgcr7FU4e8JJ-Nhv6Msxpr3pMOWb3Glixo67-x6RLKtBZcxWkytIKKvfcoRehqKTIg4DwCu2avzMwG/s800/pose_kiri_woman.png', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo-rT2vh740DM6V1-sSlELTQw3sHuQLq4oYTXGIuAPTbDD9gQnDBq0ob6Eoz0C6rHZxoSGxN91_At39W4aP1jSyNXp0TQwieT0M3pVSU3UEFzxl-eXh4Ebj7eH2zVj_315cAIrAMIdwCCr/s800/pose_kiri_man.png'],
    likes: 18,
    date: '2025年4月22日'
  },
  {
    id: 2,
    username: '陳美麗',
    scoreQuality: 4,
    scoreDescription: 4,
    scoreDelivery: 3,
    text: '包裝普通，但整體還算符合預期。',
    tags: ['描述相符', '包裝完整'],
    images: [],
    likes: 6,
    date: '2025年4月21日'
  },
  {
    id: 3,
    username: '李大仁',
    scoreQuality: 3,
    scoreDescription: 3,
    scoreDelivery: 3,
    text: '',
    tags: ['CP值高'],
    images: [],
    likes: 0,
    date: '2025年4月19日'
  },
  {
    id: 4,
    username: '林曉華',
    scoreQuality: 5,
    scoreDescription: 4,
    scoreDelivery: 5,
    text: '客服很親切，處理問題快速有效。',
    tags: ['客服親切'],
    images: ['https://via.placeholder.com/100x100?text=4'],
    likes: 15,
    date: '2025年4月18日'
  },
  {
    id: 5,
    username: '周大勇',
    scoreQuality: 2,
    scoreDescription: 2,
    scoreDelivery: 3,
    text: '與描述有落差，商品略顯粗糙。',
    tags: ['描述相符'],
    images: [],
    likes: 2,
    date: '2025年4月16日'
  },
  {
    id: 6,
    username: '張小芳',
    scoreQuality: 5,
    scoreDescription: 5,
    scoreDelivery: 5,
    text: '太棒了！超出預期，五星推薦！',
    tags: ['出貨快', '品質好', '回購意願'],
    images: ['https://via.placeholder.com/100x100?text=6a'],
    likes: 34,
    date: '2025年4月15日'
  },
  {
    id: 7,
    username: '王小美',
    scoreQuality: 3,
    scoreDescription: 4,
    scoreDelivery: 4,
    text: '送貨快，產品也符合圖片。',
    tags: ['出貨快', '描述相符'],
    images: [],
    likes: 7,
    date: '2025年4月14日'
  },
  {
    id: 8,
    username: '謝宗翰',
    scoreQuality: 4,
    scoreDescription: 5,
    scoreDelivery: 4,
    text: '回購第三次了，依然滿意。',
    tags: ['回購意願', '品質好'],
    images: ['https://via.placeholder.com/100x100?text=8'],
    likes: 21,
    date: '2025年4月13日'
  },
  {
    id: 9,
    username: '吳佳玲',
    scoreQuality: 4,
    scoreDescription: 4,
    scoreDelivery: 5,
    text: '商品精緻，物流也快。',
    tags: ['品質好', '出貨快'],
    images: [],
    likes: 11,
    date: '2025年4月12日'
  },
  {
    id: 10,
    username: '楊士豪',
    scoreQuality: 5,
    scoreDescription: 5,
    scoreDelivery: 5,
    text: '第一次使用這家平台，體驗超好！',
    tags: ['客服親切', 'CP值高'],
    images: ['https://via.placeholder.com/100x100?text=10'],
    likes: 19,
    date: '2025年4月10日'
  },
  {
    id: 10,
    username: '楊士豪',
    scoreQuality: 5,
    scoreDescription: 5,
    scoreDelivery: 5,
    text: '第一次使用這家平台，體驗超好！',
    tags: ['客服親切', 'CP值高'],
    images: ['https://via.placeholder.com/100x100?text=10'],
    likes: 19,
    date: '2025年4月10日'
  }
]);

const overallAverage = computed(() => {
  if (!reviews.value.length) return 0;
  const total = reviews.value.reduce((sum, r) => sum + r.scoreQuality + r.scoreDescription + r.scoreDelivery, 0);
  return total / (reviews.value.length * 3);
});

const scoreItems = computed(() => [{
  label: '商品品質',
  average: avg(reviews.value.map(r => r.scoreQuality))
}, {
  label: '商品符合',
  average: avg(reviews.value.map(r => r.scoreDescription))
}, {
  label: '出貨速度',
  average: avg(reviews.value.map(r => r.scoreDelivery))
}]);

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const filteredReviews = computed(() => {
  return reviews.value.filter(r => {
    if (filters.value.hasComment && !r.text) return false;
    if (filters.value.hasImage && (!r.images || r.images.length === 0)) return false;
    if (filters.value.stars.length && !filters.value.stars.includes(Math.round((r.scoreQuality + r.scoreDescription + r.scoreDelivery) / 3))) return false;
    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredReviews.value.length / size));

const paginatedReviews = computed(() => {
  const start = (page.value - 1) * size;
  return filteredReviews.value.slice(start, start + size);
});

function prevPage() { if (page.value > 1) page.value--; }
function nextPage() { if (page.value < totalPages.value) page.value++; }

function barStyle(avg) {
  return {
    width: `${avg * 20}%`,
    height: '10px',
    background: 'linear-gradient(to right, #ffdccc, #ff9b05)'
  };
}

function tagStyle(tag) {
  let bg = '#eee'; let color = '#555';
  if (tag.includes('出貨快')) { bg = '#fff7e6'; color = '#f59e0b'; }
  else if (tag.includes('品質好')) { bg = '#ecfdf5'; color = '#10b981'; }
  else if (tag.includes('回購意願')) { bg = '#fce7f3'; color = '#ec4899'; }
  else if (tag.includes('描述相符')) { bg = '#d1fae5'; color = '#14b8a6'; }
  else if (tag.includes('客服親切')) { bg = '#ede9fe'; color = '#8b5cf6'; }
  else if (tag.includes('CP值高')) { bg = '#cffafe'; color = '#06b6d4'; }
  else if (tag.includes('包裝完整')) { bg = '#fef3c7'; color = '#f59e0b'; }
  return { background: bg, color: color, padding: '0.3rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem' };
}
</script>

<style scoped>
</style>