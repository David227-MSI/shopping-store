<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <!-- <AdminCreateCouponTemplate /> -->
    <!-- <AdminCreateEvent /> -->
    <!-- <AdminEventList /> -->
    <!-- <NotificationTemplateList /> -->
    <!-- <CouponTemplateList /> -->
    <!-- <UploadImg /> -->

    <!-- front -->
    <UserEventList2 />

    <!-- fake -->
    <!-- <UserLogin /> -->
    <!-- <UserModify /> -->
    <!-- <UserRegister /> -->


  </main>
</template>

<script setup>
  
  import UserEventList2 from '@/views/pages/ttpp/front/UserEventList2.vue';

  import AdminCreateCouponTemplate from '@/views/pages/ttpp/back/AdminCreateCouponTemplate.vue';
  import CouponTemplateList from '@/views/pages/ttpp/back/CouponTemplateList.vue';
  import NotificationTemplateList from '@/views/pages/ttpp/back/NotificationTemplateList.vue';
  import AdminCreateEvent from '@/views/pages/ttpp/back/AdminCreateEvent.vue';
  import AdminEventList from '@/views/pages/ttpp/back/AdminEventList.vue';

  import UserLogin from '@/views/pages/ttpp/_fake/UserLogin.vue'
  import UserModify from '@/views/pages/ttpp/_fake/UserModify.vue'
  import UserRegister from '@/views/pages/ttpp/_fake/UserRegister.vue'



</script>
