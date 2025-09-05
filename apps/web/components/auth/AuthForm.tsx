import GoogleAuth from "./components/GoogleAauth";

export default function AuthForm() {
  return (
    <div className="flex flex-col gap-4 max-w-sm w-full items-center">
      <GoogleAuth />
    </div>
  );
}
