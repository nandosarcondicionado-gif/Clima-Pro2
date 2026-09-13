"use client";

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  User,
  UserCog,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type Role =
  | "Administrador"
  | "Gerente"
  | "Atendente"
  | "Técnico"
  | "Financeiro";

type EmployeeStatus = "Ativo" | "Inativo";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  city: string;
  status: EmployeeStatus;
};

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

const permissionModules: {
  id: PermissionModule;
  label: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "clientes",
    label: "Clientes",
  },
  {
    id: "equipamentos",
    label: "Equipamentos",
  },
  {
    id: "orcamentos",
    label: "Orçamentos",
  },
  {
    id: "ordens-servico",
    label: "Ordens de Serviço",
  },
  {
    id: "agenda",
    label: "Agenda",
  },
  {
    id: "contratos",
    label: "Contratos",
  },
  {
    id: "financeiro",
    label: "Financeiro",
  },
  {
    id: "estoque",
    label: "Estoque",
  },
  {
    id: "relatorios",
    label: "Relatórios",
  },
  {
    id: "tecnicos",
    label: "Técnicos",
  },
  {
    id: "tecnico",
    label: "Área do Técnico",
  },
  {
    id: "area-cliente",
    label: "Área do Cliente",
  },
  {
    id: "configuracoes",
    label: "Configurações",
  },
];

function createEmptyPermissions(): Permission[] {
  return permissionModules.map((module) => ({
    modulo: module.id,
    visualizar: false,
    criar: false,
    editar: false,
    excluir: false,
  }));
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "ADM",
    email: "admin@climapro.com",
    phone: "",
    role: "Administrador",
    city: "Araraquara",
    status: "Ativo",
  },
];

