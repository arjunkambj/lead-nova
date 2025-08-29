import AuthRightSide from "@/components/auth/AuthRightSide";
import Logo from "@/components/shared/Logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-background">
      <Logo className="absolute left-6 top-6 z-10" />
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <AuthRightSide className="hidden lg:flex lg:w-1/2" />
    </section>
  );
}
