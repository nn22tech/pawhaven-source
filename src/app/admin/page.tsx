import { Dashboard } from "@/components/panel/dashboard";
import { getCurrentUser } from "@/lib/session";

export default async function AdminHome() {
  const user = await getCurrentUser();
  return <Dashboard role="ADMIN" />;
}
