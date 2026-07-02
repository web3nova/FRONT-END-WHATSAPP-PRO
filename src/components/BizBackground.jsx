// components/BizBackground.jsx
import './BizBackground.css'

export default function BizBackground({ variant = 'dark' }) {
  const isDark = variant === 'dark'
  
  return (
    <div className={`biz-bg biz-bg--${variant}`}>
      {/* Animated grid */}
      <div className="biz-bg__grid" />

      {/* Chart SVG - this creates the trend line */}
      <svg
        className="biz-bg__chart"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bizFillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "#ffffff" : "#4166F5"} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isDark ? "#ffffff" : "#4166F5"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="biz-bg__chart-fill"
          fill="url(#bizFillGradient)"
          d="M0,180 Q100,150 200,120 T400,80 T600,100 T800,60 T1000,90 T1200,70 L1200,200 L0,200 Z"
        />
        <path
          className="biz-bg__chart-line"
          stroke={isDark ? "rgba(255,255,255,0.7)" : "#4166F5"}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M0,180 Q100,150 200,120 T400,80 T600,100 T800,60 T1000,90 T1200,70"
        />
      </svg>

      {/* Data points - pulsing dots */}
      <div 
        className="biz-bg__dot" 
        style={{ 
          left: '20%', 
          bottom: '22%',
          background: isDark ? 'rgba(255,255,255,0.9)' : '#4166F5'
        }} 
      />
      <div 
        className="biz-bg__dot" 
        style={{ 
          left: '45%', 
          bottom: '12%', 
          animationDelay: '0.8s',
          background: isDark ? 'rgba(255,255,255,0.9)' : '#4166F5'
        }} 
      />
      <div 
        className="biz-bg__dot" 
        style={{ 
          left: '70%', 
          bottom: '8%', 
          animationDelay: '1.6s',
          background: isDark ? 'rgba(255,255,255,0.9)' : '#4166F5'
        }} 
      />

      {/* Particles - floating dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="biz-bg__particle"
          style={{
            left: `${5 + i * 8}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${6 + i * 0.5}s`,
            background: isDark ? 'rgba(255,255,255,0.6)' : '#4166F5'
          }}
        />
      ))}
    </div>
  )
}