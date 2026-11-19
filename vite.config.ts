import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // A API libera CORS só para esta origem: se a porta estiver ocupada, falhar é melhor que trocar de porta.
  server: { port: 5173, strictPort: true },
})
