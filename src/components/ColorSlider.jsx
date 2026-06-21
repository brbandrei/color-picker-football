export default function ColorSlider({ label, abbr, value, min, max, unit = '', trackGradient, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-400 select-none shrink-0">
            {abbr}
          </span>
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <span className="text-sm font-mono font-bold text-white tabular-nums">
          {value}
          <span className="text-zinc-500 text-xs font-normal ml-0.5">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ background: trackGradient }}
      />
    </div>
  )
}
