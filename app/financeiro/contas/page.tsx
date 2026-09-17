"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Tipo = "Receber" | "Pagar";
type Status = "Pendente" | "Pago" | "Cancelado";

type Conta = {
  id: string;
  tipo: Tipo;
  descricao: string;
  pessoa: string;
  documento: string;
  valor: number;
  vencimento: string | null;
  data_pagamento: string | null;
  forma_pagamento: string;
  categoria: string;
  status: Status;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

const supabase = createClient();

const moeda = (valor: number) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataBR = (data: string | null) => {
  if (!data) return "-";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const hoje = () => {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

export default function ContasFinanceirasPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"Todos" | Tipo>("Todos");
  const [filtroStatus, setFiltroStatus] = useState<
    "Todos" | Status
  >("Todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [form, setForm] = useState({
    tipo: "Pagar" as Tipo,
    descricao: "",
    pessoa: "",
    documento: "",
    valor: "",
    vencimento: "",
    data_pagamento: "",
    forma_pagamento: "",
    categoria: "",
    status: "Pendente" as Status,
    observacoes: "",
  });

  async function carregarContas() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contas_financeiras")
      .select("*")
      .order("vencimento", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar as contas.");
      setLoading(false);
      return;
    }

    setContas((data || []) as Conta[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarContas();
  }, []);

  function abrirNovaConta(tipo: Tipo = "Pagar") {
    setEditandoId(null);

    setForm({
      tipo,
      descricao: "",
      pessoa: "",
      documento: "",
      valor: "",
      vencimento: hoje(),
      data_pagamento: "",
      forma_pagamento: "",
      categoria: "",
      status: "Pendente",
      observacoes: "",
    });

    setModalAberto(true);
  }

  function abrirEdicao(conta: Conta) {
    setEditandoId(conta.id);

    setForm({
      tipo: conta.tipo,
      descricao: conta.descricao || "",
      pessoa: conta.pessoa || "",
      documento: conta.documento || "",
      valor: String(conta.valor ?? ""),
      vencimento: conta.vencimento || "",
      data_pagamento: conta.data_pagamento || "",
      forma_pagamento: conta.forma_pagamento || "",
      categoria: conta.categoria || "",
      status: conta.status,
      observacoes: conta.observacoes || "",
    });

    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEditandoId(null);
  }

  async function salvarConta() {
    if (!form.descricao.trim()) {
      alert("Informe a descrição da conta.");
      return;
    }

    const valor = Number(
      String(form.valor).replace(",", ".")
    );

    if (!Number.isFinite(valor) || valor <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    setSalvando(true);

    const payload = {
      tipo: form.tipo,
      descricao: form.descricao.trim(),
      pessoa: form.pessoa.trim(),
      documento: form.documento.trim(),
      valor,
      vencimento: form.vencimento || null,
      data_pagamento:
        form.status === "Pago"
          ? form.data_pagamento || hoje()
          : form.data_pagamento || null,
      forma_pagamento: form.forma_pagamento.trim(),
      categoria: form.categoria.trim(),
      status: form.status,
      observacoes: form.observacoes.trim(),
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (editandoId) {
      const resultado = await supabase
        .from("contas_financeiras")
        .update(payload)
        .eq("id", editandoId);

      error = resultado.error;
    } else {
      const resultado = await supabase
        .from("contas_financeiras")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        });

      error = resultado.error;
    }

    setSalvando(false);

    if (error) {
      console.error(error);
      alert(`Erro ao salvar conta: ${error.message}`);
      return;
    }

    setModalAberto(false);
    setEditandoId(null);

    await carregarContas();
  }

  async function marcarComoPaga(conta: Conta) {
    if (conta.status === "Pago") return;

    const confirmar = window.confirm(
      `Marcar a conta "${conta.descricao}" como paga?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("contas_financeiras")
      .update({
        status: "Pago",
        data_pagamento: hoje(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conta.id);

    if (error) {
      console.error(error);
      alert(`Erro ao marcar como paga: ${error.message}`);
      return;
    }

    await carregarContas();
  }

  async function cancelarConta(conta: Conta) {
    const confirmar = window.confirm(
      `Cancelar a conta "${conta.descricao}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("contas_financeiras")
      .update({
        status: "Cancelado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conta.id);

    if (error) {
      console.error(error);
      alert(`Erro ao cancelar conta: ${error.message}`);
      return;
    }

    await carregarContas();
  }

  async function excluirConta(conta: Conta) {
    const confirmar = window.confirm(
      `Excluir definitivamente a conta "${conta.descricao}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("contas_financeiras")
      .delete()
      .eq("id", conta.id);

    if (error) {
      console.error(error);
      alert(`Erro ao excluir conta: ${error.message}`);
      return;
    }

    await carregarContas();
  }

  const contasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return contas.filter((conta) => {
      const correspondeBusca =
        !termo ||
        conta.descricao?.toLowerCase().includes(termo) ||
        conta.pessoa?.toLowerCase().includes(termo) ||
        conta.documento?.toLowerCase().includes(termo) ||
        conta.categoria?.toLowerCase().includes(termo);

      const correspondeTipo =
        filtroTipo === "Todos" || conta.tipo === filtroTipo;

      const correspondeStatus =
        filtroStatus === "Todos" || conta.status === filtroStatus;

      return (
        correspondeBusca &&
        correspondeTipo &&
        correspondeStatus
      );
    });
  }, [contas, busca, filtroTipo, filtroStatus]);

  const resumo = useMemo(() => {
    const receber = contas
      .filter(
        (c) => c.tipo === "Receber" && c.status !== "Cancelado"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    const receberPendente = contas
      .filter(
        (c) => c.tipo === "Receber" && c.status === "Pendente"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    const pagar = contas
      .filter(
        (c) => c.tipo === "Pagar" && c.status !== "Cancelado"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    const pagarPendente = contas
      .filter(
        (c) => c.tipo === "Pagar" && c.status === "Pendente"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    const recebido = contas
      .filter(
        (c) => c.tipo === "Receber" && c.status === "Pago"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    const pago = contas
      .filter(
        (c) => c.tipo === "Pagar" && c.status === "Pago"
      )
      .reduce((total, c) => total + Number(c.valor || 0), 0);

    return {
      receber,
      receberPendente,
      pagar,
      pagarPendente,
      recebido,
      pago,
    };
  }, [contas]);

  function statusClasse(status: Status) {
    if (status === "Pago") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "Cancelado") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  }

  function tipoClasse(tipo: Tipo) {
    if (tipo === "Receber") {
      return "text-emerald-600";
    }

    return "text-red-600";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Contas a Pagar e Receber
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Controle financeiro das contas da empresa.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => abrirNovaConta("Receber")}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <ArrowDownCircle size={18} />
              Nova conta a receber
            </button>

            <button
              onClick={() => abrirNovaConta("Pagar")}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              <ArrowUpCircle size={18} />
              Nova conta a pagar
            </button>
          </div>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total a receber
              </span>

              <ArrowDownCircle
                size={22}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              {moeda(resumo.receber)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pendente: {moeda(resumo.receberPendente)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total a pagar
              </span>

              <ArrowUpCircle
                size={22}
                className="text-red-600"
              />
            </div>

            <p className="mt-3 text-2xl font-bold text-red-600">
              {moeda(resumo.pagar)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pendente: {moeda(resumo.pagarPendente)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="text-sm font-medium text-slate-500">
              Já recebido
            </span>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              {moeda(resumo.recebido)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="text-sm font-medium text-slate-500">
              Já pago
            </span>

            <p className="mt-3 text-2xl font-bold text-red-600">
              {moeda(resumo.pago)}
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar conta, pessoa, documento..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(
                  e.target.value as "Todos" | Tipo
                )
              }
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Receber">A receber</option>
              <option value="Pagar">A pagar</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(
                  e.target.value as "Todos" | Status
                )
              }
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="Todos">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Contas cadastradas
              </h2>

              <p className="text-xs text-slate-500">
                {contasFiltradas.length} conta(s) encontrada(s)
              </p>
            </div>

            <button
              onClick={() => abrirNovaConta("Pagar")}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={17} />
              Nova
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Carregando contas...
            </div>
          ) : contasFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                Nenhuma conta encontrada.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre uma conta a pagar ou receber.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="divide-y divide-slate-200 md:hidden">
                {contasFiltradas.map((conta) => (
                  <div key={conta.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {conta.descricao}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {conta.pessoa || "Sem pessoa informada"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasse(
                          conta.status
                        )}`}
                      >
                        {conta.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">
                          Tipo
                        </p>

                        <p
                          className={`font-semibold ${tipoClasse(
                            conta.tipo
                          )}`}
                        >
                          {conta.tipo}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Valor
                        </p>

                        <p className="font-bold text-slate-900">
                          {moeda(Number(conta.valor))}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Vencimento
                        </p>

                        <p className="font-medium text-slate-700">
                          {dataBR(conta.vencimento)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Categoria
                        </p>

                        <p className="font-medium text-slate-700">
                          {conta.categoria || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {conta.status === "Pendente" && (
                        <button
                          onClick={() =>
                            marcarComoPaga(conta)
                          }
                          className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700"
                        >
                          <CheckCircle2 size={15} />
                          Marcar pago
                        </button>
                      )}

                      <button
                        onClick={() => abrirEdicao(conta)}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        <Edit size={15} />
                        Editar
                      </button>

                      {conta.status !== "Cancelado" && (
                        <button
                          onClick={() =>
                            cancelarConta(conta)
                          }
                          className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700"
                        >
                          <X size={15} />
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => excluirConta(conta)}
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        <Trash2 size={15} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Tipo
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Descrição
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Pessoa
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Vencimento
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-slate-600">
                        Valor
                      </th>

                      <th className="px-4 py-3 text-center font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-slate-600">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {contasFiltradas.map((conta) => (
                      <tr
                        key={conta.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <span
                            className={`font-semibold ${tipoClasse(
                              conta.tipo
                            )}`}
                          >
                            {conta.tipo}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {conta.descricao}
                          </p>

                          {conta.categoria && (
                            <p className="mt-1 text-xs text-slate-400">
                              {conta.categoria}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {conta.pessoa || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {dataBR(conta.vencimento)}
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                          {moeda(Number(conta.valor))}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasse(
                              conta.status
                            )}`}
                          >
                            {conta.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {conta.status === "Pendente" && (
                              <button
                                title="Marcar como pago"
                                onClick={() =>
                                  marcarComoPaga(conta)
                                }
                                className="rounded-lg bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-200"
                              >
                                <CheckCircle2 size={17} />
                              </button>
                            )}

                            <button
                              title="Editar"
                              onClick={() =>
                                abrirEdicao(conta)
                              }
                              className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                            >
                              <Edit size={17} />
                            </button>

                            {conta.status !== "Cancelado" && (
                              <button
                                title="Cancelar"
                                onClick={() =>
                                  cancelarConta(conta)
                                }
                                className="rounded-lg bg-amber-100 p-2 text-amber-700 hover:bg-amber-200"
                              >
                                <X size={17} />
                              </button>
                            )}

                            <button
                              title="Excluir"
                              onClick={() =>
                                excluirConta(conta)
                              }
                              className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
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
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editandoId
                    ? "Editar conta"
                    : form.tipo === "Receber"
                    ? "Nova conta a receber"
                    : "Nova conta a pagar"}
                </h2>

                <p className="text-xs text-slate-500">
                  Preencha os dados financeiros.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* TIPO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tipo
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tipo: "Receber",
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      form.tipo === "Receber"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    Conta a receber
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tipo: "Pagar",
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      form.tipo === "Pagar"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    Conta a pagar
                  </button>
                </div>
              </div>

              {/* DESCRIÇÃO / PESSOA */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Descrição *
                  </label>

                  <input
                    value={form.descricao}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder={
                      form.tipo === "Receber"
                        ? "Ex.: Instalação de ar-condicionado"
                        : "Ex.: Compra de material"
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Cliente / Fornecedor
                  </label>

                  <input
                    value={form.pessoa}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pessoa: e.target.value,
                      }))
                    }
                    placeholder="Nome"
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* DOCUMENTO / VALOR */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Documento
                  </label>

                  <input
                    value={form.documento}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        documento: e.target.value,
                      }))
                    }
                    placeholder="Nota, recibo, OS..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Valor *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        valor: e.target.value,
                      }))
                    }
                    placeholder="0,00"
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* DATAS */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Vencimento
                  </label>

                  <input
                    type="date"
                    value={form.vencimento}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        vencimento: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Data do pagamento
                  </label>

                  <input
                    type="date"
                    value={form.data_pagamento}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        data_pagamento: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as Status,
                        data_pagamento:
                          e.target.value === "Pago"
                            ? f.data_pagamento || hoje()
                            : f.data_pagamento,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Pendente">
                      Pendente
                    </option>
                    <option value="Pago">Pago</option>
                    <option value="Cancelado">
                      Cancelado
                    </option>
                  </select>
                </div>
              </div>

              {/* PAGAMENTO / CATEGORIA */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Forma de pagamento
                  </label>

                  <select
                    value={form.forma_pagamento}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        forma_pagamento: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">
                      Dinheiro
                    </option>
                    <option value="Cartão">
                      Cartão
                    </option>
                    <option value="Transferência">
                      Transferência
                    </option>
                    <option value="Boleto">
                      Boleto
                    </option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Categoria
                  </label>

                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        categoria: e.target.value,
                      }))
                    }
                    placeholder="Ex.: Material, combustível, serviço..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Observações
                </label>

                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      observacoes: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Observações da conta..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* BOTÕES */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarConta}
                  disabled={salvando}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId
                    ? "Salvar alterações"
                    : "Cadastrar conta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
