# 🛒 Shopping Website Frontend - Vue Store

This is the frontend application for our full-stack e-commerce final project, developed using Vue 3 and Pinia.  
It provides users with a complete shopping flow, including cart management, order creation, ECPay payment, and order history browsing.

> 📚 Developed as part of a 534-hour Java Software Engineer Training Program.  
> 🎯 This frontend is integrated with a Spring Boot backend via RESTful APIs.

---

## 🔧 Tech Stack

- Vue 3 + Vite
- Pinia (state management)
- Vue Router
- Axios
- SweetAlert2 (notifications)
- Lottie Web (animations)
- SCSS / CSS Modules

---

## 👤 My Responsibilities

I was responsible for the **entire shopping flow UI** and its integration with backend services, including:

- 🛒 **Shopping Cart Page**
    - Display cart items
    - Quantity update & removal
    - Coupon selection dialog with real-time discount preview

- 📦 **Checkout Page**
    - Auto-filled member address
    - Address input dialog with county/district dropdown
    - Validation and confirmation UI

- 💳 **ECPay Payment Integration**
    - Submit order and redirect to ECPay
    - Handle success return page from ECPay

- ✅ **Order Complete Page**
    - Animated success feedback (Lottie)
    - Display of final amount, order ID, payment status

- 📜 **Order History Page**
    - List of past orders
    - Modal to view order details and product info

---

## 🧪 API Integration Flow

- Uses JWT token for authenticated requests
- Pulls cart & coupon data from backend
- Pushes order details to Spring Boot backend
- Receives order confirmation / payment callback via backend

---

## 🚀 Setup Guide

```bash
npm install
npm run dev
