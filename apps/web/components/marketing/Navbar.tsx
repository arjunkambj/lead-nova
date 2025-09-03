"use client";

import { useEffect, useState } from "react";
import { Logo } from "../shared/Logo";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";

const navlinks = [
  {
    href: "/home",
    label: "Features",
  },
  {
    href: "/pricing",
    label: "Pricing",
  },
  {
    href: "/partners",
    label: "Partners",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header
      className={`absolute top-0 py-3 px-2 mx-auto justify-between items-center z-20 w-full ${
        isScrolled
          ? "bg-content1 border border-divider rounded-2xl scale-[.98] mt-3 max-w-5xl mx-auto transition-all duration-300"
          : " max-w-7xl mx-auto border-hidden"
      }`}
    >
      <div className="flex items-center gap-2  flex justify-between w-full">
        <Logo />

        <div className="flex items-center gap-8">
          {navlinks.map((link) => (
            <NavbarLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
        <Authenticated>
          <Button color="primary" radius="sm" as={Link} href="/overview">
            Go to App
          </Button>
        </Authenticated>
        <Unauthenticated>
          <Button color="primary" radius="sm" as={Link} href="/sign-in">
            Get Started
          </Button>
        </Unauthenticated>
      </div>
    </header>
  );
};

const NavbarLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link
      href={href}
      className="text-sm font-medium hover:underline underline-offset-8 hover:text-primary"
    >
      {label}
    </Link>
  );
};
