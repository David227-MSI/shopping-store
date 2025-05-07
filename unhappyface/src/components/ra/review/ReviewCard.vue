<template>
    <div class="card">
      <header>
        <strong>{{ review.username }}</strong>
        <span>{{ fmt(review.createdAt) }}</span>
      </header>
  
      <p class="txt">{{ review.comment }}</p>
  
      <!-- 圖片縮圖 -->
      <div v-if="review.reviewImages.length" class="imgs">
        <img
          v-for="(src,i) in review.reviewImages"
          :key="src"
          :src="src"
          @error="$event.target.src = '/no-image.png'"
          @click="emit('preview', { imgs: review.reviewImages, idx: i })"
        />
      </div>
  
      <!-- 標籤 -->
      <div v-if="review.tags.length" class="tags">
        <span v-for="t in review.tags" :key="t">#{{ t }}</span>
      </div>
  
      <!-- 點讚 -->
      <button class="like-btn" @click="emit('like', review)">
        👍 {{ review.likeCount }} <span v-if="review.liked">已讚</span>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Review {
    id: number
    username: string
    createdAt: string
    comment: string
    likeCount: number
    liked: boolean
    reviewImages: string[]
    tags: string[]
  }
  
  const props = defineProps<{ review: Review }>()
  const emit  = defineEmits(['like', 'preview'])
  const fmt   = (s: string) => new Date(s).toLocaleDateString()
  </script>
  
  <style scoped>
  .card{padding:12px 0;border-bottom:1px solid #ddd}
  header{font-size:.9rem;color:#555;display:flex;gap:6px}
  .txt{margin:6px 0 8px}
  .imgs img{width:80px;height:80px;object-fit:cover;margin-right:6px;border-radius:6px;cursor:zoom-in}
  .tags span{font-size:.8rem;margin-right:4px;color:var(--primary)}
  .like-btn{background:none;border:none;color:var(--primary);cursor:pointer;font-size:.9rem;padding:0}
  .like-btn:hover{text-decoration:underline}
  </style>
  