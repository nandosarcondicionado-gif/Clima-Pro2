"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

type Produto = {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade: number;
  estoque_minimo: number;
  custo: number;
  fornecedor: string | null;
  created_at?: string;
  updated_at?: string;
};

type FormProduto = {
  nome: string;
  categoria: string;
  unidade: string;
  quantidade: string;
  estoque_minimo: string;
  custo: string;
  fornecedor: string;
};

type MovimentoTipo = "Entrada" | "Saída";

const categorias = [
  "Elétrica",
  "Refrigeração",
  "Materiais",
  "Ferramentas",
  "Limpeza",
  "Outros",
];

const unidades = ["un", "kg", "m", "L", "caixa", "kit"];

const produtoVazio: FormProduto = {
  nome: "",
  categoria: "Refrigeração",
  unidade: "un",
  quantidade: "0",
  estoque_minimo: "0",
  custo: "0",
  fornecedor: "",
};

export default function EstoquePage() {
  const supabase = createClient();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");

  const [modalProduto, setModalProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<FormProduto>(produtoVazio);

  const [modalMovimento, setModalMovimento] = useState(false);
  const [produtoMovimento, setProdutoMovimento] = useState<Produto | null>(
    null
  );
  const [tipoMovimento, setTipoMovimento] =
    useState<MovimentoTipo>("Entrada");
  const [quantidadeMovimento, setQuantidadeMovimento] = useState("");
  const [motivoMovimento, setMotivoMovimento] = useState("");
  const [salvandoMovimento, setSalvandoMovimento] = useState(false);

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        console.error(error);
        setMensagem("Erro ao carregar o estoque.");
        return;
      }

      setProdutos((data || []) as Produto[]);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar o estoque.");
    } finally {
      setCarregando(false);
    }
  }

  function mostrarMensagem(texto: string) {
    setMensagem(texto);

    setTimeout(() => {
      setMensagem("");
    }, 3000);
  }

  function abrirNovoProduto() {
    setProdutoEditando(null);
    setForm(produtoVazio);
    setModalProduto(true);
  }

  function abrirEditarProduto(produto: Produto) {
    setProdutoEditando(produto);

    setForm({
      nome: produto.nome || "",
      categoria: produto.categoria || "Refrigeração",
      unidade: produto.unidade || "un",
      quantidade: String(produto.quantidade ?? 0),
      estoque_minimo: String(produto.estoque_minimo ?? 0),
      custo: String(produto.custo ?? 0),
      fornecedor: produto.fornecedor || "",
    });

    setModalProduto(true);
  }

  function fecharModalProduto() {
    if (salvando) return;

    setModalProduto(false);
    setProdutoEditando(null);
    setForm(produtoVazio);
  }

  function alterarCampo(
    campo: keyof FormProduto,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvarProduto() {
    if (!form.nome.trim()) {
      mostrarMensagem("Informe o nome do produto.");
      return;
    }

    const quantidade = Number(form.quantidade.replace(",", "."));
    const estoqueMinimo = Number(
      form.estoque_minimo.replace(",", ".")
    );
    const custo = Number(form.custo.replace(",", "."));

    if (
      Number.isNaN(quantidade) ||
      Number.isNaN(estoqueMinimo) ||
      Number.isNaN(custo)
    ) {
      mostrarMensagem("Confira os valores informados.");
      return;
    }

    if (quantidade < 0 || estoqueMinimo < 0 || custo < 0) {
      mostrarMensagem("Os valores não podem ser negativos.");
      return;
    }

    try {
      setSalvando(true);

      if (produtoEditando) {
        const { data, error } = await supabase
          .from("estoque_produtos")
          .update({
            nome: form.nome.trim(),
            categoria: form.categoria,
            unidade: form.unidade,
            quantidade,
            estoque_minimo: estoqueMinimo,
            custo,
            fornecedor: form.fornecedor.trim() || null,
          })
          .eq("id", produtoEditando.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          mostrarMensagem("Erro ao atualizar o produto.");
          return;
        }

        setProdutos((anteriores) =>
          anteriores.map((produto) =>
            produto.id === produtoEditando.id
              ? (data as Produto)
              : produto
          )
        );

        mostrarMensagem("Produto atualizado com sucesso.");
      } else {
        const { data, error } = await supabase
          .from("estoque_produtos")
          .insert({
            nome: form.nome.trim(),
            categoria: form.categoria,
            unidade: form.unidade,
            quantidade,
            estoque_minimo: estoqueMinimo,
            custo,
            fornecedor: form.fornecedor.trim() || null,
          })
          .select()
          .single();

        if (error) {
          console.error(error);
          mostrarMensagem("Erro ao cadastrar o produto.");
          return;
        }

        setProdutos((anteriores) =>
          [...anteriores, data as Produto].sort((a, b) =>
            a.nome.localeCompare(b.nome)
          )
        );

        mostrarMensagem("Produto cadastrado com sucesso.");
      }

      fecharModalProduto();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmar) return;

    try {
      const { error: movimentoError } = await supabase
        .from("movimentacoes_estoque")
        .delete()
        .eq("produto_id", produto.id);

      if (movimentoError) {
        console.error(movimentoError);
      }

      const { error } = await supabase
        .from("estoque_produtos")
        .delete()
        .eq("id", produto.id);

      if (error) {
        console.error(error);
        mostrarMensagem("Erro ao excluir o produto.");
        return;
      }

      setProdutos((anteriores) =>
        anteriores.filter((item) => item.id !== produto.id)
      );

      mostrarMensagem("Produto excluído com sucesso.");
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao excluir o produto.");
    }
  }

  function abrirMovimento(
    produto: Produto,
    tipo: MovimentoTipo
  ) {
    setProdutoMovimento(produto);
    setTipoMovimento(tipo);
    setQuantidadeMovimento("");
    setMotivoMovimento("");
    setModalMovimento(true);
  }

  function fecharModalMovimento() {
    if (salvandoMovimento) return;

    setModalMovimento(false);
    setProdutoMovimento(null);
    setQuantidadeMovimento("");
    setMotivoMovimento("");
  }

  async function salvarMovimento() {
    if (!produtoMovimento) return;

    const quantidade = Number(
      quantidadeMovimento.replace(",", ".")
    );

    if (!quantidade || quantidade <= 0) {
      mostrarMensagem("Informe uma quantidade válida.");
      return;
    }

    if (tipoMovimento === "Saída") {
      if (quantidade > Number(produtoMovimento.quantidade)) {
        mostrarMensagem(
          "A quantidade de saída é maior que o estoque disponível."
        );
        return;
      }
    }

    try {
      setSalvandoMovimento(true);

      const quantidadeAtual = Number(produtoMovimento.quantidade);

      const novaQuantidade =
        tipoMovimento === "Entrada"
          ? quantidadeAtual + quantidade
          : quantidadeAtual - quantidade;

      const { data: produtoAtualizado, error: produtoError } =
        await supabase
          .from("estoque_produtos")
          .update({
            quantidade: novaQuantidade,
          })
          .eq("id", produtoMovimento.id)
          .select()
          .single();

      if (produtoError) {
        console.error(produtoError);
        mostrarMensagem("Erro ao atualizar o estoque.");
        return;
      }

      const { error: movimentoError } = await supabase
        .from("movimentacoes_estoque")
        .insert({
          produto_id: produtoMovimento.id,
          tipo: tipoMovimento,
          quantidade,
          motivo: motivoMovimento.trim() || null,
        });

      if (movimentoError) {
        console.error(movimentoError);

        // Tenta desfazer a alteração da quantidade caso
        // o registro da movimentação não tenha sido criado.
        await supabase
          .from("estoque_produtos")
          .update({
            quantidade: quantidadeAtual,
          })
          .eq("id", produtoMovimento.id);

        mostrarMensagem("Erro ao registrar a movimentação.");
        return;
      }

      setProdutos((anteriores) =>
        anteriores.map((produto) =>
          produto.id === produtoMovimento.id
            ? (produtoAtualizado as Produto)
            : produto
        )
      );

      mostrarMensagem(
        `${tipoMovimento} registrada com sucesso.`
      );

      fecharModalMovimento();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao registrar a movimentação.");
    } finally {
      setSalvandoMovimento(false);
    }
  }

  const produtosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) return produtos;

    return produtos.filter((produto) => {
      return (
        produto.nome.toLowerCase().includes(texto) ||
        produto.categoria.toLowerCase().includes(texto) ||
        produto.unidade.toLowerCase().includes(texto) ||
        (produto.fornecedor || "").toLowerCase().includes(texto)
      );
    });
  }, [produtos, busca]);

  const quantidadeProdutos = produtos.length;

  const produtosBaixoEstoque = produtos.filter(
    (produto) =>
      Number(produto.quantidade) <= Number(produto.estoque_minimo)
  );

  const valorEstoque = produtos.reduce(
    (total, produto) =>
      total + Number(produto.quantidade) * Number(produto.custo),
    0
  );

  const totalUnidades = produtos.reduce(
    (total, produto) => total + Number(produto.quantidade),
    0
  );

  function formatarNumero(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2,
    }).format(valor);
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <Package size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Estoque
                </h1>
                <p className="text-sm text-slate-400">
                  Controle de produtos e materiais
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={carregarProdutos}
              disabled={carregando}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={carregando ? "animate-spin" : ""}
              />
              Atualizar
            </button>

            <button
              onClick={abrirNovoProduto}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Novo produto
            </button>
          </div>
        </div>

        {/* MENSAGEM */}
        {mensagem && (
          <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {mensagem}
          </div>
        )}

        {/* CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Produtos cadastrados
            </p>

            <p className="mt-2 text-3xl font-bold">
              {quantidadeProdutos}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Itens diferentes
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Quantidade total
            </p>

            <p className="mt-2 text-3xl font-bold">
              {formatarNumero(totalUnidades)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Unidades em estoque
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Valor do estoque
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatarMoeda(valorEstoque)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Custo dos produtos
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              produtosBaixoEstoque.length > 0
                ? "border-yellow-500/30 bg-yellow-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <p className="flex items-center gap-2 text-sm text-slate-400">
              {produtosBaixoEstoque.length > 0 && (
                <AlertTriangle
                  size={17}
                  className="text-yellow-400"
                />
              )}
              Estoque baixo
            </p>

            <p className="mt-2 text-3xl font-bold">
              {produtosBaixoEstoque.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Produtos precisam de reposição
            </p>
          </div>
        </div>

        {/* BUSCA */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar produto, categoria ou fornecedor..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">
              Produtos
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {produtosFiltrados.length} produto(s) encontrado(s)
            </p>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <RefreshCw
                size={20}
                className="mr-2 animate-spin"
              />
              Carregando estoque...
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Package
                size={42}
                className="mx-auto mb-3 text-slate-700"
              />

              <p className="font-medium text-slate-300">
                Nenhum produto encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre seu primeiro produto no estoque.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">
                        Produto
                      </th>
                      <th className="px-5 py-4">
                        Categoria
                      </th>
                      <th className="px-5 py-4">
                        Quantidade
                      </th>
                      <th className="px-5 py-4">
                        Custo
                      </th>
                      <th className="px-5 py-4">
                        Fornecedor
                      </th>
                      <th className="px-5 py-4 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosFiltrados.map((produto) => {
                      const estoqueBaixo =
                        Number(produto.quantidade) <=
                        Number(produto.estoque_minimo);

                      return (
                        <tr
                          key={produto.id}
                          className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium">
                              {produto.nome}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Unidade: {produto.unidade}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {produto.categoria}
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`font-semibold ${
                                estoqueBaixo
                                  ? "text-yellow-400"
                                  : "text-white"
                              }`}
                            >
                              {formatarNumero(
                                Number(produto.quantidade)
                              )}{" "}
                              {produto.unidade}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Mínimo:{" "}
                              {formatarNumero(
                                Number(produto.estoque_minimo)
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatarMoeda(
                              Number(produto.custo)
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {produto.fornecedor || "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  abrirMovimento(
                                    produto,
                                    "Entrada"
                                  )
                                }
                                title="Entrada"
                                className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-green-400 transition hover:bg-green-500/20"
                              >
                                <ArrowDownToLine
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  abrirMovimento(
                                    produto,
                                    "Saída"
                                  )
                                }
                                title="Saída"
                                className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2 text-orange-400 transition hover:bg-orange-500/20"
                              >
                                <ArrowUpFromLine
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  abrirEditarProduto(
                                    produto
                                  )
                                }
                                title="Editar"
                                className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500/20"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  excluirProduto(produto)
                                }
                                title="Excluir"
                                className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-800 md:hidden">
                {produtosFiltrados.map((produto) => {
                  const estoqueBaixo =
                    Number(produto.quantidade) <=
                    Number(produto.estoque_minimo);

                  return (
                    <div
                      key={produto.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {produto.nome}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {produto.categoria} •{" "}
                            {produto.unidade}
                          </p>
                        </div>

                        {estoqueBaixo && (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                            <AlertTriangle size={13} />
                            Baixo
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Quantidade
                          </p>

                          <p
                            className={`mt-1 font-semibold ${
                              estoqueBaixo
                                ? "text-yellow-400"
                                : "text-white"
                            }`}
                          >
                            {formatarNumero(
                              Number(produto.quantidade)
                            )}{" "}
                            {produto.unidade}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Custo
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatarMoeda(
                              Number(produto.custo)
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        Mínimo:{" "}
                        {formatarNumero(
                          Number(produto.estoque_minimo)
                        )}
                        {" • "}
                        Fornecedor:{" "}
                        {produto.fornecedor || "-"}
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <button
                          onClick={() =>
                            abrirMovimento(
                              produto,
                              "Entrada"
                            )
                          }
                          className="flex items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-green-400"
                        >
                          <ArrowDownToLine size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirMovimento(
                              produto,
                              "Saída"
                            )
                          }
                          className="flex items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400"
                        >
                          <ArrowUpFromLine size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirEditarProduto(produto)
                          }
                          className="flex items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            excluirProduto(produto)
                          }
                          className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL PRODUTO */}
      {modalProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {produtoEditando
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informe os dados do produto.
                </p>
              </div>

              <button
                onClick={fecharModalProduto}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nome do produto *
                </label>

                <input
                  value={form.nome}
                  onChange={(e) =>
                    alterarCampo("nome", e.target.value)
                  }
                  placeholder="Ex.: Capacitor 35+5 µF"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Categoria
                </label>

                <select
                  value={form.categoria}
                  onChange={(e) =>
                    alterarCampo(
                      "categoria",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  {categorias.map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Unidade
                </label>

                <select
                  value={form.unidade}
                  onChange={(e) =>
                    alterarCampo(
                      "unidade",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  {unidades.map((unidade) => (
                    <option
                      key={unidade}
                      value={unidade}
                    >
                      {unidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Quantidade
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantidade}
                  onChange={(e) =>
                    alterarCampo(
                      "quantidade",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Estoque mínimo
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estoque_minimo}
                  onChange={(e) =>
                    alterarCampo(
                      "estoque_minimo",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Custo unitário
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.custo}
                  onChange={(e) =>
                    alterarCampo(
                      "custo",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Fornecedor
                </label>

                <input
                  value={form.fornecedor}
                  onChange={(e) =>
                    alterarCampo(
                      "fornecedor",
                      e.target.value
                    )
                  }
                  placeholder="Nome do fornecedor"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
              <button
                onClick={fecharModalProduto}
                disabled={salvando}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={salvarProduto}
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-700 disabled:opacity-50"
              >
                {salvando ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {salvando
                  ? "Salvando..."
                  : "Salvar produto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MOVIMENTAÇÃO */}
      {modalMovimento && produtoMovimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {tipoMovimento === "Entrada"
                    ? "Entrada de estoque"
                    : "Saída de estoque"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {produtoMovimento.nome}
                </p>
              </div>

              <button
                onClick={fecharModalMovimento}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div
                className={`rounded-xl border p-4 ${
                  tipoMovimento === "Entrada"
                    ? "border-green-500/20 bg-green-500/10"
                    : "border-orange-500/20 bg-orange-500/10"
                }`}
              >
                <p className="text-xs text-slate-400">
                  Estoque atual
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatarNumero(
                    Number(produtoMovimento.quantidade)
                  )}{" "}
                  {produtoMovimento.unidade}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Tipo
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTipoMovimento("Entrada")
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      tipoMovimento === "Entrada"
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <ArrowDownToLine size={18} />
                    Entrada
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTipoMovimento("Saída")
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      tipoMovimento === "Saída"
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <ArrowUpFromLine size={18} />
                    Saída
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Quantidade *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantidadeMovimento}
                  onChange={(e) =>
                    setQuantidadeMovimento(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: 2"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Motivo
                </label>

                <input
                  value={motivoMovimento}
                  onChange={(e) =>
                    setMotivoMovimento(e.target.value)
                  }
                  placeholder={
                    tipoMovimento === "Entrada"
                      ? "Ex.: Compra de material"
                      : "Ex.: Material utilizado em serviço"
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
              <button
                onClick={fecharModalMovimento}
                disabled={salvandoMovimento}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={salvarMovimento}
                disabled={salvandoMovimento}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  tipoMovimento === "Entrada"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {salvandoMovimento ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {salvandoMovimento
                  ? "Registrando..."
                  : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
