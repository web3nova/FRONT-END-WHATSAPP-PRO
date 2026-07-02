import './BizBackground.css'

export default function BizBackground() {
  return (
    <div className="biz-bg" aria-hidden="true">
      <div className="biz-bg__grid" />

      <svg
        className="biz-bg__chart"
        viewBox="0 0 1400 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bizStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4166F5" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="bizFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4166F5" stopOpacity="0.10" />
          </linearGradient>
        </defs>
        <path
          className="biz-bg__chart-fill"
          fill="url(#bizFill)"
          d="M0,520 Q120,460 240,400 T480,320 T720,380 T960,260 T1200,320 T1400,280 L1400,800 L0,800 Z"
        />
        <path
          className="biz-bg__chart-line"
          stroke="url(#bizStroke)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M0,520 Q120,460 240,400 T480,320 T720,380 T960,260 T1200,320 T1400,280"
        />
      </svg>

      <span className="biz-bg__dot biz-bg__dot--a" />
      <span className="biz-bg__dot biz-bg__dot--b" />
      <span className="biz-bg__dot biz-bg__dot--c" />

      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className={`biz-bg__particle${i % 3 === 0 ? ' biz-bg__particle--blue' : ''}`}
          style={{
            left: `${4 + i * 7}%`,
            animationDelay: `${i * 0.55}s`,
            animationDuration: `${7 + (i % 5) * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}