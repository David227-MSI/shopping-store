<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <AdminCreateCouponTemplate />
    <!-- <AdminCreateEvent /> -->
    <!-- <AdminEventList /> -->
    <!-- <NotificationTemplateList /> -->
    <CouponTemplateList />
    <!-- <UploadImg /> -->

    <!-- front -->
    <!-- <UserEventList /> -->
    <!-- <UserSubscribeList /> -->
    <!-- <UserCouponList /> -->
    <!-- <UserNotificationList /> -->


  </main>
</template>

<script setup>
  import UserNotificationList from '@/views/pages/ttpp/front/UserNotificationList.vue'
  import UserCouponList from '@/views/pages/ttpp/front/UserCouponList.vue'
  import UserSubscribeList from '@/views/pages/ttpp/front/UserSubscribeList.vue';
  import UserEventList from '@/views/pages/ttpp/front/UserEventList.vue';

  import AdminCreateCouponTemplate from '@/views/pages/ttpp/back/AdminCreateCouponTemplate.vue';
  import CouponTemplateList from '@/views/pages/ttpp/back/CouponTemplateList.vue';
  import NotificationTemplateList from '@/views/pages/ttpp/back/NotificationTemplateList.vue';
  import AdminCreateEvent from '@/views/pages/ttpp/back/AdminCreateEvent.vue';
  import AdminEventList from '@/views/pages/ttpp/back/AdminEventList.vue';





</script>
