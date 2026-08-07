import { withAuth } from "next-auth/middleware";

// Protect hidden admin & moderator panels. Public storefront (`/`) and
// the `/login` page remain accessible. The actual role check (admin vs
// moderator) happens inside each panel's server component.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/admin/:path*", "/moderator/:path*"],
};
