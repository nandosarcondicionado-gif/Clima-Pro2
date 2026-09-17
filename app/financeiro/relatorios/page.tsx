"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

type Movimento = {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  forma_pagamento: string;
  categoria: string;
};

type Pagamento = {
  valor_pago: number;
  data_pagamento: string | null;
  status: string;
};

const supabase = createClient();

function dinheiro(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function RelatoriosFinanceirosPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [mes, setMes] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);

    const inicio = `${mes}-01`;
    const [ano, mesNumero] = mes.split("-").map(Number);

    const ultimoDia = new Date(
      ano,
      mesNumero,
      0
    ).getDate();

    const fim = `${mes}-${String(ultimoDia).padStart(2, "0")}`;

    const [movRes, pagRes] = await Promise.all([
      supabase
        .from("caixa_movimentacoes")
        .select("*")
        .gte("data_movimento", inicio)
        .lte("data_movimento", fim)
        .order("data_movimento", { ascending: true }),

      supabase
        .from("pagamentos_funcionarios")
        .select("valor_pago,data_pagamento,status")
        .gte("data_pagamento", inicio)
        .lte("data_pagamento", fim),
    ]);

    if (movRes.data) setMovimentos(movRes.data);
    if (pagRes.data) setPagamentos(pagRes.data);

    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, [mes]);

  const entradas = useMemo(
    () =>
      movimentos
        .filter((m) => m.tipo === "Entrada")
        .reduce((s, m) => s + Number(m.valor || 0), 0),
    [movimentos]
  );

  const despesas = useMemo(
    () =>
      movimentos
        .filter((m) => m.tipo === "Despesa")
        .reduce((s, m) => s + Number(m.valor || 0), 0),
    [movimentos]
  );

  const sangrias = useMemo(
    () =>
      movimentos
        .filter((m) => m.tipo === "Sangria")
        .reduce((s, m) => s + Number(m.valor || 0), 0),
    [movimentos]
  );

  const funcionarios = useMemo(
    () =>
      pagamentos
        .filter((p) => p.status === "Pago")
        .reduce((s, p) => s + Number(p.valor_pago || 0), 0),
    [pagamentos]
  );

  const proLabore = useMemo(
    () =>
      movimentos
        .filter((m) => m.tipo === "Pró-labore")
        .reduce((s, m) => s + Number(m.valor || 0), 0),
    [movimentos]
  );

  const totalSaidas =
    despesas +
    sangrias +
    funcionarios +
    proLabore;

  const resultado = entradas - totalSaidas;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
              Relatórios Financeiros
            </h1>

            <p className="text-slate-400">
              Visão financeira mensal da empresa.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
            <CalendarDays size={20} className="text-slate-400" />

            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="bg-transparent outline-none"
            />
          </div>
        </div>

        {carregando ? (
          <div className="text-center p-10 text-slate-400">
            Carregando relatório...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingUp size={19} />
                  Entradas
                </div>

                <div className="text-2xl font-bold mt-2 text-green-400">
                  {dinheiro(entradas)}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingDown size={19} />
                  Despesas
                </div>

                <div className="text-2xl font-bold mt-2">
                  {dinheiro(despesas)}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={19} />
                  Funcionários
                </div>

                <div className="text-2xl font-bold mt-2">
                  {dinheiro(funcionarios)}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign size={19} />
                  Resultado
                </div>

                <div className="text-2xl font-bold mt-2">
                  {dinheiro(resultado)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 />
                  <h2 className="text-xl font-bold">
                    Resumo do mês
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">
                      Entradas
                    </span>
                    <strong className="text-green-400">
                      {dinheiro(entradas)}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">
                      Despesas
                    </span>
                    <strong>
                      {dinheiro(despesas)}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">
                      Sangrias
                    </span>
                    <strong>
                      {dinheiro(sangrias)}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">
                      Pagamentos de funcionários
                    </span>
                    <strong>
                      {dinheiro(funcionarios)}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">
                      Pró-labore
                    </span>
                    <strong>
                      {dinheiro(proLabore)}
                    </strong>
                  </div>

                  <div className="flex justify-between text-lg pt-2">
                    <span>Resultado</span>
                    <strong>
                      {dinheiro(resultado)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">
                  Movimentações do período
                </h2>

                {movimentos.length === 0 ? (
                  <p className="text-slate-400">
                    Nenhuma movimentação encontrada.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto">
                    {movimentos.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between gap-4 border-b border-slate-800 pb-3"
                      >
                        <div>
                          <div className="font-medium">
                            {m.descricao || m.tipo}
                          </div>

                          <div className="text-xs text-slate-500">
                            {new Date(
                              m.data_movimento + "T00:00:00"
                            ).toLocaleDateString("pt-BR")}{" "}
                            · {m.tipo}
                          </div>
                        </div>

                        <div className="font-semibold whitespace-nowrap">
                          {dinheiro(m.valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
