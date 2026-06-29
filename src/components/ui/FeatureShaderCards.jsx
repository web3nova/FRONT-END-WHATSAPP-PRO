import React from "react"
import { motion } from "framer-motion"
import { Warp } from "@paper-design/shaders-react"
import { MessageCircle, Zap, Globe, Package, Brain } from "lucide-react"

const features = [
  {
    title: "AI That Replies on WhatsApp 24/7",
    description: "Your business never sleeps. Our AI answers customer questions, takes orders, and handles WhatsApp conversations — even at 2am.",
    icon: <MessageCircle className="w-10 h-10 text-[#4166F5]" />
  },
  {
    title: "Instant Quotes, Zero Back-and-Forth",
    description: "Customers ask, AI quotes. No more typing the same prices over and over — your AI knows your catalog and gives accurate quotes in seconds.",
    icon: <svg className="w-10 h-10 text-[#4166F5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-8"></path><path d="M16 12h-8"></path><path d="M13 16h-5"></path></svg>
  },
  {
    title: "Your Own Website, Built Automatically",
    description: "Every business gets a free, professional website — generated instantly from your products and brand. No coding, no designer needed.",
    icon: <Globe className="w-10 h-10 text-[#4166F5]" />
  },
  {
    title: "Smart Inventory & Order Management",
    description: "Track stock, manage orders, and see everything in one dashboard — synced automatically with what the AI sells on WhatsApp.",
    icon: <Package className="w-10 h-10 text-[#4166F5]" />
  },
  {
    title: "AI That Actually Knows Your Business",
    description: "Upload your price list or catalog once — your AI learns it and answers customers accurately, like a trained staff member who never forgets.",
    icon: <Brain className="w-10 h-10 text-[#4166F5]" />
  }
]

export default function FeatureShaderCards() {
  const getShaderConfig = (index) => {
    const configs = [
      {
        proportion: 0.3, softness: 0.8, distortion: 0.15, swirl: 0.6, swirlIterations: 8, shape: "checks", shapeScale: 0.08,
        colors: ["hsl(280, 100%, 30%)", "hsl(320, 100%, 60%)", "hsl(340, 90%, 40%)", "hsl(300, 100%, 70%)"],
      },
      {
        proportion: 0.4, softness: 1.2, distortion: 0.2, swirl: 0.9, swirlIterations: 12, shape: "dots", shapeScale: 0.12,
        colors: ["hsl(200, 100%, 25%)", "hsl(180, 100%, 65%)", "hsl(160, 90%, 35%)", "hsl(190, 100%, 75%)"],
      },
      {
        proportion: 0.35, softness: 0.9, distortion: 0.18, swirl: 0.7, swirlIterations: 10, shape: "checks", shapeScale: 0.1,
        colors: ["hsl(120, 100%, 25%)", "hsl(140, 100%, 60%)", "hsl(100, 90%, 30%)", "hsl(130, 100%, 70%)"],
      },
      {
        proportion: 0.45, softness: 1.1, distortion: 0.22, swirl: 0.8, swirlIterations: 15, shape: "dots", shapeScale: 0.09,
        colors: ["hsl(30, 100%, 35%)", "hsl(50, 100%, 65%)", "hsl(40, 90%, 40%)", "hsl(45, 100%, 75%)"],
      },
      {
        proportion: 0.38, softness: 0.95, distortion: 0.16, swirl: 0.85, swirlIterations: 11, shape: "checks", shapeScale: 0.11,
        colors: ["hsl(250, 100%, 30%)", "hsl(270, 100%, 65%)", "hsl(260, 90%, 35%)", "hsl(265, 100%, 70%)"],
      }
    ]
    return configs[index % configs.length]
  }

  return (
    <section className="py-24 px-6 bg-white" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#4166F5] text-[24px] md:text-[28px] font-bold leading-[1.3] font-['Manrope'] mb-4">Empowering businesses with AI-driven automation</h2>
            <p className="text-[16px] text-gray-600 max-w-2xl mx-auto leading-[1.6] font-['Inter'] font-normal">
            Everything you need to automate your commerce on WhatsApp and manage your operations smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const shaderConfig = getShaderConfig(index)
            // make the 5th card span 2 cols on lg screens to balance the layout, or just let it be naturally
            const isLast = index === 4;
            
            return (
              <motion.div 
                key={index} 
                className={`relative min-h-[340px] group ${isLast ? 'lg:col-span-2' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: [0.21, 1.02, 0.73, 1] }}
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-90 transition-transform duration-500 group-hover:scale-[1.02]">
                  <Warp
                    style={{ height: "100%", width: "100%" }}
                    proportion={shaderConfig.proportion}
                    softness={shaderConfig.softness}
                    distortion={shaderConfig.distortion}
                    swirl={shaderConfig.swirl}
                    swirlIterations={shaderConfig.swirlIterations}
                    shape={shaderConfig.shape}
                    shapeScale={shaderConfig.shapeScale}
                    scale={1}
                    rotation={0}
                    speed={0.8}
                    colors={shaderConfig.colors}
                  />
                </div>

                <div className="relative z-10 p-8 rounded-3xl h-full flex flex-col bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="mb-6">{feature.icon}</div>

                  <h3 className="text-[20px] md:text-[22px] font-semibold mb-3 text-gray-900 leading-[1.4] font-['Manrope']">{feature.title}</h3>

                  <p className="leading-[1.6] flex-grow text-gray-600 font-normal text-[16px] font-['Inter']">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
