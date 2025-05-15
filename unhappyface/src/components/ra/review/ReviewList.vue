<template>
  <div class="review-block">
    <!-- 平均分數 -->
    <ScoreSummary
      :quality="overallAvg.scoreQuality"
      :description="overallAvg.scoreDescription"
      :delivery="overallAvg.scoreDelivery"
    />

    <!-- 工具列 -->
    <div class="toolbar">
      <select v-model="sort" @change="resetAndFetch">
        <option value="LATEST">最新</option>
        <option value="MOST_LIKED">最讚</option>
        <option value="WITH_IMAGES">有圖</option>
      </select>

      <select v-model.number="scoreFilter" @change="applyFilter">
        <option value="0">全部分數</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }}★以上</option>
      </select>
    </div>

    <!-- 標籤 chip -->
    <div class="tag-filter">
      <span v-for="t in TAGS"
            :key="t.code"
            :class="['chip',{active:activeTags.includes(t.code)}]"
            @click="toggleTag(t.code)">
        #{{ t.label }}
      </span>
    </div>

    <!-- 評論卡片 -->
    <div class="cards">
      <div v-for="r in filtered" :key="r.id" class="card">
        <div class="header">
          <div class="left">
            <span class="name">{{ maskName(r.userName) }}</span>
            <span class="stars">{{ '★'.repeat(Math.round(r.avg)) }}</span>
          </div>
        <span class="dt">{{ formatDate(r.createdAt) }}</span>
        </div>

        <div class="sub-scores">
          <span>品質 {{ r.scoreQuality }}</span>
          <span>描述 {{ r.scoreDescription }}</span>
          <span>出貨 {{ r.scoreDelivery }}</span>
        </div>

        <p class="txt">{{ r.comment }}</p>

        <div class="imgs" v-if="r.reviewImages?.length">
          <img v-for="u in r.reviewImages"
              :key="u"
              :src="u"
              @click="openPreview(r.reviewImages, u)" />
        </div>

        <div class="tags">
          <span v-for="t in r.tags" :key="t" class="tag">#{{ t }}</span>
        </div>

        <div class="footer">
          <button class="like" @click="toggleLike(r)">👍 {{ r.likeCount }} 個人覺得有幫助</button>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <button v-if="hasMore && !loading" class="more" @click="loadMore">載入更多</button>
    <p v-if="loading" class="loading">Loading…</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import ScoreSummary from './ScoreSummary.vue'

/* --- 常量 / map --- */
const TAGS=[{code:'FAST',label:'出貨快'},{code:'QUALITY',label:'品質好'},{code:'VALUE',label:'CP值高'},{code:'PACKAGING',label:'包裝完整'},{code:'MATCHING',label:'描述相符'},{code:'REPURCHASE',label:'回購意願'},{code:'SERVICE',label:'客服親切'}]
const TAG_MAP=Object.fromEntries(TAGS.map(t=>[t.code,t.label]))

/* --- props --- */
const props=defineProps<{productId:number}>()

/* --- state --- */
const sort=ref<'LATEST'|'MOST_LIKED'|'WITH_IMAGES'>('LATEST')
const scoreFilter=ref(0)
const activeTags=ref<string[]>([])
const reviews=ref<any[]>([])
const page=ref(0)
const hasMore=ref(true)
const loading=ref(false)
const overallAvg=ref({scoreQuality:0,scoreDescription:0,scoreDelivery:0})

/* --- 過濾後列表 --- */
const filtered=computed(()=>{
  let list=reviews.value
  if(activeTags.value.length) list=list.filter(r=>activeTags.value.every(t=>r.tagsRaw.includes(t)))
  if(scoreFilter.value) list=list.filter(r=>Math.round(r.avg)>=scoreFilter.value)
  if(sort.value==='WITH_IMAGES') list=list.filter(r=>r.reviewImages?.length)
  return list
})

/* --- utils --- */
const maskName = (n: string | null | undefined): string => {
  // 檢查 n 是否為有效的非空字串
  if (typeof n === 'string' && n.length > 0) {
    // 返回第一個字元 + 'OO'
    return n[0] + 'OO';
  } else {
    // 名稱不存在或為空，返回 '匿名'
    return '匿名';
  }
};

const formatDate = (dt: string): string => {
  if (!dt) {
    return '無日期'; // 或其他處理方式
  }
  try {
      return new Date(dt).toLocaleDateString();
  } catch (e) {
      console.error("Error formatting date:", dt, e);
      return '無效日期';
  }
};

/** 獲取總平均分數 */
async function fetchOverallAvg() {
  try {
    const { data } = await axios.get(`/api/products/${props.productId}/avg`);
    overallAvg.value = {
      scoreQuality: data.data.scoreQuality || 0,
      scoreDescription: data.data.scoreDescription || 0,
      scoreDelivery: data.data.scoreDelivery || 0
    };
  } catch (e) {
    console.warn('總平均分數抓取失敗', e);
    overallAvg.value = {scoreQuality:0,scoreDescription:0,scoreDelivery:0};
  }
}

