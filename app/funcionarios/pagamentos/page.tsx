"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

type Funcionario = {
  id: string;
  nome: string;
  cargo: string;
  salario: number;
  status: string;
};

type Pagamento = {
  id: string;
  funcionario_id: string;
  funcionario_nome: string;
  referencia: string;
  salario_base: number;
  adicionais: number;
  descontos: number;
  adiantamento: number;
  valor_pago: number;
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

function numero(valor: string) {
  const n = Number(valor.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function PagamentosFuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const [funcionarioId, setFuncionarioId] = useState("");
  const [referencia, setReferencia] = useState("");
  const [salarioBase, setSalarioBase] = useState("");
  const [adicionais, setAdicionais] = useState("");
  const [descontos, setDescontos] = useState("");
  const [adiantamento, setAdiantamento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [status, setStatus] = useState("Pendente");
  const [observacoes, setObservacoes] = useState("");

  const valorPago =
    numero(salarioBase) +
    numero(adicionais) -
    numero(descontos) -
    numero(adiantamento);

  async function carregar() {
    setCarregando(true);

    const [funcRes, pagRes] = await Promise.all([
      supabase
        .from("funcionarios")
        .select("*")
        .order("nome", { ascending: true }),

      supabase
        .from("pagamentos_funcionarios")
        .select("*")
        .order("data_pagamento", { ascending: false }),
    ]);

    if (funcRes.data) setFuncionarios(funcRes.data);
    if (pagRes.data) setPagamentos(pagRes.data);

    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    const hoje = new Date().toISOString().slice(0, 10);

    setEditando(null);
    setFuncionarioId("");
    setReferencia("");
    setSalarioBase("");
    setAdicionais("");
    setDescontos("");
    setAdiantamento("");
    setDataPagamento(hoje);
    setFormaPagamento("Pix");
    setStatus("Pendente");
    setObservacoes("");
    setModal(true);
  }

  function selecionarFuncionario(id: string) {
    setFuncionarioId(id);

    const funcionario = funcionarios.find((f) => f.id === id);

    if (funcionario) {
      setSalarioBase(String(funcionario.salario || 0));
    }
  }

  function editarPagamento(p: Pagamento) {
    setEditando(p.id);
    setFuncionarioId(p.funcionario_id);
    setReferencia(p.referencia);
    setSalarioBase(String(p.salario_base || 0));
    setAdicionais(String(p.adicionais || 0));
    setDescontos(String(p.descontos || 0));
    setAdiantamento(String(p.adiantamento || 0));
    setDataPagamento(p.data_pagamento || "");
    setFormaPagamento(p.forma_pagamento || "Pix");
    setStatus(p.status);
    setObservacoes(p.observacoes || "");
    setModal(true);
  }

  async function salvar() {
    if (!funcionarioId) {
      alert("Selecione o funcionário.");
      return;
    }

    if (valorPago < 0) {
      alert("O valor pago não pode ser negativo.");
      return;
    }

    setSalvando(true);

    const funcionario = funcionarios.find(
      (f) => f.id === funcionarioId
    );

    const dados = {
      funcionario_id: funcionarioId,
      funcionario_nome: funcionario?.nome || "",
      referencia,
      salario_base: numero(salarioBase),
      adicionais: numero(adicionais),
      descontos: numero(descontos),
      adiantamento: numero(adiantamento),
      valor_pago: valorPago,
      data_pagamento: dataPagamento || null,
      forma_pagamento: formaPagamento,
      status,
      observacoes,
      updated_at: new Date().toISOString(),
    };

    let erro = null;

    if (editando) {
      const res = await supabase
        .from("pagamentos_funcionarios")
        .update(dados)
        .eq("id", editando);

      erro = res.error;
    } else {
      const res = await supabase
        .from("pagamentos_funcionarios")
        .insert(dados);

      erro = res.error;
    }

    if (erro) {
      alert(erro.message);
      setSalvando(false);
      return;
    }

    setModal(false);
    setSalvando(false);

    await carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Deseja realmente excluir este pagamento?")) return;

    const { error } = await supabase
      .from("pagamentos_funcionarios")
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

    if (!termo) return pagamentos;

    return pagamentos.filter(
      (p) =>
        p.funcionario_nome.toLowerCase().includes(termo) ||
        p.referencia.toLowerCase().includes(termo) ||
        p.status.toLowerCase().includes(termo)
    );
  }, [pagamentos, busca]);

  const totalPago = pagamentos
    .filter((p) => p.status === "Pago")
    .reduce((s, p) => s + Number(p.valor_pago || 0), 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <a
              href="/funcionarios"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-3"
            >
              <ArrowLeft size={18} />
              Funcionários
            </a>

            <h1 className="text-3xl font-bold">
              Pagamentos de Funcionários
            </h1>

            <p className="text-slate-400 mt-1">
              Histórico e controle dos pagamentos realizados.
            </p>
          </div>

          <button
            onClick={abrirNovo}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Novo pagamento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <UserRound size={20} />
              Funcionários
            </div>
            <div className="text-3xl font-bold mt-2">
              {funcionarios.filter((f) => f.status === "Ativo").length}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <Banknote size={20} />
              Pagamentos
            </div>
            <div className="text-3xl font-bold mt-2">
              {pagamentos.length}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <DollarSign size={20} />
              Total pago
            </div>
            <div className="text-3xl font-bold mt-2">
              {dinheiro(totalPago)}
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
              placeholder="Buscar funcionário, referência ou status..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {carregando ? (
            <div className="p-10 text-center text-slate-400">
              Carregando pagamentos...
            </div>
          ) : lista.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              Nenhum pagamento encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950">
                  <tr className="text-left text-slate-400 text-sm">
                    <th className="p-4">Funcionário</th>
                    <th className="p-4">Referência</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Forma</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {lista.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-slate-800"
                    >
                      <td className="p-4 font-semibold">
                        {p.funcionario_nome}
                      </td>

                      <td className="p-4 text-slate-300">
                        {p.referencia || "-"}
                      </td>

                      <td className="p-4 text-slate-300">
                        {p.data_pagamento
                          ? new Date(
                              p.data_pagamento + "T00:00:00"
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        {dinheiro(p.valor_pago)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {p.forma_pagamento || "-"}
                      </td>

                      <td className="p-4">
                        {p.status === "Pago" ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle2 size={17} />
                            Pago
                          </span>
                        ) : p.status === "Cancelado" ? (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <XCircle size={17} />
                            Cancelado
                          </span>
                        ) : (
                          <span className="text-yellow-400">
                            Pendente
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarPagamento(p)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => excluir(p.id)}
                            className="p-2 rounded-lg bg-red-900/40 hover:bg-red-900/70 text-red-300"
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
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editando
                    ? "Editar pagamento"
                    : "Novo pagamento"}
                </h2>

                <p className="text-sm text-slate-400">
                  Registre todos os valores do pagamento.
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="p-2 rounded-lg hover:bg-slate-800"
              >
                <XCircle />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-slate-400">
                  Funcionário
                </label>

                <select
                  value={funcionarioId}
                  onChange={(e) =>
                    selecionarFuncionario(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                >
                  <option value="">Selecione...</option>

                  {funcionarios
                    .filter((f) => f.status === "Ativo")
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome} {f.cargo ? `— ${f.cargo}` : ""}
                      </option>
                    ))}
                </select>
              </div>

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
                  Data do pagamento
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
                  Salário base
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={salarioBase}
                  onChange={(e) =>
                    setSalarioBase(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Adicionais
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={adicionais}
                  onChange={(e) =>
                    setAdicionais(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Descontos
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={descontos}
                  onChange={(e) =>
                    setDescontos(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Adiantamento
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={adiantamento}
                  onChange={(e) =>
                    setAdiantamento(e.target.value)
                  }
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                />
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

              <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-400">
                  Valor líquido a pagar
                </div>

                <div className="text-3xl font-bold mt-1">
                  {dinheiro(valorPago)}
                </div>

                <div className="text-xs text-slate-500 mt-2">
                  Base + adicionais − descontos − adiantamento
                </div>
              </div>

              <div className="md:col-span-2">
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
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                Cancelar
              </button>

              <button
                onClick={salvar}
                disabled={salvando}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
              >
                {salvando ? "Salvando..." : "Salvar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
