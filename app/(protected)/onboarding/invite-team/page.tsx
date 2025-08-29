import TeamInviteForm from "@/components/onboarding/TeamInviteForm";

export default function InviteTeamPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Invite Team</h1>
      <p className="text-default-500 text-sm mb-8">Add team members</p>
      <TeamInviteForm />
    </div>
  );
}
