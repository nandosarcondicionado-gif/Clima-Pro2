"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type TransactionType = "Entrada" | "Saída";
type TransactionStatus = "Pago" | "Pendente";

type Transaction = {
  id: number;
  description: string;
  client: string;
  category: string;
  type: TransactionType;
  value: number;
  date: string;
  status: TransactionStatus;
};

const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Instalação de Split",
    client: "João da Silva",
    category: "Serviço",
    type: "Entrada",
    value: 450,
    date: "10/09/2026",
    status: "Pago",
  },
  {
    id: 2,
    description: "Compra de materiais",
    client: "",
    category: "Materiais",
    type: "Saída",
    value: 180,
    date: "09/09/2026",
    status: "Pago",
  },
  {
    id: 3,
    description: "Manutenção preventiva",
    client: "Clínica Saúde",
    category: "Serviço",
    type: "Entrada",
    value: 350,
    date: "08/09/2026",
    status: "Pendente",
  },
];

const emptyForm = {
  description: "",
  client: "",
  category: "Serviço",
  type: "Entrada" as TransactionType,
  value: "",
  date: "",
  status: "Pendente" as TransactionStatus,
};

export default function FinanceiroPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return transactions.filter(
      (item) =>
        item.description.toLowerCase().includes(term) ||
        item.client.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  }, [transactions, search]);

  const entradas = transactions
    .filter((x) => x.type === "Entrada")
    .reduce((sum, x) => sum + x.value, 0);

  const saidas = transactions
    .filter((x) => x.type === "Saída")
    .reduce((sum, x) => sum + x.value, 0);

  const saldo = entradas - saidas;

  const pendentes = transactions.filter(
    (x) => x.status === "Pendente"
  ).length;

  function saveTransaction() {
    if (!form.description || !form.value || !form.date) {
      alert("Preencha descrição, valor e data.");
      return;
    }

    const transaction: Transaction = {
      id:
        transactions.length > 0
          ? Math.max(...transactions.map((x) => x.id)) + 1
          : 1,
      description: form.description,
      client: form.client,
      category: form.category,
      type: form.type,
      value: Number(form.value),
      date: form.date,
      status: form.status,
    };

    setTransactions((old) => [transaction, ...old]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function deleteTransaction(id: number) {
    if (!confirm("Excluir este lançamento?")) return;

    setTransactions((old) => old.filter((x) => x.id !== id));
  }

  function money(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <DollarSign className="h-7 w-7 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Financeiro
                </h1>

                <p className="text-sm text-slate-400">
                  Controle de entradas, saídas e saldo
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
          >
            <Plus className="h-5 w-5" />
            Novo lançamento
          </button>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Entradas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {money(entradas)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Saídas</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {money(saidas)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Saldo</p>
            <p className="mt-2 text-2xl font-bold">
              {money(saldo)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pendentes</p>
            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {pendentes}
            </p>
          </div>

        </div>

        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lançamento..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">
              Lançamentos financeiros
            </h2>
          </div>

          <div className="divide-y divide-slate-800">

            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-4">
                  {item.type === "Entrada" ? (
                    <ArrowUpCircle className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <ArrowDownCircle className="h-8 w-8 text-red-400" />
                  )}

                  <div>
                    <p className="font-semibold">
                      {item.description}
                    </p>

                    <p className="text-sm text-slate-400">
                      {item.client || item.category} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        item.type === "Entrada"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {item.type === "Entrada" ? "+" : "-"}
                      {money(item.value)}
                    </p>

                    <span className="text-xs text-slate-500">
                      {item.status}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <h2 className="text-lg font-bold">
                Novo lançamento
              </h2>

              <button onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div className="grid gap-3 p-5">

              <input
                placeholder="Descrição"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              />

              <input
                placeholder="Cliente"
                value={form.client}
                onChange={(e) =>
                  setForm({ ...form, client: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as TransactionType,
                  })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              >
                <option>Entrada</option>
                <option>Saída</option>
              </select>

              <input
                placeholder="Categoria"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              />

              <input
                type="number"
                placeholder="Valor"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as TransactionStatus,
                  })
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3"
              >
                <option>Pago</option>
                <option>Pendente</option>
              </select>

              <button
                onClick={saveTransaction}
                className="mt-2 rounded-xl bg-cyan-500 p-3 font-bold text-slate-950"
              >
                Salvar lançamento
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
