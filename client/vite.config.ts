import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const ReactCompilerConfig = { /* ... */ };

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
