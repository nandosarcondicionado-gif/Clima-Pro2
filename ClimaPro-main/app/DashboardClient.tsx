"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Snowflake,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { createClient } from "../lib/supabase/client";

type PermissionModule =
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

type Permission = {
  modulo: PermissionModule;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
};

type MenuItem = {
  name: string;
  icon: React.ElementType;
  path: string;
  modulo: PermissionModule;
};

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    modulo: "dashboard",
  },
  {
    name: "Clientes",
    icon: Users,
    path: "/clientes",
    modulo: "clientes",
  },
  {
    name: "Equipamentos",
    icon: Snowflake,
    path: "/equipamentos",
    modulo: "equipamentos",
  },
  {
    name: "Orçamentos",
    icon: FileText,
    path: "/orcamentos",
    modulo: "orcamentos",
  },
  {
    name: "Ordens de serviço",
    icon: ClipboardList,
    path: "/ordens-servico",
    modulo: "ordens-servico",
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/agenda",
    modulo: "agenda",
  },
  {
    name: "Contratos",
    icon: FileText,
    path: "/contratos",
    modulo: "contratos",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
    modulo: "financeiro",
  },
  {
    name: "Estoque",
    icon: Package,
    path: "/estoque",
    modulo: "estoque",
  },
  {
    name: "Relatórios",
    icon: FileText,
    path: "/relatorios",
    modulo: "relatorios",
  },
  {
    name: "Técnicos",
    icon: Wrench,
    path: "/funcionarios",
    modulo: "tecnicos",
  },
  {
    name: "Área do técnico",
    icon: Wrench,
    path: "/tecnico",
    modulo: "tecnico",
  },
  {
    name: "Área do cliente",
    icon: Users,
    path: "/area-cliente",
    modulo: "area-cliente",
  },
  {
    name: "Configurações",
    icon: Settings,
    path: "/configuracoes",
    modulo: "configuracoes",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: funcionario, error: funcionarioError } =
          await supabase
            .from("funcionarios")
            .select("funcao, status")
            .eq("id", user.id)
            .single();

        if (
          funcionarioError ||
          !funcionario ||
          funcionario.status !== "ativo"
        ) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        if (funcionario.funcao === "administrador") {
          setIsAdmin(true);
          setLoadingPermissions(false);
          return;
        }

        const { data: permissionData, error: permissionError } =
          await supabase
            .from("permissoes_funcionarios")
            .select(
              "modulo, visualizar, criar, editar, excluir"
            )
            .eq("funcionario_id", user.id);

        if (permissionError) {
          console.error(
            "Erro ao carregar permissões:",
            permissionError
          );

          setPermissions([]);
          setLoadingPermissions(false);
          return;
        }

        setPermissions(
          (permissionData ?? []) as Permission[]
        );
      } catch (error) {
        console.error(
          "Erro ao carregar permissões:",
          error
        );
      } finally {
        setLoadingPermissions(false);
      }
    }

    loadPermissions();
  }, [router, supabase]);

  function hasVisualPermission(
    modulo: PermissionModule
  ) {
    if (isAdmin) {
      return true;
    }

    return permissions.some(
      (permission) =>
        permission.modulo === modulo &&
        permission.visualizar === true
    );
  }

  const visibleMenuItems = menuItems.filter((item) =>
    hasVisualPermission(item.modulo)
  );

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setOpen(false);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (loadingPermissions) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Snowflake className="mx-auto mb-4 h-10 w-10 animate-pulse text-cyan-400" />

          <p className="text-sm text-slate-400">
            Carregando seu acesso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* CABEÇALHO */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <Snowflake className="h-8 w-8 text-cyan-400" />

            <span className="text-xl font-bold">
              ClimaPro
            </span>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate(item.path)}
                className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* BOTÃO SAIR DA LATERAL */}
        <div className="shrink-0 border-t border-slate-700 bg-slate-900 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span>
              {loggingOut ? "Saindo..." : "Sair"}
            </span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="lg:pl-72">
        <header className="flex h-20 items-center border-b border-slate-800 bg-slate-950 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mr-4 rounded-xl p-2 hover:bg-slate-800 lg:hidden"
          >
            <Menu />
          </button>

          {/* TÍTULO + BOTÃO SAIR */}
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold">
                Dashboard
              </h1>

              <p className="text-xs text-slate-500">
                Visão geral do ClimaPro
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sair do sistema"
              className="flex shrink-0 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">
                {loggingOut ? "Saindo..." : "Sair"}
              </span>
            </button>
          </div>
        </header>

        <section className="p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hasVisualPermission("financeiro") && (
              <Card
                title="Faturamento"
                value="R$ 0,00"
                description="Este mês"
                icon={<DollarSign />}
              />
            )}

            {hasVisualPermission("ordens-servico") && (
              <Card
                title="Serviços"
                value="0"
                description="Este mês"
                icon={<Wrench />}
              />
            )}

            {hasVisualPermission("clientes") && (
              <Card
                title="Clientes"
                value="0"
                description="Cadastrados"
                icon={<Users />}
                onClick={() => navigate("/clientes")}
              />
            )}

            {hasVisualPermission("equipamentos") && (
              <Card
                title="Equipamentos"
                value="0"
                description="Cadastrados"
                icon={<Snowflake />}
                onClick={() =>
                  navigate("/equipamentos")
                }
              />
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-bold">
              Acesso rápido
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hasVisualPermission("clientes") && (
                <QuickButton
                  text="Novo cliente"
                  onClick={() =>
                    navigate("/clientes")
                  }
                />
              )}

              {hasVisualPermission("orcamentos") && (
                <QuickButton
                  text="Novo orçamento"
                  onClick={() =>
                    navigate("/orcamentos")
                  }
                />
              )}

              {hasVisualPermission(
                "ordens-servico"
              ) && (
                <QuickButton
                  text="Nova ordem de serviço"
                  onClick={() =>
                    navigate("/ordens-servico")
                  }
                />
              )}

              {hasVisualPermission("agenda") && (
                <QuickButton
                  text="Abrir agenda"
                  onClick={() =>
                    navigate("/agenda")
                  }
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  description,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-cyan-500"
    >
      <div className="mb-4 text-cyan-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </button>
  );
}

function QuickButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left text-sm font-semibold hover:border-cyan-500 hover:bg-slate-800"
    >
      {text}
    </button>
  );
}
