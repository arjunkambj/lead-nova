export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-dvh flex items-center justify-center">{children}</div>;
}
