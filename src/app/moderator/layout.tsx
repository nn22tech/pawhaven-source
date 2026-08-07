import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSiteSettings } from "@/lib/site-settings";
import { PanelShell } from "@/components/panel/panel-shell";

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/moderator");
  const settings = await getSiteSettings();
  return (
    <PanelShell
      role="MODERATOR"
      userName={user.name}
      userEmail={user.email}
      siteName={settings.siteName}
    >
      {children}
    </PanelShell>
  );
}
