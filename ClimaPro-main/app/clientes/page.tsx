"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit3,
  History,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

type ClientType = "Residencial" | "Comercial" | "Empresarial";
type ClientStatus = "Ativo" | "Inativo";

type Client = {
  id: number;
  name: string;
  type: ClientType;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement: string;
  zipCode: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
};

const initialClients: Client[] = [
  {
    id: 1,
    name: "João da Silva",
    type: "Residencial",
    document: "123.456.789-00",
    phone: "(16) 99999-1000",
    whatsapp: "(16) 99999-1000",
    email: "joao@email.com",
    city: "Araraquara",
    neighborhood: "Centro",
    address: "Rua das Flores",
    number: "100",
    complement: "",
    zipCode: "14800-000",
    status: "Ativo",
    notes: "Cliente residencial.",
    createdAt: "01/09/2026",
  },
  {
    id: 2,
    name: "Clínica Saúde",
    type: "Comercial",
    document: "12.345.678/0001-00",
    phone: "(16) 99999-2000",
    whatsapp: "(16) 99999-2000",
    email: "contato@clinicasaude.com.br",
    city: "Araraquara",
    neighborhood: "Jardim América",
    address: "Av. Brasil",
    number: "500",
    complement: "Sala 2",
    zipCode: "14801-000",
    status: "Ativo",
    notes: "Possui vários equipamentos.",
    createdAt: "02/09/2026",
  },
  {
    id: 3,
    name: "Empresa ABC Ltda.",
    type: "Empresarial",
    document: "98.765.432/0001-00",
    phone: "(16) 99999-3000",
    whatsapp: "(16) 99999-3000",
    email: "contato@empresaabc.com.br",
    city: "São Carlos",
    neighborhood: "Vila Industrial",
    address: "Rua Industrial",
    number: "800",
    complement: "",
    zipCode: "13560-000",
    status: "Ativo",
    notes: "Atendimento empresarial.",
    createdAt: "03/09/2026",
  },
];

const emptyForm = {
  name: "",
  type: "Residencial" as ClientType,
  document: "",
  phone: "",
  whatsapp: "",
  email: "",
  city: "",
  neighborhood: "",
  address: "",
  number: "",
  complement: "",
  zipCode: "",
  notes: "",
};

