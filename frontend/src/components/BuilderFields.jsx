const inputClass =
  'w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline'

export function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      {label && <span className="block text-xs uppercase tracking-widest text-slate mb-1">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  )
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      {label && <span className="block text-xs uppercase tracking-widest text-slate mb-1">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </label>
  )
}

export function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-redline" />
      {label}
    </label>
  )
}

/** Editable list of plain strings (bullet points, skills, technologies). */
export function StringListEditor({ items, onChange, placeholder, addLabel = '+ Add' }) {
  function updateAt(i, value) {
    const next = [...items]
    next[i] = value
    onChange(next)
  }
  function removeAt(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...items, ''])
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => updateAt(i, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="text-slate hover:text-redline text-lg shrink-0 w-6"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs uppercase tracking-widest text-redline hover:underline">
        {addLabel}
      </button>
    </div>
  )
}

/** Card wrapper for one item inside a repeatable list section (experience, education, ...). */
export function ItemCard({ children, onRemove, onMoveUp, onMoveDown, title }) {
  return (
    <div className="border border-line bg-white/50 rounded-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-slate">{title}</span>
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="text-slate hover:text-redline">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="text-slate hover:text-redline">
              ↓
            </button>
          )}
          <button type="button" onClick={onRemove} className="text-slate hover:text-redline">
            Remove
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/** Generic helpers for editing an array of objects (experience items, education items, ...). */
export function useListHelpers(items, onChange) {
  function updateItem(i, patch) {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  function addItem(blank) {
    onChange([...items, blank])
  }
  function moveItem(i, dir) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return { updateItem, removeItem, addItem, moveItem }
}
