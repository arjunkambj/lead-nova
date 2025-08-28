import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import Logo from "@/components/shared/Logo";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="h-dvh w-full flex">
      <div className="absolute top-5 left-4">
        <Logo className="text-foreground" />
      </div>
      <ThemeSwitch />

      <div className="h-full w-3/5 flex">
        {/* Left: Progress + Content */}
        <div className="flex flex-col items-start justify-center gap-12 p-12 h-full w-full max-w-2xl mx-auto">
          <OnboardingProgress />
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      {/* Right: 2/5 panel */}
      <div className="h-full w-2/5 border-l border-default-200/50 bg-gradient-to-br from-default-50 via-default-50 to-default-100" />
    </section>
  );
}
