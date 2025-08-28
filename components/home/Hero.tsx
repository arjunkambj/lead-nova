"use client";

import { Button, Spacer } from "@heroui/react";
import HeroAppBox from "./components/HeroAppBox";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { memo } from "react";

// Static data moved outside components to prevent recreation
const AVATAR_URLS = [1, 2, 3, 4, 5].map(
  (n) => `https://i.pravatar.cc/80?img=${n}`
);

export default function Hero() {
  return (
    <section
      id="features"
      className="relative w-full overflow-hidden sm:px-6 lg:px-8 pt-32 md:pt-44 pb-28 scroll-mt-28"
    >
      {/* Subtle background glows */}

      {/* Radial Gradient Background from Bottom */}

      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full bg-content1 px-4 py-1.5 ring-1 ring-divider"
        >
          <HeroAvatarGroup />
          <span className="text-xs font-semibold text-default-600">
            Trusted by 1,000+ businesses
          </span>
        </motion.div>

        <Spacer y={4} />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="font-extrabold tracking-tight text-4xl sm:text-5xl md:text-[56px] xl:text-[64px] leading-[1.08] bg-gradient-to-r from-default-900 to-default-700 bg-clip-text text-transparent"
        >
          Capture. Assign. Convert.
          <br className="hidden sm:block" />
          All in One CRM.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-3 text-[15px] sm:text-base md:text-[18px] text-default-600 max-w-2xl mx-auto"
        >
          Lead Nova helps you instantly capture leads from Meta Ads and other
          sources, assign them to your team, and track every step until
          conversion—all in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-6 flex  items-center justify-center gap-3"
        >
          <Button
            color="primary"
            as={Link}
            href="/signin"
            size="lg"
            endContent={<Icon icon="lucide:chevron-right" width={20} />}
          >
            Start Free
          </Button>
          <Button
            as={Link}
            href="#pricing"
            variant="flat"
            color="default"
            size="lg"
            className="px-8"
          >
            See How It Works
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-3 text-xs sm:text-sm text-default-500"
        >
          14-Day Money-Back Guarantee
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-10 md:mt-10"
      >
        <HeroAppBox />
      </motion.div>
    </section>
  );
}

// Memoized component to prevent unnecessary re-renders
const HeroAvatarGroup = memo(() => {
  return (
    <div className="flex -space-x-2">
      {AVATAR_URLS.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={`User ${idx + 1}`}
          width={24}
          height={24}
          className="h-6 w-6 rounded-full ring-2 ring-default-200 object-cover"
        />
      ))}
    </div>
  );
});

HeroAvatarGroup.displayName = "HeroAvatarGroup";
