import { createClient as createServerClient } from "../supabase/server";

export type PermissionAction =
  | "visualizar"
  | "criar"
  | "editar"
  | "excluir";

export type PermissionModule =
  | "dashboard"
  | "clientes"
  | "equipamentos"
  | "orcamentos"
  | "ordens-servico"
  | "agenda"
  | "contratos"
  | "financeiro"
  | "estoque"
  | "relatorios"
  | "tecnicos"
  | "tecnico"
  | "area-cliente"
  | "configuracoes";

type PermissionRow = {
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
};

export async function hasPermission(
  modulo: PermissionModule,
  acao: PermissionAction
): Promise<boolean> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: funcionario } = await supabase
    .from("funcionarios")
    .select("funcao, status")
    .eq("id", user.id)
    .single();

  if (!funcionario || funcionario.status !== "ativo") {
    return false;
  }

  // Administrador tem acesso total ao sistema.
  if (funcionario.funcao === "administrador") {
    return true;
  }

  const { data: permission } = await supabase
    .from("permissoes_funcionarios")
    .select("visualizar, criar, editar, excluir")
    .eq("funcionario_id", user.id)
    .eq("modulo", modulo)
    .maybeSingle();

  const permissionData = permission as PermissionRow | null;

  if (!permissionData) {
    return false;
  }

  return permissionData[acao] === true;
}
