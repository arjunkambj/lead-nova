export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="h-dvh flex w-full px-4 md:px-6 py-4 bg-content1">
      <div className="w-[35%] hidden md:flex flex-col rounded-3xl px-6 py-4 h-full bg-content2/80 backdrop-blur-lg">
        {/* TODO: We need Progress Bar here */}
      </div>
      <div className="w-[65%] px-4 md:px-6 flex justify-center">{children}</div>
    </section>
  );
}
