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
    tagline: "Try it free",
    priceMonthly: 0,
    features: [
      { label: "400 leads/month", available: true },
      { label: "1 user", available: true },
      { label: "Facebook ads integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Basic CRM", available: true },
      { label: "Email alerts", available: true },
      { label: "Priority support", available: false },
      { label: "Analytics", available: false },
      { label: "Integrations", available: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Most popular",
    priceMonthly: 29,
    highlight: true,
    features: [
      { label: "3,000 leads/month", available: true },
      { label: "3 users included", available: true },
      { label: "Extra users", available: true, note: "$10/user" },
      { label: "Facebook ads integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Lead tagging & filters", available: true },
      { label: "Email + Slack alerts", available: true },
      { label: "Basic analytics", available: true },
      { label: "30-day lead import", available: true },
      { label: "Priority support", available: false },
      { label: "API access", available: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For teams",
    priceMonthly: 59,
    features: [
      { label: "7,500 leads/month", available: true },
      { label: "5 users included", available: true },
      { label: "Extra users", available: true, note: "$10/user" },
      { label: "Facebook ads integration", available: true },
      { label: "Real-time lead capture", available: true },
      { label: "Lead scoring & routing", available: true },
      { label: "All notification channels", available: true },
      { label: "Full analytics", available: true },
      { label: "90-day lead import", available: true },
      { label: "Priority support", available: true },
      { label: "API access", available: true },
      { label: "Custom workflows", available: true },
    ],
  },
];

export const enterprisePlan: Plan = {
  id: "enterprise",
  name: "Enterprise",
  tagline: "Custom solution",
  priceMonthly: 0,
  features: [
    { label: "Unlimited leads", available: true },
    { label: "Unlimited users", available: true },
    { label: "Dedicated support", available: true },
    { label: "Custom integrations", available: true },
    { label: "SLA guarantee", available: true },
    { label: "On-premise option", available: true },
  ],
};

export function priceFor(billing: BillingCycle, monthlyPrice: number): number {
  if (billing === "yearly") {
    return Math.round(monthlyPrice * 0.75); // ~25% off
  }
  return monthlyPrice;
}
