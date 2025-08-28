import Logo from "@/components/shared/Logo";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import AuthRedirect from "@/components/shared/AuthRedirect";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Check if user is NOT onboarded, redirect to /overview if already onboarded */}
      <AuthRedirect requireOnboarded={false} />
      
      <section className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6">
          <Logo className="text-foreground" />
          <ThemeSwitch />
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-8 py-12">
          {/* Progress Indicator */}
          <OnboardingProgress />
          
          {/* Form Content */}
          <div className="mt-16">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
