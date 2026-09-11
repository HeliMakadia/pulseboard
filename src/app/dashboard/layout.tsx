import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <div className="fixed right-6 top-4 z-50">
        <UserMenu
          name={session.user.name}
          email={session.user.email}
        />
      </div>

      {children}
    </div>
  );
}