const roleStyles: Record<Role, string> = {
  Administrador: "bg-red-50 text-red-700 border-red-200",
  Gerente: "bg-purple-50 text-purple-700 border-purple-200",
  Atendente: "bg-blue-50 text-blue-700 border-blue-200",
  Técnico: "bg-amber-50 text-amber-700 border-amber-200",
  Financeiro: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const roleDescriptions: Record<Role, string> = {
  Administrador: "Acesso total ao sistema.",
  Gerente: "Acesso operacional e gestão da equipe.",
  Atendente: "Clientes, agenda, orçamentos e ordens de serviço.",
  Técnico: "Serviços, ordens de serviço e área do técnico.",
  Financeiro: "Acesso aos dados e operações financeiras.",
};

const roleToDatabase: Record<Role, string> = {
  Administrador: "administrador",
  Gerente: "gerente",
  Atendente: "atendente",
  Técnico: "tecnico",
  Financeiro: "financeiro",
};

const databaseToRole: Record<string, Role> = {
  administrador: "Administrador",
  gerente: "Gerente",
  atendente: "Atendente",
  tecnico: "Técnico",
  financeiro: "Financeiro",
};

export default function FuncionariosPage() {
  const [employees, setEmployees] =
    useState<Employee[]>(initialEmployees);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Técnico");
  const [city, setCity] = useState("Araraquara");

  const [permissions, setPermissions] = useState<Permission[]>(
    createEmptyPermissions()
  );

  const [permissionsLoading, setPermissionsLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch("/api/funcionarios");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const realEmployees: Employee[] = (data.employees ?? []).map(
          (employee: {
            id: string;
            nome: string;
            email: string;
            telefone?: string | null;
            cidade?: string | null;
            funcao: string;
            status: string;
          }) => ({
            id: employee.id,
            name: employee.nome,
            email: employee.email,
            phone: employee.telefone ?? "",
            role:
              databaseToRole[employee.funcao] ?? "Técnico",
            city: employee.cidade ?? "Não informado",
            status:
              employee.status === "ativo"
                ? "Ativo"
                : "Inativo",
          })
        );

        setEmployees(realEmployees);
      } catch {
        // Mantém a tela funcionando mesmo se a API falhar.
      }
    }

    loadEmployees();
  }, []);

  function resetForm() {
    setEditingEmployee(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("Técnico");
    setCity("Araraquara");
    setPermissions(createEmptyPermissions());
    setPermissionsLoading(false);
    setFormError("");
  }

  function openNewEmployeeForm() {
    resetForm();
    setShowForm(true);
  }

  async function loadEmployeePermissions(id: string) {
    setPermissionsLoading(true);
    setFormError("");

    try {
      const response = await fetch(
        `/api/funcionarios/${id}/permissoes`
      );

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error ||
            "Não foi possível carregar as permissões."
        );
        return;
      }

      const savedPermissions = data.permissions ?? [];

      const mergedPermissions = permissionModules.map(
        (module) => {
          const saved = savedPermissions.find(
            (item: Permission) =>
              item.modulo === module.id
          );

          return {
            modulo: module.id,
            visualizar: saved?.visualizar === true,
            criar: saved?.criar === true,
            editar: saved?.editar === true,
            excluir: saved?.excluir === true,
          };
        }
      );

      setPermissions(mergedPermissions);
    } catch {
      setFormError(
        "Erro de conexão ao carregar as permissões."
      );
    } finally {
      setPermissionsLoading(false);
    }
  }

  function startEditing(employee: Employee) {
    setEditingEmployee(employee);

    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setRole(employee.role);
    setCity(employee.city);

    setPassword("");
    setPermissions(createEmptyPermissions());
    setFormError("");
    setShowForm(true);

    loadEmployeePermissions(employee.id);
  }

  function updatePermission(
    module: PermissionModule,
    action:
      | "visualizar"
      | "criar"
      | "editar"
      | "excluir",
    value: boolean
  ) {
    setPermissions((current) =>
      current.map((permission) =>
        permission.modulo === module
          ? {
              ...permission,
              [action]: value,
            }
          : permission
      )
    );
  }

  async function savePermissions(employeeId: string) {
    const response = await fetch(
      `/api/funcionarios/${employeeId}/permissoes`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Não foi possível salvar as permissões."
      );
    }

    return data;
  }

  async function addEmployee(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setFormError("");

    if (!name.trim() || !email.trim()) {
      setFormError("Nome e e-mail são obrigatórios.");
      return;
    }

    if (!password || password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/funcionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          city: city.trim(),
          role: roleToDatabase[role as Role],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error ||
            "Não foi possível cadastrar o funcionário."
        );
        setLoading(false);
        return;
      }

      const createdEmployee: Employee = {
        id: data.employee.id,
        name: data.employee.nome,
        email: data.employee.email,
        phone: data.employee.telefone ?? phone.trim(),
        role:
          databaseToRole[data.employee.funcao] ??
          (role as Role),
        city:
          data.employee.cidade ??
          city.trim(),
        status:
          data.employee.status === "ativo"
            ? "Ativo"
            : "Inativo",
      };

      setEmployees((current) => [
        ...current,
        createdEmployee,
      ]);

      try {
        await savePermissions(createdEmployee.id);

        resetForm();
        setShowForm(false);
      } catch (permissionError) {
        setEditingEmployee(createdEmployee);
        setName(createdEmployee.name);
        setEmail(createdEmployee.email);
        setPhone(createdEmployee.phone);
        setRole(createdEmployee.role);
        setCity(createdEmployee.city);
        setPassword("");

        setFormError(
          permissionError instanceof Error
            ? permissionError.message
            : "Funcionário criado, mas não foi possível salvar as permissões. Tente salvar novamente."
        );
      }
    } catch {
      setFormError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function updateEmployee(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!editingEmployee) {
      return;
    }

    setFormError("");

    if (!name.trim() || !email.trim()) {
      setFormError("Nome e e-mail são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/funcionarios/${editingEmployee.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            city: city.trim(),
            role: roleToDatabase[role as Role],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error ||
            "Não foi possível atualizar o funcionário."
        );
        setLoading(false);
        return;
      }

      const updatedEmployee: Employee = {
        id: data.employee.id,
        name: data.employee.nome,
        email: data.employee.email,
        phone: data.employee.telefone ?? phone.trim(),
        role:
          databaseToRole[data.employee.funcao] ??
          (role as Role),
        city:
          data.employee.cidade ??
          city.trim(),
        status:
          data.employee.status === "ativo"
            ? "Ativo"
            : "Inativo",
      };

      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingEmployee.id
            ? updatedEmployee
            : employee
        )
      );

      try {
        await savePermissions(editingEmployee.id);

        resetForm();
        setShowForm(false);
      } catch (permissionError) {
        setEditingEmployee(updatedEmployee);

        setFormError(
          permissionError instanceof Error
            ? permissionError.message
            : "Os dados foram atualizados, mas não foi possível salvar as permissões."
        );
      }
    } catch {
      setFormError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitEmployee(
    event: React.FormEvent
  ) {
    if (editingEmployee) {
      return updateEmployee(event);
    }

    return addEmployee(event);
  }

  async function toggleStatus(id: string) {
    const employee = employees.find(
      (item) => item.id === id
    );

    if (!employee) {
      return;
    }

    const newStatus =
      employee.status === "Ativo"
        ? "inativo"
        : "ativo";

    try {
      const response = await fetch(
        `/api/funcionarios/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Não foi possível alterar o status do funcionário."
        );
        return;
      }

      setEmployees((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status:
                  data.employee.status === "ativo"
                    ? "Ativo"
                    : "Inativo",
              }
            : item
        )
      );
    } catch {
      alert("Erro de conexão com o servidor.");
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    return (
      employee.name.toLowerCase().includes(searchText) ||
      employee.email.toLowerCase().includes(searchText) ||
      employee.role.toLowerCase().includes(searchText) ||
      employee.city.toLowerCase().includes(searchText)
    );
  });

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Ativo"
  ).length;

  const technicianEmployees = employees.filter(
    (employee) => employee.role === "Técnico"
  ).length;

  const adminEmployees = employees.filter(
    (employee) => employee.role === "Administrador"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Funcionários
              </h1>

              <p className="text-sm text-slate-500">
                Gerencie os usuários e permissões da equipe.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewEmployeeForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo funcionário
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalEmployees}
                </p>
              </div>

              <UserCog className="text-slate-400" size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Ativos</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {activeEmployees}
                </p>
              </div>

              <CheckCircle2
                className="text-green-500"
                size={24}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Técnicos
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {technicianEmployees}
                </p>
              </div>

              <Wrench
                className="text-amber-500"
                size={24}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Administradores
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  {adminEmployees}
                </p>
              </div>

              <ShieldCheck
                className="text-red-500"
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar funcionário..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <User
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-700">
                Nenhum funcionário encontrado.
              </p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {employee.role === "Técnico" ? (
                        <Wrench size={22} />
                      ) : employee.role === "Administrador" ? (
                        <ShieldCheck size={22} />
                      ) : (
                        <User size={22} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-bold text-slate-900">
                          {employee.name}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyles[employee.role]}`}
                        >
                          {employee.role}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            employee.status === "Ativo"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {roleDescriptions[employee.role]}
                      </p>

                      <div className="mt-3 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
                        <span className="flex items-center gap-1.5">
                          <Mail size={15} />
                          {employee.email}
                        </span>

                        {employee.phone && (
                          <span>
                            📱 {employee.phone}
                          </span>
                        )}

                        {employee.city && (
                          <span>
                            📍 {employee.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(employee)
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleStatus(employee.id)
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                        employee.status === "Ativo"
                          ? "border border-red-200 text-red-600 hover:bg-red-50"
                          : "border border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {employee.status === "Ativo"
                        ? "Desativar"
                        : "Ativar"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEmployee
                    ? "Editar funcionário"
                    : "Novo funcionário"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingEmployee
                    ? "Atualize os dados e as permissões do funcionário."
                    : "Cadastre um novo usuário e defina o acesso ao sistema."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEmployee}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nome
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Nome completo"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="email@exemplo.com"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="(14) 99999-9999"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {!editingEmployee && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Função
                </label>

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="Administrador">
                    Administrador
                  </option>

                  <option value="Gerente">
                    Gerente
                  </option>

                  <option value="Atendente">
                    Atendente
                  </option>

                  <option value="Técnico">
                    Técnico
                  </option>

                  <option value="Financeiro">
                    Financeiro
                  </option>
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  {roleDescriptions[role as Role]}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cidade
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  placeholder="Cidade"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* PERMISSÕES */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Permissões de acesso
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Escolha exatamente o que este funcionário
                    poderá visualizar e executar no sistema.
                  </p>
                </div>

                {permissionsLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                    Carregando permissões...
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <div className="min-w-[650px]">
                      <div className="grid grid-cols-[1fr_90px_90px_90px_90px] border-b border-slate-200 bg-slate-100 px-3 py-3 text-xs font-bold text-slate-600">
                        <div>Módulo</div>

                        <div className="text-center">
                          Visualizar
                        </div>

                        <div className="text-center">
                          Criar
                        </div>

                        <div className="text-center">
                          Editar
                        </div>

                        <div className="text-center">
                          Excluir
                        </div>
                      </div>

                      {permissions.map((permission) => {
                        const moduleInfo =
                          permissionModules.find(
                            (module) =>
                              module.id ===
                              permission.modulo
                          );

                        if (!moduleInfo) {
                          return null;
                        }

                        return (
                          <div
                            key={permission.modulo}
                            className="grid grid-cols-[1fr_90px_90px_90px_90px] items-center border-b border-slate-100 px-3 py-3 last:border-b-0"
                          >
                            <div className="text-sm font-semibold text-slate-700">
                              {moduleInfo.label}
                            </div>

                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={
                                  permission.visualizar
                                }
                                onChange={(event) =>
                                  updatePermission(
                                    permission.modulo,
                                    "visualizar",
                                    event.target.checked
                                  )
                                }
                                className="h-5 w-5 cursor-pointer rounded border-slate-300"
                              />
                            </div>

                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={permission.criar}
                                onChange={(event) =>
                                  updatePermission(
                                    permission.modulo,
                                    "criar",
                                    event.target.checked
                                  )
                                }
                                className="h-5 w-5 cursor-pointer rounded border-slate-300"
                              />
                            </div>

                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={permission.editar}
                                onChange={(event) =>
                                  updatePermission(
                                    permission.modulo,
                                    "editar",
                                    event.target.checked
                                  )
                                }
                                className="h-5 w-5 cursor-pointer rounded border-slate-300"
                              />
                            </div>

                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={permission.excluir}
                                onChange={(event) =>
                                  updatePermission(
                                    permission.modulo,
                                    "excluir",
                                    event.target.checked
                                  )
                                }
                                className="h-5 w-5 cursor-pointer rounded border-slate-300"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-400">
                  As permissões serão aplicadas individualmente
                  ao funcionário.
                </p>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || permissionsLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Salvando..."
                    : editingEmployee
                    ? "Salvar alterações"
                    : "Cadastrar funcionário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
