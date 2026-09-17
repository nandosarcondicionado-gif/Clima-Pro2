"use client";

import {
  ArrowLeft,
  Building2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type Client = {
  id: number;
  name: string;
  type: "Residencial" | "Comercial" | "Empresarial";
  document: string;
  email: string;
  city: string;
  address: string;
  phone: string;
  equipmentCount: number;
};

const initialClients: Client[] = [
  {
    id: 1,
    name: "João da Silva",
    type: "Residencial",
    document: "123.456.789-00",
    email: "joao@email.com",
    city: "Araraquara",
    address: "Rua das Flores, 100",
    phone: "(16) 99999-0001",
    equipmentCount: 2,
  },
  {
    id: 2,
    name: "Clínica Saúde",
    type: "Comercial",
    document: "12.345.678/0001-00",
    email: "contato@clinicasaude.com",
    city: "Araraquara",
    address: "Av. Brasil, 500",
    phone: "(16) 99999-0002",
    equipmentCount: 6,
  },
  {
    id: 3,
    name: "Empresa ABC Ltda.",
    type: "Empresarial",
    document: "98.765.432/0001-00",
    email: "contato@empresaabc.com",
    city: "São Carlos",
    address: "Rua Central, 800",
    phone: "(16) 99999-0003",
    equipmentCount: 18,
  },
];

const typeStyles = {
  Residencial: "bg-blue-50 text-blue-700",
  Comercial: "bg-purple-50 text-purple-700",
  Empresarial: "bg-emerald-50 text-emerald-700",
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<Client["type"]>("Residencial");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const filteredClients = clients.filter((client) => {
    const term = search.toLowerCase().trim();

    return (
      client.name.toLowerCase().includes(term) ||
      client.city.toLowerCase().includes(term) ||
      client.type.toLowerCase().includes(term) ||
      client.phone.toLowerCase().includes(term) ||
      client.document.toLowerCase().includes(term)
    );
  });

  function clearForm() {
    setName("");
    setType("Residencial");
    setDocument("");
    setEmail("");
    setCity("Araraquara");
    setAddress("");
    setPhone("");
    setEditingClient(null);
  }

  function openNewClient() {
    clearForm();
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);

    setName(client.name);
    setType(client.type);
    setDocument(client.document);
    setEmail(client.email);
    setCity(client.city);
    setAddress(client.address);
    setPhone(client.phone);

    setShowForm(true);
  }

  function openDetails(client: Client) {
    setSelectedClient(client);
    setShowDetails(true);
  }

  function saveClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      return;
    }

    if (editingClient) {
      setClients((current) =>
        current.map((client) =>
          client.id === editingClient.id
            ? {
                ...client,
                name: name.trim(),
                type,
                document: document.trim(),
                email: email.trim(),
                city,
                address: address.trim(),
                phone: phone.trim(),
              }
            : client
        )
      );
    } else {
      const newClient: Client = {
        id: Date.now(),
        name: name.trim(),
        type,
        document: document.trim(),
        email: email.trim(),
        city,
        address: address.trim(),
        phone: phone.trim(),
        equipmentCount: 0,
      };

      setClients((current) => [newClient, ...current]);
    }

    clearForm();
    setShowForm(false);
  }

  function deleteClient(id: number) {
    const client = clients.find((item) => item.id === id);

    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir "${client.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setClients((current) => current.filter((item) => item.id !== id));

    if (selectedClient?.id === id) {
      setSelectedClient(null);
      setShowDetails(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Clientes
              </h1>

              <p className="text-sm text-slate-500">
                Cadastro e gerenciamento de clientes
              </p>
            </div>
          </div>

          <button
            onClick={openNewClient}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Novo cliente
            </span>

            <span className="sm:hidden">
              Novo
            </span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* CAMINHO */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft size={16} />
          <span>ClimaPro</span>
          <span>/</span>
          <span className="font-medium text-slate-700">
            Clientes
          </span>
        </div>

        {/* RESUMO */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total de clientes
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {clients.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Residenciais
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {
                clients.filter(
                  (client) => client.type === "Residencial"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Empresas
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {
                clients.filter(
                  (client) =>
                    client.type === "Empresarial" ||
                    client.type === "Comercial"
                ).length
              }
            </p>
          </div>
        </section>

        {/* LISTA */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por nome, cidade, telefone ou documento..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <div className="p-10 text-center">
                <Users
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhum cliente encontrado
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Tente outro termo de busca.
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button
                      onClick={() => openDetails(client)}
                      className="flex items-start gap-4 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        {client.type === "Residencial" ? (
                          <User size={21} />
                        ) : (
                          <Building2 size={21} />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900 hover:text-cyan-600">
                          {client.name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {client.city}
                          </span>

                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {client.phone}
                          </span>

                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {client.email || "Sem e-mail"}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${typeStyles[client.type]}`}
                      >
                        {client.type}
                      </span>

                      <span className="text-xs text-slate-400">
                        {client.equipmentCount} equipamento
                        {client.equipmentCount !== 1 ? "s" : ""}
                      </span>

                      <button
                        onClick={() => openEdit(client)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600"
                        title="Editar cliente"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => deleteClient(client.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Excluir cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* MODAL CADASTRO / EDIÇÃO */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingClient
                      ? "Editar cliente"
                      : "Novo cliente"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Preencha os dados do cliente.
                  </p>
                </div>

                <button
                  onClick={() => {
                    clearForm();
                    setShowForm(false);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveClient} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Nome / Razão social *
                    </label>

                    <input
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Ex.: João da Silva"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tipo de cliente
                    </label>

                    <select
                      value={type}
                      onChange={(event) =>
                        setType(
                          event.target.value as Client["type"]
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option>Residencial</option>
                      <option>Comercial</option>
                      <option>Empresarial</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      CPF / CNPJ
                    </label>

                    <input
                      value={document}
                      onChange={(event) =>
                        setDocument(event.target.value)
                      }
                      placeholder="CPF ou CNPJ"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      WhatsApp / Telefone *
                    </label>

                    <input
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="(16) 99999-9999"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="cliente@email.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Cidade
                    </label>

                    <select
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option>Araraquara</option>
                      <option>São Carlos</option>
                      <option>Matão</option>
                      <option>Américo Brasiliense</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Endereço
                    </label>

                    <input
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      placeholder="Rua, número, complemento"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      clearForm();
                      setShowForm(false);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600"
                  >
                    {editingClient
                      ? "Salvar alterações"
                      : "Salvar cliente"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DETALHES */}
        {showDetails && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
            <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    {selectedClient.type === "Residencial" ? (
                      <User size={22} />
                    ) : (
                      <Building2 size={22} />
                    )}
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      {selectedClient.name}
                    </h2>

                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyles[selectedClient.type]}`}
                    >
                      {selectedClient.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    CPF / CNPJ
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedClient.document || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Telefone
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedClient.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    E-mail
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedClient.email || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Endereço
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedClient.address || "Não informado"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedClient.city}
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-50 p-4">
                  <p className="text-xs text-cyan-600">
                    Equipamentos
                  </p>
                  <p className="mt-1 text-lg font-bold text-cyan-700">
                    {selectedClient.equipmentCount}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    openEdit(selectedClient);
                  }}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
                >
                  Editar cliente
                </button>

                <button
                  onClick={() =>
                    deleteClient(selectedClient.id)
                  }
                  className="rounded-xl border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
