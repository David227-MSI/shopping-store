import axios from "axios";
import Swal from "sweetalert2";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 攔截器：自動附加 user token
instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// 回應攔截器：統一錯誤處理
instance.interceptors.response.use(
  (response) => {
    return response.data; // 正常回傳直接拿資料
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message ?? '發生未知錯誤';

      if (status === 401) {
        Swal.fire({
          icon: 'warning',
          title: '登入逾時',
          text: '請重新登入'
        });
      } else if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: '權限不足',
          text: '請聯絡站方管理員'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '伺服器錯誤',
          text: message
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '連線失敗',
        text: '請檢查網路連線'
      });
    }
    return Promise.reject(error)
  }
);

export default instance;
