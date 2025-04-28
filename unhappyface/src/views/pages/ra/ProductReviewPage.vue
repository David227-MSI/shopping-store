<template>
    <div class="container py-4">
      <h2 class="mb-4">商品評論</h2>
  
      <!-- 排序與篩選 -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <select v-model="sortOption" @change="fetchReviews" class="form-select w-auto d-inline-block me-2">
            <option value="LATEST">最新</option>
            <option value="MOST_LIKED">最讚</option>
          </select>
  
          <div class="form-check form-switch d-inline-block">
            <input class="form-check-input" type="checkbox" v-model="onlyImages" @change="fetchReviews">
            <label class="form-check-label">只看有圖</label>
          </div>
        </div>
      </div>
  
      <!-- 評論卡片 -->
      <div v-if="reviews.length">
        <div v-for="review in reviews" :key="review.id" class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <div v-if="review.tags.length">
                  <span v-for="tag in review.tags" :key="tag" class="badge bg-primary me-1">{{ tag }}</span>
                </div>
                <p class="mt-2">{{ review.reviewText }}</p>
  
                <div v-if="review.reviewImages.length">
                  <img v-for="img in review.reviewImages" :key="img" :src="img" alt="Review Image" class="img-thumbnail me-2" style="max-width: 150px;">
                </div>
              </div>
  
              <div class="text-end">
                <div>
                  <small>發表時間：{{ formatDate(review.createdAt) }}</small>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-2" @click="toggleLike(review)">
                  ❤️ {{ review.likeCount }}
                </button>
              </div>
            </div>
  
            <div class="mt-2">
              <small>品質：{{ review.scoreQuality }}分，描述：{{ review.scoreDescription }}分，配送：{{ review.scoreDelivery }}分</small>
            </div>
          </div>
        </div>
  
        <!-- 分頁器 -->
        <Paginate
          v-if="totalPages > 1"
          :page-count="totalPages"
          :click-handler="handlePageChange"
          :prev-text="'‹'"
          :next-text="'›'"
          :container-class="'pagination justify-content-center'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-class="'page-item'"
          :prev-link-class="'page-link'"
          :next-class="'page-item'"
          :next-link-class="'page-link'"
        />
      </div>
      <div v-else>
        <p>暫無評論。</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useUserStore } from '@/stores/ra/user';
  import axios from 'axios';
  import Paginate from 'vuejs-paginate-next';
  
  const route = useRoute();
  const userStore = useUserStore();
  
  const reviews = ref([]);
  const totalPages = ref(1);
  const page = ref(1);
  const sortOption = ref('LATEST');
  const onlyImages = ref(false);
  
  const pid = route.params.pid;
  
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/app/reviews/product/${pid}`, {
        params: {
          sort: sortOption.value,
          onlyImages: onlyImages.value,
          page: page.value - 1,
          size: 10,
        }
      });
      reviews.value = res.data.data.content;
      totalPages.value = res.data.data.totalPages;
    } catch (err) {
      console.error('載入評論失敗', err);
    }
  };
  
  const handlePageChange = (newPage) => {
    page.value = newPage;
    fetchReviews();
  };
  
  const toggleLike = async (review) => {
    try {
      await axios.post(`http://localhost:8080/app/reviews/${review.id}/like`, null, {
        params: { userId: userStore.userId }
      });
      await fetchReviews(); // 按完重新撈評論資料
    } catch (err) {
      console.error('點讚失敗', err);
    }
  };
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };
  
  onMounted(() => {
    fetchReviews();
  });
  </script>
  
  <style scoped>
  .pagination {
    margin-top: 20px;
  }
  </style>
  