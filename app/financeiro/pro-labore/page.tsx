"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

type ProLabore = {
  id: string;
  referencia: string;
  valor: number;
  data_pagamento: string | null;
  forma_pagamento: string;
  status: string;
  observacoes: string;
};

const supabase = createClient();

function dinheiro(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProLaborePage() {
  const [dados, setDados] = useState<ProLabore[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const [referencia, setReferencia] = useState("");
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [status, setStatus] = useState("Pendente");
  const [observacoes, setObservacoes] = useState("");

  async function carregar() {
    const { data, error } = await supabase
      .from("pro_labore")
      .select("*")
      .order("data_pagamento", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setDados(data || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setReferencia("");
    setValor("");
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setFormaPagamento("Pix");
    setStatus("Pendente");
    setObservacoes("");
    setModal(true);
  }

  function editar(item: ProLabore) {
    setEditando(item.id);
    setReferencia(item.referencia);
    setValor(String(item.valor || 0));
    setDataPagamento(item.data_pagamento || "");
    setFormaPagamento(item.forma_pagamento || "Pix");
    setStatus(item.status);
    setObservacoes(item.observacoes || "");
    setModal(true);
  }

  async function salvar() {
    const valorNumero = Number(valor.replace(",", "."));

    if (!valorNumero || valorNumero <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    const dadosSalvar = {
      referencia,
      valor: valorNumero,
      data_pagamento: dataPagamento || null,
      forma_pagamento: formaPagamento,
      status,
      observacoes,
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (editando) {
      const res = await supabase
        .from("pro_labore")
        .update(dadosSalvar)
        .eq("id", editando);

      error = res.error;
    } else {
      const res = await supabase
        .from("pro_labore")
        .insert(dadosSalvar);

      error = res.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    setModal(false);
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Deseja excluir este pró-labore?")) return;

    const { error } = await supabase
      .from("pro_labore")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    carregar();
  }

  const lista = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return dados;

    return dados.filter(
      (item) =>
        item.referencia.toLowerCase().includes(termo) ||
        item.status.toLowerCase().includes(termo)
    );
  }, [dados, busca]);

  const totalPago = dados
    .filter((d) => d.status === "Pago")
    .reduce((s, d) => s + Number(d.valor || 0), 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <a
              href="/financeiro"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-3"
            >
              <ArrowLeft size={18} />
              Financeiro
            </a>

            <h1 className="text-3xl font-bold">
              Pró-labore
            </h1>

            <p className="text-slate-400 mt-1">
              Controle separado da retirada do responsável pela empresa.
            </p>
          </div>

          <button
            onClick={abrirNovo}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Novo pró-labore
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 flex items-center gap-2">
              <DollarSign size={19} />
              Total pago
            </div>

            <div className="text-3xl font-bold mt-2">
              {dinheiro(totalPago)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400">
              Registros
            </div>

            <div className="text-3xl font-bold mt-2">
              {dados.length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-3.5 text-slate-500"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar referência ou status..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {lista.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              Nenhum pró-labore cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950">
                  <tr className="text-left text-slate-400 text-sm">
                    <th className="p-4">Referência</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Forma</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {lista.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800"
                    >
                      <td className="p-4 font-semibold">
                        {item.referencia || "-"}
                      </td>

                      <td className="p-4">
                        {item.data_pagamento
                          ? new Date(
                              item.data_pagamento + "T00:00:00"
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {dinheiro(item.valor)}
                      </td>

                      <td className="p-4">
                        {item.forma_pagamento || "-"}
                      </td>

                      <td className="p-4">
                        {item.status}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editar(item)}
                            className="p-2 rounded-lg bg-slate-800"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => excluir(item.id)}
                            className="p-2 rounded-lg bg-red-900/40 text-red-300"
                          >
                            <Trash2 size={17} />
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

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between">
              <h2 className="text-xl font-bold">
                {editando ? "Editar pró-labore" : "Novo pró-labore"}
              </h2>

              <button onClick={() => setModal(false)}>
                <XCircle />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm text-slate-400">
                  Referência
                </label>

                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ex.: Setembro/2026"
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Valor
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Data
                </label>

                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-3.5 text-slate-500"
                  />

                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) =>
                      setDataPagamento(e.target.value)
                    }
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Forma de pagamento
                </label>

                <select
                  value={formaPagamento}
                  onChange={(e) =>
                    setFormaPagamento(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                >
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Transferência</option>
                  <option>Cartão</option>
                  <option>Outro</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                >
                  <option>Pendente</option>
                  <option>Pago</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Observações
                </label>

                <textarea
                  value={observacoes}
                  onChange={(e) =>
                    setObservacoes(e.target.value)
                  }
                  rows={3}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setModal(false)}
                className="px-5 py-3 rounded-xl bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={salvar}
                className="px-5 py-3 rounded-xl bg-blue-600 font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
