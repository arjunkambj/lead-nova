import OnboardingOverview from "@/components/onboarding/OnboardingOverview";

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">All Set!</h1>
      <p className="text-default-500 text-sm mb-8">Your workspace is ready</p>
      <OnboardingOverview />
    </div>
  );
}
