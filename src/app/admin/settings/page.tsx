import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsManager } from "@/components/panel/site-settings-manager";

export default async function AdminSettings() {
  const settings = await getSiteSettings();
  return <SiteSettingsManager initial={settings} />;
}
