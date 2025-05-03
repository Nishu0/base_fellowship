"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  CoinsIcon as Token,
  Coins,
  Code,
  Blocks,
  Wallet,
  Database,
  LineChart,
  BarChart3,
  Trophy,
} from "lucide-react"

// Array of blockchain/onchain related icons
const BlockchainIcons = [Github, Token, Coins, Code, Blocks, Wallet, Database, LineChart, BarChart3, Trophy]

// Generate random positions for icons
const generateRandomIcons = (count: number) => {
  return Array.from({ length: count }, () => ({
    Icon: BlockchainIcons[Math.floor(Math.random() * BlockchainIcons.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 16 + Math.random() * 24,
    opacity: 0.1 + Math.random() * 0.3,
    rotation: Math.random() * 360,
    delay: Math.random() * 2,
  }))
}

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [icons] = useState(() => generateRandomIcons(20))

  useEffect(() => {
    // Simulate loading progress from 0 to 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setShowContent(true)
          }, 800) // Wait a bit before showing content
          return 100
        }
        return prev + 1
      })
    }, 25) // Update every 25ms for a total of ~2.5s to reach 100%

    return () => clearInterval(interval)
  }, [])

  // Calculate the X position for the loading text based on progress
  const loadingX = progress * -1.5 // Move left as progress increases
  const progressX = progress * 1.5 // Move right as progress increases

  // Calculate the scale for the FBI text based on progress
  const fbiScale = 1 + (progress / 100) * 0.5 // Scale from 1 to 1.5x

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      {/* Background icons */}
      <div className="absolute inset-0 overflow-hidden">
        {icons.map((icon, index) => {
          const IconComponent = icon.Icon
          return (
            <motion.div
              key={index}
              className="absolute text-black/10"
              initial={{
                x: `${icon.x}vw`,
                y: `${icon.y}vh`,
                rotate: 0,
                opacity: 0,
              }}
              animate={{
                rotate: icon.rotation,
                opacity: icon.opacity * (progress / 50), // Fade in as progress increases
              }}
              transition={{
                delay: icon.delay,
                duration: 1,
              }}
              style={{
                width: icon.size,
                height: icon.size,
              }}
            >
              <IconComponent size={icon.size} />
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4">
        <div className="flex items-center justify-center w-full mb-0 relative h-8">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: loadingX }}
            className="text-black italic absolute left-0 top-1/2 transform -translate-y-1/2"
          >
            Loading
          </motion.span>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: progressX }}
            className="text-black italic absolute right-0 top-1/2 transform -translate-y-1/2"
          >
            in progress
          </motion.span>
        </div>

        <AnimatePresence>
          {!showContent ? (
            <motion.div
              className="w-full flex flex-col items-center"
              exit={{
                opacity: 0,
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {progress === 100 ? (
                  <div className="relative">
                    {/* Left half of FBI that moves left */}
                    <motion.div
                      className="absolute top-0 left-0 w-1/2 overflow-hidden h-full"
                      initial={{ x: 0 }}
                      animate={{ x: -100, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <h1 className="text-6xl md:text-8xl font-bold italic whitespace-nowrap">FBI</h1>
                    </motion.div>

                    {/* Right half of FBI that moves right */}
                    <motion.div
                      className="absolute top-0 right-0 w-1/2 overflow-hidden h-full"
                      initial={{ x: 0 }}
                      animate={{ x: 100, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <h1
                        className="text-6xl md:text-8xl font-bold italic whitespace-nowrap"
                        style={{ marginLeft: "-100%" }}
                      >
                        FBI
                      </h1>
                    </motion.div>
                  </div>
                ) : (
                  <motion.h1
                    className="text-6xl md:text-8xl font-bold italic"
                    animate={{
                      scale: fbiScale,
                    }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    FBI
                  </motion.h1>
                )}
              </motion.div>

              <motion.div
                className="text-center mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm text-black/70">[{progress}%]</span>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Custom GitHub icon */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: progress > 30 ? 0.2 : 0,
          scale: progress > 30 ? 1 : 0.5,
          x: progress > 80 ? -200 : -100,
          y: progress > 80 ? -100 : 0,
        }}
        transition={{ duration: 1 }}
        style={{
          left: "60%",
          top: "30%",
        }}
      >
        <svg
          color="black"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 65 64"
          width="65"
          height="64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_783_7237)">
            <path
              d="M31.9162 63.443C49.466 63.443 63.693 49.2408 63.693 31.7215C63.693 14.2022 49.466 0 31.9162 0C15.2659 0 1.60658 12.7835 0.25 29.055H42.2517V34.388H0.25C1.60658 50.6595 15.2659 63.443 31.9162 63.443Z"
              fill="currentColor"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0_783_7237">
              <rect width="64" height="64" fill="currentColor" transform="translate(0.25)"></rect>
            </clipPath>
          </defs>
        </svg>
      </motion.div>

      {/* Custom Token icon */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: progress > 50 ? 0.2 : 0,
          scale: progress > 50 ? 1 : 0.5,
          x: progress > 80 ? 200 : 100,
          y: progress > 80 ? -100 : 0,
        }}
        transition={{ duration: 1 }}
        style={{
          right: "60%",
          top: "30%",
        }}
      >
        <svg className="text-black/20" focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="64" height="64">
          <path
            d="m21 7-9-5-9 5v10l9 5 9-5zm-9-2.71 5.91 3.28-3.01 1.67C14.17 8.48 13.14 8 12 8s-2.17.48-2.9 1.24L6.09 7.57zm-1 14.87-6-3.33V9.26L8.13 11c-.09.31-.13.65-.13 1 0 1.86 1.27 3.43 3 3.87zM10 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2m3 7.16v-3.28c1.73-.44 3-2.01 3-3.87 0-.35-.04-.69-.13-1.01L19 9.26v6.57z"
            fill="currentColor"
          ></path>
        </svg>
      </motion.div>

      {/* Onchain Score */}
      <motion.div
        className="absolute flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{
          opacity: progress > 60 ? 0.3 : 0,
          y: progress > 80 ? 150 : 100,
        }}
        transition={{ duration: 1 }}
        style={{
          bottom: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Blocks className="text-black/30" size={24} />
        <span className="text-black/30 font-mono">Onchain Score: {Math.floor(progress * 0.8)}</span>
      </motion.div>
    </div>
  )
}
