import OnboardingCard from "@/components/onboarding/OnboardingCard";
import MetaConnect from "@/components/onboarding/MetaConnect";

export default function MetaConnectPage() {
  return (
    <OnboardingCard
      title="Connect Your Facebook Page"
      subtitle="Start receiving leads from your Facebook ads"
    >
      <MetaConnect />
    </OnboardingCard>
  );
}