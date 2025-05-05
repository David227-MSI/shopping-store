<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <!-- <EventList /> -->
    <!-- <CreateEvent /> -->
    <!-- <NotificationTemplateList /> -->
    <CouponTemplateList />
    <CreateCouponTemplate2 />
    <!-- <UploadImg /> -->

    <!-- front -->
     <!-- <UserEventList /> -->
    <!-- <SubscribeList2 /> -->
    <!-- <CouponList /> -->
    <!-- <NotificationList /> -->
  </main>
</template>

<script setup>
  import NotificationList from '@/views/pages/ttpp/front/NotificationList.vue'
  import CouponList from '@/views/pages/ttpp/front/CouponList.vue'
  import SubscribeList2 from '@/views/pages/ttpp/front/SubscribeList2.vue';
  import UserEventList from '@/views/pages/ttpp/front/EventList.vue';

  import UploadImg from '@/views/pages/ttpp/back/UploadImg.vue';
  import CreateCouponTemplate2 from '@/views/pages/ttpp/back/CreateCouponTemplate2.vue';
  import CouponTemplateList from '@/views/pages/ttpp/back/CouponTemplateList.vue';
  import NotificationTemplateList from '@/views/pages/ttpp/back/NotificationTemplateList.vue';
  import CreateEvent from '@/views/pages/ttpp/back/CreateEvent.vue';
  import EventList from '@/views/pages/ttpp/back/EventList.vue';



</script>
