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

export type PermissionAction =
  | "visualizar"
  | "criar"
  | "editar"
  | "excluir";

export const permissionModules = [
  {
    id: "dashboard",
    nome: "Dashboard",
  },
  {
    id: "clientes",
    nome: "Clientes",
  },
  {
    id: "equipamentos",
    nome: "Equipamentos",
  },
  {
    id: "orcamentos",
    nome: "Orçamentos",
  },
  {
    id: "ordens-servico",
    nome: "Ordens de Serviço",
  },
  {
    id: "agenda",
    nome: "Agenda",
  },
  {
    id: "contratos",
    nome: "Contratos",
  },
  {
    id: "financeiro",
    nome: "Financeiro",
  },
  {
    id: "estoque",
    nome: "Estoque",
  },
  {
    id: "relatorios",
    nome: "Relatórios",
  },
  {
    id: "tecnicos",
    nome: "Técnicos",
  },
  {
    id: "tecnico",
    nome: "Área do Técnico",
  },
  {
    id: "area-cliente",
    nome: "Área do Cliente",
  },
  {
    id: "configuracoes",
    nome: "Configurações",
  },
] as const;

export const permissionActions = [
  {
    id: "visualizar",
    nome: "Visualizar",
  },
  {
    id: "criar",
    nome: "Criar",
  },
  {
    id: "editar",
    nome: "Editar",
  },
  {
    id: "excluir",
    nome: "Excluir",
  },
] as const;
