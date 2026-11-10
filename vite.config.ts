import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  // الشعار والأيقونات تُضمَّن داخل الصفحة (صفحة واحدة للنشر داخل Claude)
  build: { assetsInlineLimit: 20000 },
});
