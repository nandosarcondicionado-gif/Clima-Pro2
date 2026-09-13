import { redirect } from "next/navigation";
import { hasPermission } from "../../lib/permissoes";
import FinanceiroClient from "./FinanceiroClient";

export default async function FinanceiroPage() {
  const permitido = await hasPermission("financeiro", "visualizar");

  if (!permitido) {
    redirect("/?acesso=negado");
  }

  return <FinanceiroClient />;
}