function money(text: string) {
  return text;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Todos" | ClientType>("Todos");
  const [statusFilter, setStatusFilter] =
    useState<"Todos" | ClientStatus>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        client.document.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.whatsapp.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.city.toLowerCase().includes(term);

      const matchesType =
        typeFilter === "Todos" || client.type === typeFilter;

      const matchesStatus =
        statusFilter === "Todos" || client.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, search, typeFilter, statusFilter]);

  const activeClients = clients.filter(
    (client) => client.status === "Ativo"
  ).length;

  const residentialClients = clients.filter(
    (client) => client.type === "Residencial"
  ).length;

  const commercialClients = clients.filter(
    (client) => client.type === "Comercial"
  ).length;

  const businessClients = clients.filter(
    (client) => client.type === "Empresarial"
  ).length;

  function openNewClient() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditClient(client: Client) {
    setEditingId(client.id);

    setForm({
      name: client.name,
      type: client.type,
      document: client.document,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      city: client.city,
      neighborhood: client.neighborhood,
      address: client.address,
      number: client.number,
      complement: client.complement,
      zipCode: client.zipCode,
      notes: client.notes,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  function saveClient() {
    if (!form.name.trim()) {
      alert("Digite o nome do cliente.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Digite o telefone do cliente.");
      return;
    }

    if (!form.city.trim()) {
      alert("Digite a cidade do cliente.");
      return;
    }

    if (editingId !== null) {
      setClients((old) =>
        old.map((client) =>
          client.id === editingId
            ? {
                ...client,
                ...form,
              }
            : client
        )
      );

      closeForm();
      return;
    }

    const newClient: Client = {
      id:
        clients.length > 0
          ? Math.max(...clients.map((client) => client.id)) + 1
          : 1,
      ...form,
      status: "Ativo",
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    setClients((old) => [newClient, ...old]);

    closeForm();
  }

  function toggleStatus(id: number) {
    setClients((old) =>
      old.map((client) =>
        client.id === id
          ? {
              ...client,
              status: client.status === "Ativo" ? "Inativo" : "Ativo",
            }
          : client
      )
    );

    if (selectedClient?.id === id) {
      setSelectedClient((old) =>
        old
          ? {
              ...old,
              status: old.status === "Ativo" ? "Inativo" : "Ativo",
            }
          : null
      );
    }
  }

  function deleteClient(id: number) {
    const client = clients.find((item) => item.id === id);

    if (!client) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir o cliente "${client.name}"?`
    );

    if (!confirmed) return;

    setClients((old) => old.filter((item) => item.id !== id));

    if (selectedClient?.id === id) {
      setSelectedClient(null);
    }
  }

  function openWhatsApp(client: Client) {
    const phone = client.whatsapp.replace(/\D/g, "");

    if (!phone) {
      alert("Este cliente não possui WhatsApp cadastrado.");
      return;
    }

    window.open(`https://wa.me/55${phone}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3">
                <Users className="h-7 w-7 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Clientes
                </h1>

                <p className="text-sm text-slate-400">
                  Cadastro e gerenciamento de clientes
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openNewClient}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />
            Novo cliente
          </button>
        </div>

        {/* CARDS */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Total
              </span>

              <Users className="h-5 w-5 text-cyan-400" />
            </div>

            <p className="text-2xl font-bold">
              {clients.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Clientes cadastrados
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Ativos
              </span>

              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>

            <p className="text-2xl font-bold">
              {activeClients}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Clientes ativos
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Residenciais
              </span>

              <User className="h-5 w-5 text-blue-400" />
            </div>

            <p className="text-2xl font-bold">
              {residentialClients}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Clientes residenciais
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Empresas
              </span>

              <Building2 className="h-5 w-5 text-violet-400" />
            </div>

            <p className="text-2xl font-bold">
              {commercialClients + businessClients}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Comerciais e empresariais
            </p>
          </div>

        </div>

        {/* FILTROS */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, documento, telefone, e-mail ou cidade..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as "Todos" | ClientType
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Empresarial">Empresarial</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "Todos" | ClientStatus
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="Todos">Todos os status</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>

          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Lista de clientes
              </h2>

              <p className="text-xs text-slate-500">
                {filteredClients.length} cliente(s) encontrado(s)
              </p>
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-slate-700" />

              <h3 className="font-semibold">
                Nenhum cliente encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tente alterar os filtros ou cadastre um novo cliente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 transition hover:bg-slate-800/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                        {client.type === "Residencial" ? (
                          <User className="h-6 w-6" />
                        ) : (
                          <Building2 className="h-6 w-6" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {client.name}
                          </h3>

                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                              client.status === "Ativo"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {client.status}
                          </span>

                          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                            {client.type}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {client.city}
                          </span>

                          {client.email && (
                            <span>
                              {client.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() => setSelectedClient(client)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                      >
                        Ver detalhes
                      </button>

                      <button
                        onClick={() => openWhatsApp(client)}
                        className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                      >
                        WhatsApp
                      </button>

                      <button
                        onClick={() => openEditClient(client)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => deleteClient(client.id)}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL NOVO / EDITAR CLIENTE */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId !== null
                    ? "Editar cliente"
                    : "Novo cliente"}
                </h2>

                <p className="text-xs text-slate-500">
                  Cadastre os dados do cliente
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5">

              {/* DADOS PRINCIPAIS */}
              <section>
                <h3 className="mb-3 font-semibold text-cyan-400">
                  Dados principais
                </h3>

                <div className="grid gap-3 md:grid-cols-2">

                  <input
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    placeholder="Nome / Razão social *"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <select
                    value={form.type}
                    onChange={(e) =>
                      updateField(
                        "type",
                        e.target.value as ClientType
                      )
                    }
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="Residencial">
                      Residencial
                    </option>

                    <option value="Comercial">
                      Comercial
                    </option>

                    <option value="Empresarial">
                      Empresarial
                    </option>
                  </select>

                  <input
                    value={form.document}
                    onChange={(e) =>
                      updateField("document", e.target.value)
                    }
                    placeholder="CPF / CNPJ"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="E-mail"
                    type="email"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                </div>
              </section>

              {/* CONTATOS */}
              <section>
                <h3 className="mb-3 font-semibold text-cyan-400">
                  Contatos
                </h3>

                <div className="grid gap-3 md:grid-cols-2">

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="Telefone *"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.whatsapp}
                    onChange={(e) =>
                      updateField("whatsapp", e.target.value)
                    }
                    placeholder="WhatsApp"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                </div>
              </section>

              {/* ENDEREÇO */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-cyan-400">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>

                <div className="grid gap-3 md:grid-cols-3">

                  <input
                    value={form.zipCode}
                    onChange={(e) =>
                      updateField("zipCode", e.target.value)
                    }
                    placeholder="CEP"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="Cidade *"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.neighborhood}
                    onChange={(e) =>
                      updateField("neighborhood", e.target.value)
                    }
                    placeholder="Bairro"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    placeholder="Rua / Avenida"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500 md:col-span-2"
                  />

                  <input
                    value={form.number}
                    onChange={(e) =>
                      updateField("number", e.target.value)
                    }
                    placeholder="Número"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  />

                  <input
                    value={form.complement}
                    onChange={(e) =>
                      updateField("complement", e.target.value)
                    }
                    placeholder="Complemento"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500 md:col-span-3"
                  />

                </div>
              </section>

              {/* OBSERVAÇÕES */}
              <section>
                <h3 className="mb-3 font-semibold text-cyan-400">
                  Observações
                </h3>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    updateField("notes", e.target.value)
                  }
                  placeholder="Observações sobre o cliente..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </section>

            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-900 p-5 sm:flex-row sm:justify-end">

              <button
                onClick={closeForm}
                className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={saveClient}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {editingId !== null
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedClient.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastro realizado em {selectedClient.createdAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div className="grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Tipo
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedClient.type}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p
                    className={`mt-1 font-semibold ${
                      selectedClient.status === "Ativo"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedClient.status}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    CPF / CNPJ
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedClient.document || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Telefone
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedClient.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    WhatsApp
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedClient.whatsapp || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    E-mail
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {selectedClient.email || "Não informado"}
                  </p>
                </div>

              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />

                  <h3 className="font-semibold">
                    Endereço
                  </h3>
                </div>

                <p className="text-sm text-slate-300">
                  {selectedClient.address || "Endereço não informado"}
                  {selectedClient.number
                    ? `, ${selectedClient.number}`
                    : ""}
                  {selectedClient.complement
                    ? ` - ${selectedClient.complement}`
                    : ""}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedClient.neighborhood
                    ? `${selectedClient.neighborhood} - `
                    : ""}
                  {selectedClient.city}
                  {selectedClient.zipCode
                    ? ` - CEP ${selectedClient.zipCode}`
                    : ""}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <History className="h-4 w-4 text-cyan-400" />

                  <h3 className="font-semibold">
                    Histórico do cliente
                  </h3>
                </div>

                <p className="text-sm text-slate-500">
                  O histórico de orçamentos, ordens de serviço,
                  manutenções, contratos e pagamentos será conectado
                  nesta área quando os demais módulos forem integrados.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 p-5">

              <button
                onClick={() =>
                  toggleStatus(selectedClient.id)
                }
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
              >
                {selectedClient.status === "Ativo"
                  ? "Desativar cliente"
                  : "Ativar cliente"}
              </button>

              <button
                onClick={() => {
                  openEditClient(selectedClient);
                  setSelectedClient(null);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>

              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Fechar
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}
