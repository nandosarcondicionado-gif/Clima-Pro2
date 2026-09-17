import { redirect } from "next/navigation";
import { hasPermission } from "../../../lib/permissoes";

export default async function ContasReceberPage() {
  const permitido = await hasPermission("financeiro", "visualizar");

  if (!permitido) {
    redirect("/?acesso=negado");
  }

  redirect("/financeiro/contas");
}
