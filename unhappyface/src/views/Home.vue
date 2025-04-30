<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <NotificationTemplateList />
    <CouponTemplateList />
    <CreateCouponTemplate />

    <!-- front -->
    <CouponList />
    <NotificationList />
  </main>
</template>

<script setup>
  import NotificationList from '@/views/pages/ttpp/front/NotificationList.vue'
  import CouponList from '@/views/pages/ttpp/front/CouponList.vue'

  import CreateCouponTemplate from '@/views/pages/ttpp/back/CreateCouponTemplate.vue';
  import CouponTemplateList from '@/views/pages/ttpp/back/CouponTemplateList.vue';
  import NotificationTemplateList from '@/views/pages/ttpp/back/NotificationTemplateList.vue';



</script>
