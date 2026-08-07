import { UsersManager } from "@/components/panel/users-manager";
import { requireAdmin } from "@/lib/session";

export default async function AdminUsers() {
  const user = await requireAdmin();
  return <UsersManager currentUserId={user!.id} />;
}
