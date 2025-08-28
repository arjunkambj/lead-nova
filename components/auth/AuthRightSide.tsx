"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const AuthRightSide = React.memo(function AuthRightSide({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative h-screen overflow-hidden bg-gradient-to-br from-primary-100 via-secondary-50 to-primary-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 ${className}`}
    >
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tl from-secondary-200/40 via-transparent to-primary-200/40 dark:from-secondary-900/20 dark:via-transparent dark:to-primary-900/20" />

        {/* Large floating gradient orbs */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary-300/30 to-primary-500/20 blur-3xl dark:from-primary-600/20 dark:to-primary-800/10"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-secondary-300/30 to-secondary-500/20 blur-3xl dark:from-secondary-600/20 dark:to-secondary-800/10"
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 25, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-warning-200/20 to-success-200/20 blur-3xl dark:from-warning-800/10 dark:to-success-800/10"
        />
        <motion.div
          animate={{
            y: [0, 35, 0],
            x: [0, -30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-1/3 left-1/3 h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-primary-400/25 via-secondary-400/20 to-primary-300/25 blur-3xl dark:from-primary-700/15 dark:via-secondary-700/10 dark:to-primary-600/15"
        />
      </div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Modern Gradient Mesh Testimonial Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, type: "spring", stiffness: 100 }}
        className="absolute bottom-8 right-8 max-w-md"
      >
        <div className="relative group">
          {/* Main card with gradient mesh background */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 via-secondary-100 to-primary-100 dark:from-primary-900/80 dark:via-secondary-900/60 dark:to-primary-800/80">
              <div className="absolute top-0 -right-20 h-40 w-40 rounded-full bg-secondary-300/50 blur-3xl dark:bg-secondary-700/30" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary-300/60 blur-2xl dark:bg-primary-700/40" />
              <div className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-2xl dark:bg-white/10" />
            </div>

            {/* Glass overlay */}
            <div className="relative backdrop-blur-sm bg-white/30 dark:bg-black/20 border border-white/30 dark:border-white/10 p-6">
              {/* Quote icon */}
              <svg
                className="absolute top-4 right-4 h-8 w-8 text-primary-600/20 dark:text-primary-400/20"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
                    alt="Customer"
                    className="h-14 w-14 rounded-full object-cover"
                    width={56}
                    height={56}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-800 dark:text-white/90 leading-relaxed mb-4 font-medium">
                    &quot;LeadNova revolutionized our lead management workflow.
                    The seamless Meta integration and real-time updates saved us
                    10+ hours weekly.&quot;
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-default-900 dark:text-white">
                        Alex Mitchell
                      </p>
                      <p className="text-xs text-default-600 dark:text-white/70 font-medium">
                        Growth Manager, Helio
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 fill-warning-500 drop-shadow-sm"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary-500/50 to-transparent" />
    </div>
  );
});

export default AuthRightSide;
