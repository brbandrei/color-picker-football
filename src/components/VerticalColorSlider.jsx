const VISUAL_LENGTH = 220  // px — visual height of the track after rotation
const TRACK_H       = 10   // px — track thickness
const THUMB_SIZE    = 22   // px — thumb diameter

/**
 * Vertical slider built with CSS transform rotate(-90deg).
 * After rotation: bottom = min value, top = max value.
 * trackGradient is still declared `to right` — after -90° it renders bottom→top.
 */
export default function VerticalColorSlider({ label, abbr, value, min, max, unit = '', trackGradient, onChange }) {
  return (
    <div className="flex flex-col items-center gap-3 select-none">

      {/* Value display */}
      <div className="text-center leading-tight">
        <span className="block text-sm font-mono font-bold text-white tabular-nums">
          {value}
        </span>
        <span className="block text-[10px] text-zinc-500">{unit}</span>
      </div>

      {/* Rotated range input */}
      <div style={{ position: 'relative', width: THUMB_SIZE, height: VISUAL_LENGTH }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            width: VISUAL_LENGTH,
            height: TRACK_H,
            // Center the rotated element inside the wrapper
            left: (THUMB_SIZE - VISUAL_LENGTH) / 2,
            top:  (VISUAL_LENGTH - TRACK_H) / 2,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
            background: trackGradient,
          }}
        />
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-400">
          {abbr}
        </span>
        <span className="text-[10px] text-zinc-500">{label}</span>
      </div>

    </div>
  )
}
