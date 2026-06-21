const VISUAL_LENGTH = 220  // px — visual height of the track after rotation

export default function VerticalColorSlider({ label, abbr, value, min, max, unit = '', trackGradient, onChange, trackH = 10, thumbSize = 22 }) {
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
      <div style={{ position: 'relative', width: thumbSize, height: VISUAL_LENGTH }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            width: VISUAL_LENGTH,
            height: trackH,
            left: (thumbSize - VISUAL_LENGTH) / 2,
            top:  (VISUAL_LENGTH - trackH) / 2,
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
