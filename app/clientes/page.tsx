"use client";

import { useEffect, useMemo, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

type ClientType = "Residencial" | "Comercial" | "Empresarial";
type ClientStatus = "Ativo" | "Inativo";

type Client = {
  id: string;
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

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"Todos" | ClientType>("Todos");

  const [statusFilter, setStatusFilter] =
    useState<"Todos" | ClientStatus>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  useEffect(() => {
    async function loadClients() {
      setLoading(true);

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Erro ao carregar clientes:",
          error
        );

        alert(
          "Não foi possível carregar os clientes."
        );

        setLoading(false);
        return;
      }

      const formattedClients: Client[] =
        (data ?? []).map((client) => ({
          id: client.id,
          name: client.nome,
          type: client.tipo,
          document: client.documento ?? "",
          phone: client.telefone ?? "",
          whatsapp: client.whatsapp ?? "",
          email: client.email ?? "",
          city: client.cidade ?? "",
          neighborhood: client.bairro ?? "",
          address: client.endereco ?? "",
          number: client.numero ?? "",
          complement: client.complemento ?? "",
          zipCode: client.cep ?? "",
          status: client.status,
          notes: client.observacoes ?? "",
          createdAt: new Date(
            client.created_at
          ).toLocaleDateString("pt-BR"),
        }));

      setClients(formattedClients);
      setLoading(false);
    }

    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.name
          .toLowerCase()
          .includes(term) ||
        client.document
          .toLowerCase()
          .includes(term) ||
        client.phone
          .toLowerCase()
          .includes(term) ||
        client.whatsapp
          .toLowerCase()
          .includes(term) ||
        client.email
          .toLowerCase()
          .includes(term) ||
        client.city
          .toLowerCase()
          .includes(term);

      const matchesType =
        typeFilter === "Todos" ||
        client.type === typeFilter;

      const matchesStatus =
        statusFilter === "Todos" ||
        client.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    clients,
    search,
    typeFilter,
    statusFilter,
  ]);

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

  async function buscarCep(cep: string) {
    const digits = cep
      .replace(/\D/g, "")
      .slice(0, 8);

    const formatted =
      digits.length > 5
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : digits;

    updateField("zipCode", formatted);

    if (digits.length !== 8) {
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${digits}/json/`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setForm((old) => ({
        ...old,
        zipCode: formatted,
        address:
          data.logradouro || old.address,
        neighborhood:
          data.bairro || old.neighborhood,
        city:
          data.localidade || old.city,
      }));
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error
      );
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  async function saveClient() {
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

    const clientData = {
      nome: form.name.trim(),
      tipo: form.type,
      documento:
        form.document.trim() || null,
      telefone: form.phone.trim(),
      whatsapp:
        form.whatsapp.trim() || null,
      email: form.email.trim() || null,
      cidade: form.city.trim(),
      bairro:
        form.neighborhood.trim() || null,
      endereco:
        form.address.trim() || null,
      numero:
        form.number.trim() || null,
      complemento:
        form.complement.trim() || null,
      cep:
        form.zipCode.trim() || null,
      observacoes:
        form.notes.trim() || null,
    };

    if (editingId !== null) {
      const { data, error } =
        await supabase
          .from("clientes")
          .update(clientData)
          .eq("id", editingId)
          .select()
          .single();

      if (error) {
        console.error(
          "Erro ao atualizar cliente:",
          error
        );

        alert(
          "Não foi possível atualizar o cliente."
        );

        return;
      }

      const updatedClient: Client = {
        id: data.id,
        name: data.nome,
        type: data.tipo,
        document:
          data.documento ?? "",
        phone:
          data.telefone ?? "",
        whatsapp:
          data.whatsapp ?? "",
        email:
          data.email ?? "",
        city:
          data.cidade ?? "",
        neighborhood:
          data.bairro ?? "",
        address:
          data.endereco ?? "",
        number:
          data.numero ?? "",
        complement:
          data.complemento ?? "",
        zipCode:
          data.cep ?? "",
        status: data.status,
        notes:
          data.observacoes ?? "",
        createdAt:
          new Date(
            data.created_at
          ).toLocaleDateString("pt-BR"),
      };

      setClients((old) =>
        old.map((client) =>
          client.id === editingId
            ? updatedClient
            : client
        )
      );

      if (
        selectedClient?.id ===
        editingId
      ) {
        setSelectedClient(
          updatedClient
        );
      }

      closeForm();
      return;
    }

    const { data, error } =
      await supabase
        .from("clientes")
        .insert({
          ...clientData,
          status: "Ativo",
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Erro ao cadastrar cliente:",
        error
      );

      alert(
        "Não foi possível cadastrar o cliente."
      );

      return;
    }

    const newClient: Client = {
      id: data.id,
      name: data.nome,
      type: data.tipo,
      document:
        data.documento ?? "",
      phone:
        data.telefone ?? "",
      whatsapp:
        data.whatsapp ?? "",
      email:
        data.email ?? "",
      city:
        data.cidade ?? "",
      neighborhood:
        data.bairro ?? "",
      address:
        data.endereco ?? "",
      number:
        data.numero ?? "",
      complement:
        data.complemento ?? "",
      zipCode:
        data.cep ?? "",
      status: data.status,
      notes:
        data.observacoes ?? "",
      createdAt:
        new Date(
          data.created_at
        ).toLocaleDateString("pt-BR"),
    };

    setClients((old) => [
      newClient,
      ...old,
    ]);

    closeForm();
  }

  async function toggleStatus(
    id: string
  ) {
    const client = clients.find(
      (item) => item.id === id
    );

    if (!client) {
      return;
    }

    const newStatus =
      client.status === "Ativo"
        ? "Inativo"
        : "Ativo";

    const { error } =
      await supabase
        .from("clientes")
        .update({
          status: newStatus,
        })
        .eq("id", id);

    if (error) {
      console.error(
        "Erro ao alterar status:",
        error
      );

      alert(
        "Não foi possível alterar o status do cliente."
      );

      return;
    }

    setClients((old) =>
      old.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    if (selectedClient?.id === id) {
      setSelectedClient((old) =>
        old
          ? {
              ...old,
              status: newStatus,
            }
          : null
      );
    }
  }

  async function deleteClient(
    id: string
  ) {
    const client = clients.find(
      (item) => item.id === id
    );

    if (!client) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir o cliente "${client.name}"?`
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "Erro ao excluir cliente:",
        error
      );

      alert(
        "Não foi possível excluir o cliente."
      );

      return;
    }

    setClients((old) =>
      old.filter(
        (item) => item.id !== id
      )
    );

    if (selectedClient?.id === id) {
      setSelectedClient(null);
    }
  }
    function openWhatsApp(client: Client) {
    const phone = client.whatsapp || client.phone;

    const digits = phone.replace(/\D/g, "");

    if (!digits) {
      alert(
        "Este cliente não possui telefone ou WhatsApp cadastrado."
      );
      return;
    }

    const message = encodeURIComponent(
      `Olá, ${client.name}! Aqui é da Nando's Ar-Condicionado.`
    );

    window.open(
      `https://wa.me/55${digits}?text=${message}`,
      "_blank"
    );
  }

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("novo") === "1") {
      openNewClient();

      window.history.replaceState(
        {},
        "",
        "/clientes"
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3">
                <Users className="h-7 w-7 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Clientes
                </h1>

                <p className="text-sm text-slate-400">
                  Cadastro e gerenciamento de clientes
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewClient}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />
            Novo cliente
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {clients.length}
                </p>
              </div>

              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Ativos
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {activeClients}
                </p>
              </div>

              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Residenciais
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {residentialClients}
                </p>
              </div>

              <User className="h-8 w-8 text-violet-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Empresas
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {commercialClients + businessClients}
                </p>
              </div>

              <Building2 className="h-8 w-8 text-orange-400" />
            </div>
          </div>

        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">

            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar por nome, documento, telefone ou cidade..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as
                    | "Todos"
                    | ClientType
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="Todos">
                Todos os tipos
              </option>
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

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "Todos"
                    | ClientStatus
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"
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

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                <p className="text-sm text-slate-400">
                  Carregando clientes...
                </p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-full bg-slate-800 p-4">
                <Users className="h-8 w-8 text-slate-500" />
              </div>

              <h2 className="text-lg font-semibold">
                Nenhum cliente encontrado
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Cadastre um novo cliente ou altere os filtros de pesquisa.
              </p>

              <button
                type="button"
                onClick={openNewClient}
                className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Cadastrar cliente
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Cliente
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contato
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Localização
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tipo
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition hover:bg-slate-800/40"
                    >

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedClient(client)
                          }
                          className="text-left"
                        >
                          <p className="font-semibold text-white hover:text-cyan-400">
                            {client.name}
                          </p>

                          {client.document && (
                            <p className="mt-1 text-xs text-slate-500">
                              {client.document}
                            </p>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">

                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Phone className="h-4 w-4 text-slate-500" />
                              {client.phone}
                            </div>
                          )}

                          {client.whatsapp && (
                            <button
                              type="button"
                              onClick={() =>
                                openWhatsApp(client)
                              }
                              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                            >
                              WhatsApp
                            </button>
                          )}

                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">

                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                          <div>
                            <p className="text-sm text-slate-300">
                              {client.city || "—"}
                            </p>

                            {client.neighborhood && (
                              <p className="text-xs text-slate-500">
                                {client.neighborhood}
                              </p>
                            )}
                          </div>

                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                          {client.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(client.id)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            client.status === "Ativo"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              client.status === "Ativo"
                                ? "bg-emerald-400"
                                : "bg-red-400"
                            }`}
                          />

                          {client.status}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedClient(client)
                            }
                            title="Ver detalhes"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
                          >
                            <History className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditClient(client)
                            }
                            title="Editar"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-yellow-400"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openWhatsApp(client)
                            }
                            title="WhatsApp"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-400"
                          >
                            <Phone className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteClient(client.id)
                            }
                            title="Excluir"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          )}

        </div>

      </div>
            {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Editar cliente"
                    : "Novo cliente"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preencha os dados do cliente
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-6 p-6">

              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-400">
                  <User className="h-4 w-4" />
                  Dados do cliente
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-400">
                      Nome *
                    </label>

                    <input
                      value={form.name}
                      onChange={(e) =>
                        updateField(
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Nome completo ou razão social"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Tipo *
                    </label>

                    <select
                      value={form.type}
                      onChange={(e) =>
                        updateField(
                          "type",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
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
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      CPF / CNPJ
                    </label>

                    <input
                      value={form.document}
                      onChange={(e) =>
                        updateField(
                          "document",
                          e.target.value
                        )
                      }
                      placeholder="CPF ou CNPJ"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Telefone *
                    </label>

                    <input
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="(14) 99999-9999"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      WhatsApp
                    </label>

                    <input
                      value={form.whatsapp}
                      onChange={(e) =>
                        updateField(
                          "whatsapp",
                          e.target.value
                        )
                      }
                      placeholder="(14) 99999-9999"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-400">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="cliente@email.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                </div>
              </section>

              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-400">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      CEP
                    </label>

                    <input
                      value={form.zipCode}
                      onChange={(e) =>
                        buscarCep(
                          e.target.value
                        )
                      }
                      placeholder="00000-000"
                      maxLength={9}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <p className="mt-1 text-xs text-slate-600">
                      Digite o CEP para preencher o endereço automaticamente.
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-2 block text-sm text-slate-400">
                      Endereço
                    </label>

                    <input
                      value={form.address}
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                      placeholder="Rua, avenida, etc."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Número
                    </label>

                    <input
                      value={form.number}
                      onChange={(e) =>
                        updateField(
                          "number",
                          e.target.value
                        )
                      }
                      placeholder="Número"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Complemento
                    </label>

                    <input
                      value={form.complement}
                      onChange={(e) =>
                        updateField(
                          "complement",
                          e.target.value
                        )
                      }
                      placeholder="Apto, sala, casa..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Bairro
                    </label>

                    <input
                      value={form.neighborhood}
                      onChange={(e) =>
                        updateField(
                          "neighborhood",
                          e.target.value
                        )
                      }
                      placeholder="Bairro"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Cidade *
                    </label>

                    <input
                      value={form.city}
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value
                        )
                      }
                      placeholder="Cidade"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-semibold text-cyan-400">
                  Observações
                </h3>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Observações sobre o cliente..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </section>

            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveClient}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {editingId
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
              </button>

            </div>

          </div>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold">
                  Detalhes do cliente
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informações cadastradas
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedClient(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-5 p-6">

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedClient.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedClient.type}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      selectedClient.status === "Ativo"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {selectedClient.status}
                  </span>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    CPF / CNPJ
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {selectedClient.document || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Telefone
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {selectedClient.phone || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {selectedClient.whatsapp || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    E-mail
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-200">
                    {selectedClient.email || "Não informado"}
                  </p>
                </div>

              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-400" />

                  <h3 className="font-semibold">
                    Endereço
                  </h3>
                </div>

                <p className="text-sm leading-6 text-slate-300">

                  {selectedClient.address || "Endereço não informado"}

                  {selectedClient.number &&
                    `, ${selectedClient.number}`}

                  {selectedClient.complement &&
                    ` - ${selectedClient.complement}`}

                  {selectedClient.neighborhood &&
                    ` - ${selectedClient.neighborhood}`}

                  {selectedClient.city &&
                    ` - ${selectedClient.city}`}

                  {selectedClient.zipCode &&
                    ` - CEP ${selectedClient.zipCode}`}

                </p>

              </div>

              {selectedClient.notes && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <h3 className="mb-2 font-semibold">
                    Observações
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {selectedClient.notes}
                  </p>

                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(
                      selectedClient
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const client =
                      selectedClient;

                    setSelectedClient(null);
                    openEditClient(client);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
