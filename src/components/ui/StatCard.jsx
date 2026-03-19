export default function StatCard({ icon, label, value, unit, status = 'normal', onClick }) {
  const statusClass = {
    normal:  'value-normal',
    warn:    'value-warn',
    danger:  'value-danger',
    unknown: 'text-gray-400',
  }[status] || 'value-normal'

  const borderClass = {
    normal:  'border-green-200 bg-green-50',
    warn:    'border-yellow-300 bg-yellow-50',
    danger:  'border-red-300 bg-red-50',
    unknown: 'border-gray-200 bg-gray-50',
  }[status] || 'border-green-200 bg-green-50'

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-1 text-center
                  w-full transition active:scale-95 ${borderClass}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-xs text-gray-500 font-body">{label}</span>
      {value !== null && value !== undefined ? (
        <span className={`text-2xl font-display font-bold ${statusClass}`}>
          {value}<span className="text-sm ml-0.5">{unit}</span>
        </span>
      ) : (
        <span className="text-gray-300 text-lg">--</span>
      )}
      {status === 'danger' && <span className="text-xs text-red-600 font-semibold">⚠️ Alert</span>}
      {status === 'warn'   && <span className="text-xs text-yellow-600 font-semibold">⚠️ Watch</span>}
    </button>
  )
}