/** 依排序 & 分頁抓評論（reset = true 代表切換排序或重新整理） */
async function fetch(reset = false) {
  if (loading.value || (!hasMore.value && !reset)) return;
  loading.value = true;

  if (reset) {
    page.value = 0;
    hasMore.value = true;
  }

  try {
    const { data } = await axios.get(
      `/api/products/${props.productId}/reviews`,
      {
        params: {
          sort: sort.value,
          onlyImages: sort.value === 'WITH_IMAGES',
          page: page.value,
          size: 10
        }
      }
    );

    const dto = data.data;
    const mapped = dto.content.map((r: any) => ({
      ...r,
      comment: r.reviewText ?? '',
      tagsRaw: r.tags,
      tags: (r.tags ?? []).map((t: string) => TAG_MAP[t] ?? t),
      userName: r.userName,
      avg: (r.scoreQuality + r.scoreDescription + r.scoreDelivery) / 3
    }));

    if (sort.value === 'MOST_LIKED') {
      mapped.sort((a, b) => b.likeCount - a.likeCount);
    }

    if (reset) {
      reviews.value = mapped;
    } else {
      reviews.value.push(...mapped);
    }

    hasMore.value = page.value + 1 < dto.totalPages;
    page.value++;

  } catch (e) {
    console.warn('評論抓取失敗', e);
  } finally {
    loading.value = false;
  }
}

function loadMore(){fetch()}
function resetAndFetch(){fetch(true)}
function applyFilter(){}

/* --- like --- */
async function toggleLike(r:any){
  try{
    const {data}=await axios.post(`/api/reviews/${r.id}/like`,null,{params:{userId:1003}})
    r.likeCount=data.data
  }catch{Swal.fire('失敗','請稍後再試','error')}
}

/* --- 圖片 preview (左右切換) --- */
function openPreview(list, current) {
  let idx = list.indexOf(current);

  Swal.fire({
    html: `
            <div class="pv-box">
        <img id="pv-img" src="${current}">
        <button id="prev" class="arrow">&lt;</button>
        <button id="next" class="arrow">&gt;</button>
      </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    width: '70%',
    didOpen: () => {
      const htmlContainer = Swal.getHtmlContainer();

      if (!htmlContainer) {
        console.error('無法獲取 SweetAlert2 HTML 容器'); // 加一個錯誤檢查
        return; // 如果獲取不到，就退出，避免報錯
      }

      // 現在可以在有效的 htmlContainer 上呼叫 querySelector
      const $ = (q) => htmlContainer.querySelector(q);

      const img = $('#pv-img');
      const prev = $('#prev');
      const next = $('#next');

      // 檢查元素是否存在
      if (!img || !prev || !next) {
          console.error('未能在 SweetAlert2 Modal 中找到圖片或箭頭元素');
          return;
      }
      const update = () => {
        img.src = list[idx];
      };

      prev.addEventListener('click', (e) => {
        e.stopPropagation();
        idx = (idx - 1 + list.length) % list.length;
        update();
      });

      next.addEventListener('click', (e) => {
        e.stopPropagation();
        idx = (idx + 1) % list.length;
        update();
      });
    },
  });
}

/* --- mount --- */
onMounted(()=>{
  fetchOverallAvg();
  fetch(true);
})
</script>

<style scoped>
.review-block{margin-top:24px}
.toolbar{display:flex;gap:12px;justify-content:flex-end;margin-bottom:10px}
.toolbar select{padding:4px 10px;border:1px solid #d2b48c;border-radius:6px;background:#fff}
.tag-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.chip{padding:4px 12px;border-radius:14px;background:#eee;cursor:pointer;font-size:.85rem}
.chip.active{background:var(--primary,#5C4033);color:#fff}

.cards{display:flex;flex-direction:column;gap:20px}
.card{padding:22px;border:1px solid #ddd;border-radius:12px;background:#fff;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
.header .left{display:flex;align-items:center;gap:10px}
.dt{font-size:.8rem;color:#999}
.footer{margin-top:10px}
.name{font-weight:bold}
.stars{color:#F4B400;font-size:1.1rem}
.sub-scores{font-size:.85rem;color:#555;margin-bottom:6px;display:flex;gap:14px}
.txt{margin:6px 0}
.imgs{display:flex;gap:10px;margin:6px 0;flex-wrap:wrap}
.imgs img{width:90px;height:90px;object-fit:cover;border-radius:8px;cursor:pointer}
.tags{margin-top:4px}
.tag{background:#F1E3D3;color:#5C4033;padding:3px 10px;border-radius:12px;font-size:.75rem;margin-right:4px}
.footer .like{background:none;border:none;color:var(--primary,#5C4033);cursor:pointer;font-size:.9rem}

.more{margin:14px auto 0;display:block;padding:6px 18px;border:none;border-radius:6px;background:var(--primary,#5C4033);color:#fff}
.loading{text-align:center;margin:14px 0}

:global(.swal2-popup .pv-box) {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  position: relative; /* arrow 定位需要 */
  width: 100%; /* 讓容器寬度滿 SweetAlert2 的內容區 */
}

:global(.swal2-popup #pv-img) {
  max-width: 70vw;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

:global(.swal2-popup .arrow) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  width: 48px;
  height: 48px;
  font-size: 1.8rem;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  z-index: 10; /* 確保箭頭在圖片上方 */
}

:global(.swal2-popup #prev) {
  left: 20px;
}

:global(.swal2-popup #next) {
  right: 20px;
}

:global(.swal2-popup .arrow:hover) {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

:global(.swal2-popup .arrow:active) {
  transform: translateY(-50%) scale(0.95);
}
</style>