export type BillingCycle = "monthly" | "yearly";

export type PlanTier = "starter" | "professional" | "business" | "enterprise";

export type Plan = {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number; // USD per month
  highlight?: boolean;
  features: Array<{ label: string; available: boolean; note?: string }>;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for getting started",
    priceMonthly: 0,
    features: [
      { label: "230 free leads per month", available: true },
      { label: "1 team member", available: true },
      { label: "Meta/Facebook integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Basic lead management", available: true },
      { label: "Email notifications", available: true },
      { label: "Priority support", available: false },
      { label: "Advanced analytics", available: false },
      { label: "API access", available: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing teams",
    priceMonthly: 29,
    highlight: true,
    features: [
      { label: "3,000 leads per month", available: true },
      { label: "3 team members included", available: true },
      { label: "Additional seats", available: true, note: "$10/month" },
      { label: "Meta/Facebook integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Advanced lead management", available: true },
      { label: "Email & webhook notifications", available: true },
      { label: "Lead analytics & reporting", available: true },
      { label: "30-day historical sync", available: true },
      { label: "Priority support", available: false },
      { label: "API access", available: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For established businesses",
    priceMonthly: 59,
    features: [
      { label: "7,500 leads per month", available: true },
      { label: "5 team members included", available: true },
      { label: "Additional seats", available: true, note: "$10/month" },
      { label: "Meta/Facebook integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Advanced lead management", available: true },
      { label: "Email & webhook notifications", available: true },
      { label: "Advanced analytics & reporting", available: true },
      { label: "90-day historical sync", available: true },
      { label: "Priority support", available: true },
      { label: "API access", available: true },
      { label: "Custom integrations", available: true },
    ],
  },
];

export const enterprisePlan: Plan = {
  id: "enterprise",
  name: "Enterprise",
  tagline: "Custom solutions for large teams",
  priceMonthly: 0,
  features: [
    { label: "Unlimited leads", available: true },
    { label: "Unlimited team members", available: true },
    { label: "Dedicated account manager", available: true },
    { label: "Custom integrations", available: true },
    { label: "SLA guarantee", available: true },
    { label: "On-premise deployment option", available: true },
  ],
};

export function priceFor(billing: BillingCycle, monthlyPrice: number): number {
  if (billing === "yearly") {
    return Math.round(monthlyPrice * 0.75); // ~25% off
  }
  return monthlyPrice;
}
