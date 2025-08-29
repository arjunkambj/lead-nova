"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import HeroAppBox from "./components/HeroAppBox";

const AVATAR_URLS = [1, 2, 3, 4, 5].map(
  (n) => `https://i.pravatar.cc/80?img=${n}`,
);

export default function Hero() {
  return (
    <section className="relative w-full px-6 lg:px-8 pt-32 md:pt-44 pb-20">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full bg-content1 px-4 py-1.5 ring-1 ring-divider mb-8"
        >
          <div className="flex -space-x-2">
            {AVATAR_URLS.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-full ring-2 ring-default-200 object-cover"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-default-600">
            Trusted by 1,000+ businesses
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-default-900"
        >
          Facebook Lead Management
          <br className="hidden sm:block" />
          Made Simple
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6 text-base md:text-lg text-default-600 max-w-2xl mx-auto"
        >
          Capture leads from Meta instantly. Assign to team. Track conversions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            color="primary"
            as={Link}
            href="/signin"
            size="lg"
            endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
          >
            Get Started
          </Button>
          <Button as={Link} href="#features" variant="flat" size="lg">
            Learn More
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16"
      >
        <HeroAppBox />
      </motion.div>
    </section>
  );
}
