<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <!-- <EventList /> -->
    <!-- <CreateEvent /> -->
    <!-- <NotificationTemplateList /> -->
    <!-- <CouponTemplateList /> -->
    <!-- <CreateCouponTemplate /> -->

    <!-- front -->
    <SubscribeList />
    <!-- <CouponList /> -->
    <!-- <NotificationList /> -->
  </main>
</template>

<script setup>
  import NotificationList from '@/views/pages/ttpp/front/NotificationList.vue'
  import CouponList from '@/views/pages/ttpp/front/CouponList.vue'
  import SubscribeList from '@/views/pages/ttpp/front/SubscribeList.vue';

  import CreateCouponTemplate from '@/views/pages/ttpp/back/CreateCouponTemplate.vue';
  import CouponTemplateList from '@/views/pages/ttpp/back/CouponTemplateList.vue';
  import NotificationTemplateList from '@/views/pages/ttpp/back/NotificationTemplateList.vue';
  import CreateEvent from '@/views/pages/ttpp/back/CreateEvent.vue';
  import EventList from '@/views/pages/ttpp/back/EventList.vue';



</script>
