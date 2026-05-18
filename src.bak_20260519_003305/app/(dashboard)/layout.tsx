import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 p-4 md:p-10 max-w-6xl w-full">
        {children}
      </main>
    </div>
  );
}
