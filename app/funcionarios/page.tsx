"use client";

import {
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EmployeeStatus = "Ativo" | "Inativo";

type Employee = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  whatsapp: string;
  email: string;

  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;

  cargo: string;
  tipo_vinculo: string;

  data_nascimento: string | null;
  data_admissao: string | null;

  salario: number;

  forma_pagamento: string;
  chave_pix: string;

  status: EmployeeStatus;
  observacoes: string;

  created_at?: string;
  updated_at?: string;
};

type EmployeeForm = {
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  whatsapp: string;
  email: string;

  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;

  cargo: string;
  tipo_vinculo: string;

  data_nascimento: string;
  data_admissao: string;

  salario: string;

  forma_pagamento: string;
  chave_pix: string;

  status: EmployeeStatus;
  observacoes: string;
};

const emptyForm: EmployeeForm = {
  nome: "",
  cpf: "",
  rg: "",
  telefone: "",
  whatsapp: "",
  email: "",

  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  cep: "",

  cargo: "",
  tipo_vinculo: "Funcionário",

  data_nascimento: "",
  data_admissao: "",

  salario: "",

  forma_pagamento: "",
  chave_pix: "",

  status: "Ativo",
  observacoes: "",
};

function normalizarStatus(status: unknown): EmployeeStatus {
  return String(status || "").toLowerCase() === "inativo"
    ? "Inativo"
    : "Ativo";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function parseMoney(value: string) {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  const parts = date.split("-");

  if (parts.length !== 3) return date;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function maskCpf(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
      6
    )}`;
  }

  return `${numbers.slice(0, 3)}.${numbers.slice(
    3,
    6
  )}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function maskPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 2) return numbers;

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      6
    )}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(
    2,
    7
  )}-${numbers.slice(7)}`;
}

export default function FuncionariosPage() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | EmployeeStatus
  >("Todos");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .order("nome", {
        ascending: true,
      });

    if (error) {
      console.error("Erro ao carregar funcionários:", error);
      alert(
        `Não foi possível carregar os funcionários.\n\n${error.message}`
      );
      setEmployees([]);
      setLoading(false);
      return;
    }

    const normalized: Employee[] = (data || []).map((item) => ({
      id: item.id,
      nome: item.nome || "",
      cpf: item.cpf || "",
      rg: item.rg || "",
      telefone: item.telefone || "",
      whatsapp: item.whatsapp || "",
      email: item.email || "",

      endereco: item.endereco || "",
      numero: item.numero || "",
      complemento: item.complemento || "",
      bairro: item.bairro || "",
      cidade: item.cidade || "",
      cep: item.cep || "",

      cargo: item.cargo || "",
      tipo_vinculo: item.tipo_vinculo || "Funcionário",

      data_nascimento: item.data_nascimento || null,
      data_admissao: item.data_admissao || null,

      salario: Number(item.salario || 0),

      forma_pagamento: item.forma_pagamento || "",
      chave_pix: item.chave_pix || "",

      status: normalizarStatus(item.status),

      observacoes: item.observacoes || "",

      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    setEmployees(normalized);
    setLoading(false);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !term ||
        employee.nome.toLowerCase().includes(term) ||
        employee.cpf.toLowerCase().includes(term) ||
        employee.telefone.toLowerCase().includes(term) ||
        employee.cargo.toLowerCase().includes(term) ||
        employee.cidade.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "Todos" ||
        employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Ativo"
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inativo"
  ).length;

  const totalSalaries = employees
    .filter((employee) => employee.status === "Ativo")
    .reduce(
      (total, employee) => total + Number(employee.salario || 0),
      0
    );

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingId(employee.id);

    setForm({
      nome: employee.nome,
      cpf: employee.cpf,
      rg: employee.rg,
      telefone: employee.telefone,
      whatsapp: employee.whatsapp,
      email: employee.email,

      endereco: employee.endereco,
      numero: employee.numero,
      complemento: employee.complemento,
      bairro: employee.bairro,
      cidade: employee.cidade,
      cep: employee.cep,

      cargo: employee.cargo,
      tipo_vinculo: employee.tipo_vinculo,

      data_nascimento: employee.data_nascimento || "",
      data_admissao: employee.data_admissao || "",

      salario: employee.salario
        ? String(employee.salario)
        : "",

      forma_pagamento: employee.forma_pagamento,
      chave_pix: employee.chave_pix,

      status: employee.status,
      observacoes: employee.observacoes,
    });

    setShowForm(true);
  }

  function updateField<K extends keyof EmployeeForm>(
    field: K,
    value: EmployeeForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveEmployee() {
    if (!form.nome.trim()) {
      alert("Informe o nome do funcionário.");
      return;
    }

    setSaving(true);

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      rg: form.rg.trim(),
      telefone: form.telefone.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),

      endereco: form.endereco.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      cep: form.cep.trim(),

      cargo: form.cargo.trim(),
      tipo_vinculo: form.tipo_vinculo.trim(),

      data_nascimento:
        form.data_nascimento || null,

      data_admissao:
        form.data_admissao || null,

      salario: parseMoney(form.salario),

      forma_pagamento:
        form.forma_pagamento.trim(),

      chave_pix:
        form.chave_pix.trim(),

      status: form.status,

      observacoes:
        form.observacoes.trim(),

      updated_at: new Date().toISOString(),
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from("funcionarios")
        .update(payload)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("funcionarios")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        });

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error("Erro ao salvar funcionário:", error);

      alert(
        `Não foi possível salvar o funcionário.\n\n${error.message}`
      );

      return;
    }

    alert(
      editingId
        ? "Funcionário atualizado com sucesso!"
        : "Funcionário cadastrado com sucesso!"
    );

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);

    await loadEmployees();
  }

  async function deleteEmployee(employee: Employee) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o funcionário "${employee.nome}"?\n\n` +
        `Se ele já possuir pagamentos registrados, recomendamos apenas colocá-lo como Inativo.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("funcionarios")
      .delete()
      .eq("id", employee.id);

    if (error) {
      console.error("Erro ao excluir funcionário:", error);

      alert(
        `Não foi possível excluir o funcionário.\n\n${error.message}`
      );

      return;
    }

    await loadEmployees();
  }

  async function toggleStatus(employee: Employee) {
    const nextStatus =
      employee.status === "Ativo"
        ? "Inativo"
        : "Ativo";

    const { error } = await supabase
      .from("funcionarios")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employee.id);

    if (error) {
      alert(
        `Não foi possível alterar o status.\n\n${error.message}`
      );
      return;
    }

    await loadEmployees();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Funcionários
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastro, dados pessoais, cargos e salários.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo funcionário
          </button>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Funcionários ativos
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Funcionários inativos
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Folha mensal cadastrada
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(totalSalaries)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Apenas funcionários ativos
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Pesquisar funcionário..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "Todos"
                    | EmployeeStatus
                )
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="Todos">
                Todos os status
              </option>

              <option value="Ativo">
                Ativos
              </option>

              <option value="Inativo">
                Inativos
              </option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Carregando funcionários...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-10 text-center">
              <User
                size={42}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-semibold text-gray-700">
                Nenhum funcionário encontrado
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Cadastre o primeiro funcionário para começar.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-gray-600">
                        Funcionário
                      </th>

                      <th className="px-5 py-4 font-semibold text-gray-600">
                        Cargo
                      </th>

                      <th className="px-5 py-4 font-semibold text-gray-600">
                        Telefone
                      </th>

                      <th className="px-5 py-4 font-semibold text-gray-600">
                        Salário
                      </th>

                      <th className="px-5 py-4 font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-semibold text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredEmployees.map(
                      (employee) => (
                        <tr
                          key={employee.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                <User size={20} />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {employee.nome}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {employee.cpf ||
                                    "CPF não informado"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-800">
                              {employee.cargo ||
                                "Não informado"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {employee.tipo_vinculo}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {employee.whatsapp ||
                              employee.telefone ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {formatCurrency(
                              employee.salario
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(employee)
                              }
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                employee.status ===
                                "Ativo"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-gray-200 bg-gray-100 text-gray-600"
                              }`}
                            >
                              {employee.status}
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(employee)
                                }
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                title="Editar"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteEmployee(
                                    employee
                                  )
                                }
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y md:hidden">
                {filteredEmployees.map(
                  (employee) => (
                    <div
                      key={employee.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <User size={21} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {employee.nome}
                            </p>

                            <p className="text-xs text-gray-500">
                              {employee.cargo ||
                                "Cargo não informado"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            employee.status ===
                            "Ativo"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-100 text-gray-600"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          {employee.whatsapp ||
                            employee.telefone ||
                            "Telefone não informado"}
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail size={16} />
                          {employee.email ||
                            "E-mail não informado"}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {employee.cidade ||
                            "Cidade não informada"}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Salário
                        </p>

                        <p className="mt-1 font-bold text-gray-900">
                          {formatCurrency(
                            employee.salario
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(employee)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                          <Edit size={17} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteEmployee(employee)
                          }
                          className="rounded-xl border border-red-200 px-4 py-3 text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 md:p-6">
          <div className="mx-auto my-4 max-w-4xl rounded-2xl bg-white shadow-2xl md:my-8">
            {/* CABEÇALHO MODAL */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? "Editar funcionário"
                    : "Novo funcionário"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados para manter o cadastro
                  organizado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="space-y-6">
                {/* DADOS PESSOAIS */}
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Dados pessoais
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nome completo *
                      </label>

                      <input
                        value={form.nome}
                        onChange={(event) =>
                          updateField(
                            "nome",
                            event.target.value
                          )
                        }
                        placeholder="Nome completo"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        CPF
                      </label>

                      <input
                        value={form.cpf}
                        onChange={(event) =>
                          updateField(
                            "cpf",
                            maskCpf(
                              event.target.value
                            )
                          )
                        }
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        RG
                      </label>

                      <input
                        value={form.rg}
                        onChange={(event) =>
                          updateField(
                            "rg",
                            event.target.value
                          )
                        }
                        placeholder="RG"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Data de nascimento
                      </label>

                      <input
                        type="date"
                        value={
                          form.data_nascimento
                        }
                        onChange={(event) =>
                          updateField(
                            "data_nascimento",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Data de admissão
                      </label>

                      <input
                        type="date"
                        value={
                          form.data_admissao
                        }
                        onChange={(event) =>
                          updateField(
                            "data_admissao",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                {/* CONTATO */}
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Contato
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Telefone
                      </label>

                      <input
                        value={form.telefone}
                        onChange={(event) =>
                          updateField(
                            "telefone",
                            maskPhone(
                              event.target.value
                            )
                          )
                        }
                        placeholder="(00) 0000-0000"
                        inputMode="tel"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        WhatsApp
                      </label>

                      <input
                        value={form.whatsapp}
                        onChange={(event) =>
                          updateField(
                            "whatsapp",
                            maskPhone(
                              event.target.value
                            )
                          )
                        }
                        placeholder="(00) 00000-0000"
                        inputMode="tel"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        E-mail
                      </label>

                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="email@exemplo.com"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                {/* ENDEREÇO */}
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Endereço
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Endereço
                      </label>

                      <input
                        value={form.endereco}
                        onChange={(event) =>
                          updateField(
                            "endereco",
                            event.target.value
                          )
                        }
                        placeholder="Rua / Avenida"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Número
                      </label>

                      <input
                        value={form.numero}
                        onChange={(event) =>
                          updateField(
                            "numero",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        CEP
                      </label>

                      <input
                        value={form.cep}
                        onChange={(event) =>
                          updateField(
                            "cep",
                            event.target.value
                          )
                        }
                        placeholder="00000-000"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Bairro
                      </label>

                      <input
                        value={form.bairro}
                        onChange={(event) =>
                          updateField(
                            "bairro",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Cidade
                      </label>

                      <input
                        value={form.cidade}
                        onChange={(event) =>
                          updateField(
                            "cidade",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Complemento
                      </label>

                      <input
                        value={form.complemento}
                        onChange={(event) =>
                          updateField(
                            "complemento",
                            event.target.value
                          )
                        }
                        placeholder="Apartamento, casa, sala..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                {/* DADOS PROFISSIONAIS */}
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Dados profissionais
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Cargo
                      </label>

                      <input
                        value={form.cargo}
                        onChange={(event) =>
                          updateField(
                            "cargo",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Técnico de climatização"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tipo de vínculo
                      </label>

                      <select
                        value={
                          form.tipo_vinculo
                        }
                        onChange={(event) =>
                          updateField(
                            "tipo_vinculo",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option>
                          Funcionário
                        </option>

                        <option>
                          CLT
                        </option>

                        <option>
                          Autônomo
                        </option>

                        <option>
                          Prestador de serviço
                        </option>

                        <option>
                          Temporário
                        </option>

                        <option>
                          Sócio
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Salário / valor mensal
                      </label>

                      <input
                        value={form.salario}
                        onChange={(event) =>
                          updateField(
                            "salario",
                            event.target.value
                          )
                        }
                        placeholder="0,00"
                        inputMode="decimal"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Forma de pagamento
                      </label>

                      <select
                        value={
                          form.forma_pagamento
                        }
                        onChange={(event) =>
                          updateField(
                            "forma_pagamento",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="">
                          Selecionar
                        </option>

                        <option value="Pix">
                          Pix
                        </option>

                        <option value="Transferência">
                          Transferência
                        </option>

                        <option value="Dinheiro">
                          Dinheiro
                        </option>

                        <option value="Cheque">
                          Cheque
                        </option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Chave Pix
                      </label>

                      <input
                        value={form.chave_pix}
                        onChange={(event) =>
                          updateField(
                            "chave_pix",
                            event.target.value
                          )
                        }
                        placeholder="CPF, telefone, e-mail ou chave aleatória"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateField(
                            "status",
                            event.target.value as EmployeeStatus
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="Ativo">
                          Ativo
                        </option>

                        <option value="Inativo">
                          Inativo
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* OBSERVAÇÕES */}
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Observações
                  </h3>

                  <textarea
                    value={form.observacoes}
                    onChange={(event) =>
                      updateField(
                        "observacoes",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Observações sobre o funcionário..."
                    className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </section>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveEmployee}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Cadastrar funcionário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
