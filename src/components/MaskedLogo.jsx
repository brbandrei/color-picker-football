import { useEffect, useRef } from 'react'
import { rgbToHsl, hslToRgb, hueDiff } from '../utils/color.js'

const HUE_TOLERANCE = 28   // degrees — pixels within this range of dominantColor.h get masked
const MIN_SAT       = 12   // ignore grays
const MIN_LIT       = 13   // ignore near-blacks
const MAX_LIT       = 87   // ignore near-whites

/**
 * Renders the team logo on a <canvas>, replacing every pixel whose hue matches
 * dominantColor.h (within HUE_TOLERANCE) with guessColor.
 * Lightness per pixel = guessColor.l + (origPixelL - dominantColor.l),
 * so the L slider moves the whole mask while shadows/highlights are preserved.
 */
export default function MaskedLogo({ src, dominantColor, guessColor, size = 144 }) {
  const canvasRef = useRef(null)

  // Always reflects the latest guessColor — readable from any async callback
  const guessColorRef = useRef(guessColor)
  guessColorRef.current = guessColor

  // ── Step 1: load original image data once per src ──────────────────────
  const origDataRef = useRef(null)   // Uint8ClampedArray — never mutated
  const maskIndicesRef = useRef(null) // Int32Array of pixel starts that match dominantColor
  const origLightnessRef = useRef(null) // Float32Array — per-mask-pixel original L value

  useEffect(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      // Draw at natural size on an offscreen canvas to get pixel data
      const off = document.createElement('canvas')
      off.width = img.naturalWidth
      off.height = img.naturalHeight
      const ctx = off.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, off.width, off.height)
      const raw = imageData.data

      origDataRef.current = new Uint8ClampedArray(raw) // frozen snapshot

      // Find which pixels belong to the dominant color region
      const indices = []
      const litValues = []
      const { h: dh } = dominantColor

      for (let i = 0; i < raw.length; i += 4) {
        if (raw[i + 3] < 64) continue  // transparent
        const [ph, ps, pl] = rgbToHsl(raw[i], raw[i + 1], raw[i + 2])
        if (pl < MIN_LIT || pl > MAX_LIT) continue
        if (ps < MIN_SAT) continue
        if (hueDiff(ph, dh) <= HUE_TOLERANCE) {
          indices.push(i)
          litValues.push(pl)
        }
      }

      maskIndicesRef.current = indices
      origLightnessRef.current = litValues

      // Set canvas dimensions once
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = off.width
        canvas.height = off.height
      }

      renderMask(guessColorRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // ── Step 2: re-render only the mask pixels when guessColor changes ──────
  useEffect(() => {
    if (origDataRef.current) renderMask(guessColor)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessColor.h, guessColor.s, guessColor.l])

  function renderMask(guess) {
    const canvas = canvasRef.current
    const orig = origDataRef.current
    const indices = maskIndicesRef.current
    const litValues = origLightnessRef.current
    if (!canvas || !orig || !indices) return

    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Reset to original image
    data.set(orig)

    // Replace masked pixels with guess H/S and offset-adjusted L
    const { h: gh, s: gs, l: gl } = guess
    const domL = dominantColor.l
    for (let k = 0; k < indices.length; k++) {
      const i = indices[k]
      const newL = Math.min(95, Math.max(5, gl + (litValues[k] - domL)))
      const [nr, ng, nb] = hslToRgb(gh, gs, newL)
      data[i]     = nr
      data[i + 1] = ng
      data[i + 2] = nb
    }

    ctx.putImageData(imageData, 0, 0)
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, objectFit: 'contain', imageRendering: 'auto' }}
    />
  )
}
