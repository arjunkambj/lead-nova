import { Divider } from "@heroui/divider";
import SidebarToggle from "@/components/dashboard/SidebarToggle";
import UserProfile from "./UserProfile";

interface MainHeaderProps {
  title: string;
}

export default function MainHeader({ title }: MainHeaderProps) {
  return (
    <div className="mb-6">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-4">
          <SidebarToggle />
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        <UserProfile />
      </div>

      <Divider className="bg-default-100" />
    </div>
  );
}
