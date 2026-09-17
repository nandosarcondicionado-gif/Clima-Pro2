"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  UserRound,
  Banknote,
  RefreshCw,
} from "lucide-react";

type Funcionario = {
  id: string;
  nome: string;
  salario: number | null;
  status: string;
};

type Movimento = {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  forma_pagamento: string;
  categoria: string;
  funcionario_id: string | null;
  funcionario_nome: string;
  motivo: string;
  observacoes: string;
  criado_por: string;
  referencia: string;
  created_at: string;
};

const TIPOS = [
  "Entrada",
  "Despesa",
  "Sangria",
  "Pagamento funcionário",
  "Pró-labore",
];

function moeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export default function CaixaPage() {
  const supabase = createClient();

  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [busca, setBusca] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const [form, setForm] = useState({
    tipo: "Entrada",
    descricao: "",
    valor: "",
    data_movimento: hoje(),
    forma_pagamento: "Pix",
    categoria: "",
    funcionario_id: "",
    funcionario_nome: "",
    motivo: "",
    observacoes: "",
    referencia: "",
  });

  async function carregar() {
    setLoading(true);

    const [movRes, funcRes] = await Promise.all([
      supabase
        .from("caixa_movimentacoes")
        .select("*")
        .order("data_movimento", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("funcionarios")
        .select("id,nome,salario,status")
        .order("nome"),
    ]);

    if (movRes.error) {
      alert("Erro ao carregar o caixa: " + movRes.error.message);
    } else {
      setMovimentos((movRes.data || []) as Movimento[]);
    }

    if (!funcRes.error) {
      setFuncionarios((funcRes.data || []) as Funcionario[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo(tipo = "Entrada") {
    setEditando(null);

    setForm({
      tipo,
      descricao:
        tipo === "Sangria"
          ? "Sangria de caixa"
          : tipo === "Pagamento funcionário"
            ? "Pagamento de funcionário"
            : tipo === "Pró-labore"
              ? "Pró-labore"
              : "",
      valor: "",
      data_movimento: hoje(),
      forma_pagamento: "Pix",
      categoria: "",
      funcionario_id: "",
      funcionario_nome: "",
      motivo: "",
      observacoes: "",
      referencia: "",
    });

    setModal(true);
  }

  function abrirEditar(item: Movimento) {
    setEditando(item.id);

    setForm({
      tipo: item.tipo,
      descricao: item.descricao || "",
      valor: String(item.valor || ""),
      data_movimento: item.data_movimento || hoje(),
      forma_pagamento: item.forma_pagamento || "Pix",
      categoria: item.categoria || "",
      funcionario_id: item.funcionario_id || "",
      funcionario_nome: item.funcionario_nome || "",
      motivo: item.motivo || "",
      observacoes: item.observacoes || "",
      referencia: item.referencia || "",
    });

    setModal(true);
  }

  function selecionarFuncionario(id: string) {
    const funcionario = funcionarios.find((f) => f.id === id);

    setForm((old) => ({
      ...old,
      funcionario_id: id,
      funcionario_nome: funcionario?.nome || "",
      valor:
        old.tipo === "Pagamento funcionário" && funcionario?.salario
          ? String(funcionario.salario)
          : old.valor,
    }));
  }

  async function salvar() {
    if (!form.descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    const valor = Number(form.valor.replace(",", "."));

    if (!valor || valor <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (
      form.tipo === "Pagamento funcionário" &&
      !form.funcionario_id
    ) {
      alert("Selecione o funcionário.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        tipo: form.tipo,
        descricao: form.descricao,
        valor,
        data_movimento: form.data_movimento,
        forma_pagamento: form.forma_pagamento,
        categoria: form.categoria,
        funcionario_id: form.funcionario_id || null,
        funcionario_nome: form.funcionario_nome,
        motivo: form.motivo,
        observacoes: form.observacoes,
        referencia: form.referencia,
      };

      let movimentoId = editando;

      if (editando) {
        const { error } = await supabase
          .from("caixa_movimentacoes")
          .update(payload)
          .eq("id", editando);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("caixa_movimentacoes")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        movimentoId = data.id;
      }

      /*
       * PAGAMENTO DE FUNCIONÁRIO
       */
      if (
        form.tipo === "Pagamento funcionário" &&
        form.funcionario_id &&
        movimentoId
      ) {
        const funcionario = funcionarios.find(
          (f) => f.id === form.funcionario_id
        );

        const { data: existente } = await supabase
          .from("pagamentos_funcionarios")
          .select("id")
          .eq("caixa_movimentacao_id", movimentoId)
          .maybeSingle();

        const pagamento = {
          funcionario_id: form.funcionario_id,
          funcionario_nome:
            funcionario?.nome || form.funcionario_nome,
          referencia: form.referencia,
          salario_base: valor,
          adicionais: 0,
          descontos: 0,
          adiantamento: 0,
          valor_pago: valor,
          data_pagamento: form.data_movimento,
          forma_pagamento: form.forma_pagamento,
          status: "Pago",
          observacoes: form.observacoes,
          caixa_movimentacao_id: movimentoId,
        };

        if (existente) {
          const { error } = await supabase
            .from("pagamentos_funcionarios")
            .update(pagamento)
            .eq("id", existente.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("pagamentos_funcionarios")
            .insert(pagamento);

          if (error) throw error;
        }
      }

      /*
       * PRÓ-LABORE
       */
      if (form.tipo === "Pró-labore" && movimentoId) {
        const { data: existente } = await supabase
          .from("pro_labore")
          .select("id")
          .eq("caixa_movimentacao_id", movimentoId)
          .maybeSingle();

        const proLabore = {
          referencia: form.referencia,
          valor,
          data_pagamento: form.data_movimento,
          forma_pagamento: form.forma_pagamento,
          status: "Pago",
          observacoes: form.observacoes,
          caixa_movimentacao_id: movimentoId,
        };

        if (existente) {
          const { error } = await supabase
            .from("pro_labore")
            .update(proLabore)
            .eq("id", existente.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("pro_labore")
            .insert(proLabore);

          if (error) throw error;
        }
      }

      alert(editando ? "Movimentação atualizada!" : "Movimentação registrada!");

      setModal(false);
      await carregar();
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item: Movimento) {
    if (!confirm("Deseja realmente excluir esta movimentação?")) {
      return;
    }

    try {
      /*
       * Primeiro removemos os registros vinculados.
       */
      if (item.tipo === "Pagamento funcionário") {
        await supabase
          .from("pagamentos_funcionarios")
          .delete()
          .eq("caixa_movimentacao_id", item.id);
      }

      if (item.tipo === "Pró-labore") {
        await supabase
          .from("pro_labore")
          .delete()
          .eq("caixa_movimentacao_id", item.id);
      }

      const { error } = await supabase
        .from("caixa_movimentacoes")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      await carregar();
    } catch (error: any) {
      alert("Erro ao excluir: " + error.message);
    }
  }

  const filtrados = useMemo(() => {
    const texto = busca.toLowerCase().trim();

    if (!texto) return movimentos;

    return movimentos.filter((item) =>
      [
        item.tipo,
        item.descricao,
        item.funcionario_nome,
        item.categoria,
        item.motivo,
        item.referencia,
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [movimentos, busca]);

  const resumo = useMemo(() => {
    let entradas = 0;
    let saidas = 0;

    for (const item of movimentos) {
      if (item.tipo === "Entrada") {
        entradas += Number(item.valor || 0);
      } else {
        saidas += Number(item.valor || 0);
      }
    }

    const sangrias = movimentos
      .filter((x) => x.tipo === "Sangria")
      .reduce((a, x) => a + Number(x.valor || 0), 0);

    const pagamentos = movimentos
      .filter((x) => x.tipo === "Pagamento funcionário")
      .reduce((a, x) => a + Number(x.valor || 0), 0);

    const proLabore = movimentos
      .filter((x) => x.tipo === "Pró-labore")
      .reduce((a, x) => a + Number(x.valor || 0), 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      sangrias,
      pagamentos,
      proLabore,
    };
  }, [movimentos]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/financeiro"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Caixa
              </h1>
              <p className="text-slate-400">
                Controle financeiro da empresa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => abrirNovo("Sangria")}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold"
            >
              Nova sangria
            </button>

            <button
              onClick={() => abrirNovo("Pagamento funcionário")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Pagar funcionário
            </button>

            <button
              onClick={() => abrirNovo("Pró-labore")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold"
            >
              Pró-labore
            </button>

            <button
              onClick={() => abrirNovo("Entrada")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center gap-2"
            >
              <Plus size={18} />
              Nova entrada
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Wallet />
              <span className="text-slate-400">Saldo</span>
            </div>
            <strong className="block text-2xl mt-3">
              {moeda(resumo.saldo)}
            </strong>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="text-emerald-400" />
              <span className="text-slate-400">Entradas</span>
            </div>
            <strong className="block text-2xl mt-3">
              {moeda(resumo.entradas)}
            </strong>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="text-red-400" />
              <span className="text-slate-400">Saídas</span>
            </div>
            <strong className="block text-2xl mt-3">
              {moeda(resumo.saidas)}
            </strong>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Banknote />
              <span className="text-slate-400">Funcionários</span>
            </div>
            <strong className="block text-2xl mt-3">
              {moeda(resumo.pagamentos)}
            </strong>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Sangrias</p>
            <strong>{moeda(resumo.sangrias)}</strong>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Pagamentos funcionários</p>
            <strong>{moeda(resumo.pagamentos)}</strong>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Pró-labore</p>
            <strong>{moeda(resumo.proLabore)}</strong>
          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex gap-3 items-center">
            <Search size={20} className="text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar movimentações..."
              className="bg-transparent outline-none w-full"
            />

            <button
              onClick={carregar}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Carregando caixa...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Responsável</th>
                    <th className="text-left p-4">Forma</th>
                    <th className="text-right p-4">Valor</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800"
                    >
                      <td className="p-4 whitespace-nowrap">
                        {item.data_movimento
                          ? new Date(
                              item.data_movimento + "T12:00:00"
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-slate-800">
                          {item.tipo}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-medium">
                          {item.descricao}
                        </div>

                        {item.referencia && (
                          <div className="text-xs text-slate-500">
                            {item.referencia}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {item.funcionario_nome || "-"}
                      </td>

                      <td className="p-4">
                        {item.forma_pagamento || "-"}
                      </td>

                      <td
                        className={`p-4 text-right font-bold ${
                          item.tipo === "Entrada"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.tipo === "Entrada" ? "+" : "-"}
                        {moeda(Number(item.valor))}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirEditar(item)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => excluir(item)}
                            className="p-2 rounded-lg bg-red-900/40 hover:bg-red-900"
                          >
                            <Trash2 size={16} />
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

        {modal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 max-h-[90vh] overflow-y-auto">

              <h2 className="text-xl font-bold mb-5">
                {editando ? "Editar movimentação" : "Nova movimentação"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Tipo
                  </span>

                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  >
                    {TIPOS.map((tipo) => (
                      <option key={tipo}>{tipo}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Data
                  </span>

                  <input
                    type="date"
                    value={form.data_movimento}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        data_movimento: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm text-slate-400">
                    Descrição
                  </span>

                  <input
                    value={form.descricao}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descricao: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  />
                </label>

                {form.tipo === "Pagamento funcionário" && (
                  <label className="block md:col-span-2">
                    <span className="text-sm text-slate-400">
                      Funcionário
                    </span>

                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-3 top-3.5 text-slate-500"
                      />

                      <select
                        value={form.funcionario_id}
                        onChange={(e) =>
                          selecionarFuncionario(e.target.value)
                        }
                        className="mt-1 w-full bg-slate-800 rounded-xl p-3 pl-10"
                      >
                        <option value="">
                          Selecione o funcionário
                        </option>

                        {funcionarios
                          .filter((f) => f.status === "Ativo")
                          .map((funcionario) => (
                            <option
                              key={funcionario.id}
                              value={funcionario.id}
                            >
                              {funcionario.nome}
                            </option>
                          ))}
                      </select>
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Valor
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Forma de pagamento
                  </span>

                  <select
                    value={form.forma_pagamento}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        forma_pagamento: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Transferência</option>
                    <option>Cartão</option>
                    <option>Boleto</option>
                    <option>Outro</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Categoria
                  </span>

                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoria: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                    placeholder="Ex.: combustível"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-slate-400">
                    Referência
                  </span>

                  <input
                    value={form.referencia}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        referencia: e.target.value,
                      })
                    }
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                    placeholder="Ex.: Setembro/2026"
                  />
                </label>

                {(form.tipo === "Sangria" ||
                  form.tipo === "Pró-labore") && (
                  <label className="block md:col-span-2">
                    <span className="text-sm text-slate-400">
                      Motivo
                    </span>

                    <input
                      value={form.motivo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          motivo: e.target.value,
                        })
                      }
                      className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                      placeholder={
                        form.tipo === "Sangria"
                          ? "Ex.: retirada para compra de material"
                          : "Ex.: pró-labore mensal"
                      }
                    />
                  </label>
                )}

                <label className="block md:col-span-2">
                  <span className="text-sm text-slate-400">
                    Observações
                  </span>

                  <textarea
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        observacoes: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 w-full bg-slate-800 rounded-xl p-3"
                  />
                </label>

              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => setModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-800"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
