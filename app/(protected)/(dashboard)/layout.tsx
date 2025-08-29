import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AuthRedirect from "@/components/shared/AuthRedirect";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Check if user is onboarded, redirect to /onboarding if not */}
      <AuthRedirect
        requireOnboarded={true}
        redirectTo="/onboarding/create-organization"
      />

      <div className="flex h-screen w-full bg-background">
        <aside className="h-full border-r border-default-200">
          <DashboardSidebar />
        </aside>
        <main className="flex flex-col min-w-0 w-full">
          <section className="flex-1 px-8 py-6 overflow-auto">
            {children}
          </section>
        </main>
      </div>
    </>
  );
}
