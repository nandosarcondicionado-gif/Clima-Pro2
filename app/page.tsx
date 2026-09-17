import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { hasPermission } from "../lib/permissoes";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const permitido = await hasPermission("dashboard", "visualizar");

  if (!permitido) {
    redirect("/login");
  }

  return <DashboardClient />;
}
