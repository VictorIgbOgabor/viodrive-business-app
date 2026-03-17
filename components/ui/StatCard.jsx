export default function StatCard({
  title, value, subtitle, icon, trend, color = 'ember'
}) {
  const colorMap = {
    ember: 'bg-ember/10 text-ember',
    green: 'bg-green-500/10 text-green-400',
    amber: 'bg-amber-500/10 text-amber-400',
    blue:  'bg-blue-500/10 text-blue-400',
    chrome:'bg-surface text-chrome',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-chrome text-xs font-medium uppercase
          tracking-wider">
          {title}
        </p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center
            justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="font-display text-2xl font-black text-sand mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-chrome text-xs">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-xs mt-2 font-medium ${
          trend.up ? 'text-green-400' : 'text-red-400'
        }`}>
          {trend.up ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}
