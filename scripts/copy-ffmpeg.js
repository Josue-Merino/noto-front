import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../node_modules/@ffmpeg/core/dist/umd')
const destDir = path.resolve(__dirname, '../public/ffmpeg')

if (!fs.existsSync(srcDir)) {
  console.warn(`[copy-ffmpeg] Directorio de origen no encontrado: ${srcDir}`)
  process.exit(0)
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

for (const file of files) {
  const src = path.join(srcDir, file)
  const dest = path.join(destDir, file)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    const stats = fs.statSync(dest)
    console.log(`[copy-ffmpeg] Copiado ${file} a public/ffmpeg/ (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`)
  } else {
    console.warn(`[copy-ffmpeg] Archivo no encontrado: ${src}`)
  }
}
