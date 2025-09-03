import Sidebar from "@/components/layouts/DashboardSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="h-dvh flex w-full">
      <aside className="h-full">
        <Sidebar />
      </aside>
      <main className="h-full w-full bg-content2 py-1">
        <section className="flex-1 bg-content1 rounded-l-2xl p-4 h-full w-full">
          {children}
        </section>
      </main>
    </section>
  );
}
