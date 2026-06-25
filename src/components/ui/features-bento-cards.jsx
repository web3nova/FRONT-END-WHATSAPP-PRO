import React from "react"
import { cn } from "../../lib/utils"
import { Link } from "react-router-dom"
import { useScrollReveal, useTilt } from "../../hooks/useAnimations"

const cardContents = [
  {
    title: "WhatsApp Automation",
    description:
      "Native capabilities to automate WhatsApp conversations and handle complex customer inquiries directly from your dashboard.",
    icon: "💬",
  },
  {
    title: "Order Management",
    description:
      "Track, manage, and fulfill orders natively within your personalized business dashboard with a few clicks.",
    icon: "🛒",
  },
  {
    title: "Customer Insights & Analytics",
    description:
      "Understand your audience better with in-depth analytics and seamless CRM integration. Design dynamic, responsive messaging campaigns using our built-in marketing primitives that scale beautifully. With our intelligent tracking defaults, you'll see conversion metrics adapt effortlessly.",
    icon: "📊",
  },
  {
    title: "Knowledge Bases",
    description:
      "Train your bot with custom knowledge sources to ensure accurate and contextual replies.",
    icon: "📚",
  },
  {
    title: "Data Tables",
    description:
      "Store and manage conversational and transactional data safely with scalable tables.",
    icon: "🗂️",
  },
  {
    title: "Instant Deployment",
    description:
      "Launch your intelligent systems immediately and boost your business productivity without any delays.",
    icon: "⚡",
  },
]

const TiltCard = ({
  className = "",
  title,
  description,
  icon,
  delay = 0,
}) => {
  const { ref, style, shineStyle, handleMove, handleLeave } = useTilt(6)
  const [revealRef, isVisible] = useScrollReveal({ threshold: 0.1 })

  return (
    <div
      ref={revealRef}
      className={cn(
        "reveal-card",
        isVisible ? "reveal-card-visible" : "",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={style}
        className="tilt-card-inner relative border border-dashed border-zinc-400 dark:border-zinc-700 rounded-lg p-6 bg-white dark:bg-zinc-950 min-h-[200px] flex flex-col justify-between group hover:border-solid hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
      >
        {/* Shine overlay from tilt */}
        <div style={shineStyle} />

        {/* Abstract Noise/Texture background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        <Link to="/signup" className="absolute inset-0 z-20" />

        {/* Content */}
        <div className="relative z-10 space-y-3 pointer-events-none">
          <div className="text-3xl mb-2 card-icon-bounce">{icon}</div>
          <h3 className="text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {description}
          </p>
        </div>

        {/* Bottom glow on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-lg" />
      </div>
    </div>
  )
}

export default function FeaturesBentoCards() {
  const [sectionRef, sectionVisible] = useScrollReveal({ threshold: 0.05 })

  return (
    <section
      ref={sectionRef}
      className={cn(
        "bg-transparent py-24 transition-opacity duration-1000",
        sectionVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="mx-auto container py-8 px-8 relative">
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-6 relative z-10">
          <TiltCard {...cardContents[0]} className="lg:col-span-3 lg:row-span-2" delay={0} />
          <TiltCard {...cardContents[1]} className="lg:col-span-3 lg:row-span-2" delay={100} />
          <TiltCard {...cardContents[2]} className="lg:col-span-4 lg:row-span-1" delay={200} />
          <TiltCard {...cardContents[3]} className="lg:col-span-2 lg:row-span-1" delay={300} />
          <TiltCard {...cardContents[4]} className="lg:col-span-3 lg:row-span-1" delay={400} />
          <TiltCard {...cardContents[5]} className="lg:col-span-3 lg:row-span-1" delay={500} />
        </div>

        {/* Section Footer Heading */}
        <div className="max-w-2xl ml-auto text-right px-4 mt-16 lg:mt-12 relative z-10">
          <h2 className="text-black dark:text-white mb-4 tracking-tight">
            Built for performance. Designed for growth.
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Biz AI gives you the tools to build beautiful, high-performing automated businesses with lightning speed.
            Each feature is thoughtfully designed to be flexible, reusable, and focused on scaling your operations.
          </p>
        </div>
      </div>
    </section>
  )
}
