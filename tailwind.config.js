/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Đường dẫn này sẽ quét tất cả các file .html và .ts trong toàn bộ thư mục src
    // Đây là phần quan trọng nhất để sửa lỗi của bạn
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
