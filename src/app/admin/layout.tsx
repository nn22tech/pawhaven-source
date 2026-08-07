import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSiteSettings } from "@/lib/site-settings";
import { PanelShell } from "@/components/panel/panel-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/moderator");
  const settings = await getSiteSettings();
  return (
    <PanelShell
      role="ADMIN"
      userName={user.name}
      userEmail={user.email}
      siteName={settings.siteName}
    >
      {children}
    </PanelShell>
  );
}
