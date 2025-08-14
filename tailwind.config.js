/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Ghi chú: Thêm đuôi file `.css` vào đây.
    // Điều này sẽ bảo Tailwind quét cả các file CSS để tìm các class tiện ích
    // được sử dụng với cú pháp @apply.
    "./src/**/*.{html,ts,css }",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
