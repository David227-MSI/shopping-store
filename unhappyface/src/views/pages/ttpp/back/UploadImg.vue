<template>
    <div style="max-width: 400px; margin: auto">
      <label>關聯 ID（如優惠券 ID）：</label>
      <input v-model="id" type="number" placeholder="輸入 ID" style="margin-bottom: 10px; width: 100%" />
  
      <label>媒體類型：</label>
      <select v-model="mediaType" style="margin-bottom: 10px; width: 100%">
        <option value="IMAGE">圖片</option>
        <option value="VIDEO">影片</option>
        <!-- 根據後端 Enum 補上更多選項 -->
      </select>
  
      <div class="box">
        <div v-if="!imgURL" class="add">+</div>
        <img v-if="imgURL" :src="imgURL" style="width: 100%; height: 100%; object-fit: contain" />
        <input type="file" class="theFile" @change="fileChange" />
      </div>
  
      <div class="buttons">
        <button @click="upload">上傳圖片</button>
      </div>
    </div>
</template>



<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const imgURL = ref(null)
const selectedFile = ref(null)
const id = ref('')
const mediaType = ref('IMAGE')

const fileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  selectedFile.value = file

  const readFile = new FileReader()
  readFile.readAsDataURL(file)

  readFile.onload = () => {
    imgURL.value = readFile.result
  }
}

const upload = async () => {
  if (!selectedFile.value || !id.value) {
    Swal.fire({
        icon: 'error',
        title: '資料尚未填完',
        text: '請選擇圖片並填寫關聯 ID'
    })
    return
  }

  const formData = new FormData()
  formData.append('id', id.value)
  formData.append('mediaType', mediaType.value)
  formData.append('mediaData', selectedFile.value) // 注意這裡改成 mediaData

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/coupons/uploadImage`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    Swal.fire({
        icon: 'success',
        title: '圖片上傳成功',
        text: `Coupon Media ID: ${res.data.data.id}`,
      })
    imgURL.value = null
    selectedFile.value = null
  } catch (err) {
    Swal.fire({
        icon: 'error',
        title: '圖片上傳失敗',
        text: err.response?.data?.message || err.message
    })
  }
}
</script>

<style scoped>
.box {
  border: 8px dashed #ccc;
  width: 300px;
  height: 300px;
  text-align: center;
  position: relative;
}
.add {
  font: bold 100px Tahoma;
  color: #ccc;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.theFile {
  width: 300px;
  height: 300px;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  opacity: 0;
}
.buttons {
  text-align: center;
  margin: 10px;
}
.buttons button {
  font-size: large;
}
</style>
