"use client";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div>
      <Authenticated>
        <Button color="primary">Dashboard</Button>
      </Authenticated>
      <Unauthenticated>
        <Button as={Link} href="/sign-in" color="primary">
          Sign in
        </Button>
      </Unauthenticated>
    </div>
  );
}
