"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum: number;
  cost: number;
  supplier: string;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Capacitor 35+5 µF",
    category: "Elétrica",
    unit: "un",
    quantity: 12,
    minimum: 5,
    cost: 38,
    supplier: "Fornecedor A",
  },
  {
    id: 2,
    name: "Gás R410A",
    category: "Refrigeração",
    unit: "kg",
    quantity: 8,
    minimum: 3,
    cost: 95,
    supplier: "Fornecedor B",
  },
  {
    id: 3,
    name: "Fita isolante",
    category: "Materiais",
    unit: "un",
    quantity: 3,
    minimum: 5,
    cost: 8,
    supplier: "Fornecedor C",
  },
];

export default function EstoquePage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "un",
    quantity: "",
    minimum: "",
    cost: "",
    supplier: "",
  });

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.category} ${p.supplier}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  );

  const lowStock = products.filter(
    (p) => p.quantity <= p.minimum
  ).length;

  const total = products.reduce(
    (sum, p) => sum + p.quantity * p.cost,
    0
  );

  function addProduct() {
    if (!form.name || !form.quantity) {
      alert("Informe o produto e a quantidade.");
      return;
    }

    setProducts((old) => [
      ...old,
      {
        id:
          old.length > 0
            ? Math.max(...old.map((x) => x.id)) + 1
            : 1,
        name: form.name,
        category: form.category,
        unit: form.unit,
        quantity: Number(form.quantity),
        minimum: Number(form.minimum || 0),
        cost: Number(form.cost || 0),
        supplier: form.supplier,
      },
    ]);

    setForm({
      name: "",
      category: "",
      unit: "un",
      quantity: "",
      minimum: "",
      cost: "",
      supplier: "",
    });

    setShowForm(false);
  }

  function removeProduct(id: number) {
    if (!confirm("Excluir produto do estoque?")) return;
    setProducts((old) => old.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-500/10 p-3">
              <Package className="h-7 w-7 text-orange-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Estoque
              </h1>
              <p className="text-sm text-slate-400">
                Materiais e peças
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950"
          >
            <Plus />
            Novo produto
          </button>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Produtos</p>
            <p className="mt-2 text-3xl font-bold">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Estoque baixo</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {lowStock}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Valor em estoque</p>
            <p className="mt-2 text-3xl font-bold">
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

        </div>

        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar produto..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {filtered.map((product) => {
            const low = product.quantity <= product.minimum;

            return (
              <div
                key={product.id}
                className="flex flex-col gap-4 border-b border-slate-800 p-5 last:border-0 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {product.name}
                    </h3>

                    {low && (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>

                  <p className="text-sm text-slate-400">
                    {product.category} • {product.supplier}
                  </p>
                </div>

                <div className="flex items-center gap-6">

                  <div>
                    <p className="text-xs text-slate-500">
                      Quantidade
                    </p>
                    <p
                      className={`font-bold ${
                        low ? "text-yellow-400" : ""
                      }`}
                    >
                      {product.quantity} {product.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Custo
                    </p>
                    <p>
                      {product.cost.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => removeProduct(product.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 />
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900">

            <div className="flex justify-between border-b border-slate-800 p-5">
              <h2 className="font-bold">Novo produto</h2>
              <button onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div className="grid gap-3 p-5">

              {[
                ["name", "Nome do produto"],
                ["category", "Categoria"],
                ["quantity", "Quantidade"],
                ["minimum", "Estoque mínimo"],
                ["cost", "Custo"],
                ["supplier", "Fornecedor"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  type={
                    ["quantity", "minimum", "cost"].includes(key)
                      ? "number"
                      : "text"
                  }
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 p-3"
                />
              ))}

              <button
                onClick={addProduct}
                className="rounded-xl bg-cyan-500 p-3 font-bold text-slate-950"
              >
                Cadastrar produto
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
