import OrganizationForm from "@/components/onboarding/OrganizationForm";

export default function CreateOrganizationPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Create Organization</h1>
      <p className="text-default-500 text-sm mb-8">Set up your workspace</p>
      <OrganizationForm />
    </div>
  );
}