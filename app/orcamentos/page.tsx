"use client";

import {
  CalendarDays,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  MessageCircle,
  Percent,
  Plus,
  Search,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";

type BudgetStatus =
  | "Rascunho"
  | "Enviado"
  | "Aprovado"
  | "Recusado";

type BudgetItem = {
  id: string;
  description: string;
  quantity: string;
  unitValue: string;
};

type Budget = {
  id: string;
  number: string;
  client: string;
  clientId: string | null;
  city: string;
  service: string;
  equipment: string;
  value: number;
  date: string;
  status: BudgetStatus;
  items: BudgetItem[];
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  referenceValue: number;
  finalValue: number;
  materialsValue: number;
  totalValue: number;
};

type Client = {
  id: string;
  nome: string;
  cidade: string;
};

const statusStyles: Record<BudgetStatus, string> = {
  Rascunho: "bg-slate-100 text-slate-600",
  Enviado: "bg-blue-50 text-blue-700",
  Aprovado: "bg-emerald-50 text-emerald-700",
  Recusado: "bg-red-50 text-red-700",
};

const statuses: BudgetStatus[] = [
  "Rascunho",
  "Enviado",
  "Aprovado",
  "Recusado",
];

function money(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const text = String(value ?? "")
    .replace(/[R$\s]/g, "")
    .trim();

  if (!text) return 0;

  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;

  const result = Number(normalized);

  return Number.isFinite(result) ? result : 0;
}

function newItem(): BudgetItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    description: "",
    quantity: "1",
    unitValue: "",
  };
}

function itemTotal(item: BudgetItem) {
  return (
    Math.max(0, toNumber(item.quantity)) *
    Math.max(0, toNumber(item.unitValue))
  );
}

export default function OrcamentosPage() {
  const supabase = createClient();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingOrderId, setGeneratingOrderId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"Todos" | BudgetStatus>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [clientId, setClientId] = useState("");
  const [city, setCity] = useState("");
  const [equipment, setEquipment] = useState("");
  const [date, setDate] = useState("");

  const [items, setItems] = useState<BudgetItem[]>([
    newItem(),
  ]);

  const [discountPercent, setDiscountPercent] = useState("");
  const [desiredAmount, setDesiredAmount] = useState("");

  /*
   * MATERIAL SEPARADO DOS SERVIÇOS
   */
  const [materialsValue, setMaterialsValue] = useState("");

  const [negotiationMessage, setNegotiationMessage] =
    useState("");

  const [previewBudget, setPreviewBudget] =
    useState<Budget | null>(null);

  const selectedClient = useMemo(
    () =>
      clients.find((client) => client.id === clientId) ??
      null,
    [clients, clientId]
  );

  /*
   * SOMA AUTOMÁTICA DOS SERVIÇOS
   */
  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + itemTotal(item),
      0
    );
  }, [items]);

  const discountNumber = Math.min(
    100,
    Math.max(0, toNumber(discountPercent))
  );

  const discountValue =
    subtotal * (discountNumber / 100);

  /*
   * VALOR FINAL DOS SERVIÇOS
   */
  const finalValue = Math.max(
    0,
    subtotal - discountValue
  );

  const desiredNumber = toNumber(desiredAmount);

  /*
   * MATERIAL
   */
  const materialsNumber = Math.max(
    0,
    toNumber(materialsValue)
  );

  /*
   * TOTAL GERAL
   */
  const grandTotal = finalValue + materialsNumber;

  /*
   * CALCULADORA DE NEGOCIAÇÃO
   */
  const calculatedReference =
    discountNumber > 0 &&
    discountNumber < 100 &&
    desiredNumber > 0
      ? desiredNumber /
        (1 - discountNumber / 100)
      : 0;

  async function loadData() {
    setLoading(true);

    const [budgetsResult, clientsResult] =
      await Promise.all([
        supabase
          .from("orcamentos")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("clientes")
          .select("id, nome, cidade")
          .eq("status", "Ativo")
          .order("nome", {
            ascending: true,
          }),
      ]);

    if (budgetsResult.error) {
      console.error(budgetsResult.error);

      alert(
        "Não foi possível carregar os orçamentos."
      );
    }

    if (clientsResult.error) {
      console.error(clientsResult.error);

      alert(
        "Não foi possível carregar os clientes."
      );
    }

    const formattedBudgets: Budget[] =
      (budgetsResult.data ?? []).map((item) => {
        const legacyValue = Number(
          item.valor ?? 0
        );

        let loadedItems: BudgetItem[] = [];

        if (
          Array.isArray(item.itens) &&
          item.itens.length > 0
        ) {
          loadedItems = item.itens.map(
            (
              entry: {
                id?: string;
                description?: string;
                quantity?: number | string;
                unitValue?: number | string;
                total?: number;
              },
              index: number
            ) => ({
              id: String(
                entry.id ??
                  `legacy-${item.id}-${index}`
              ),

              description: String(
                entry.description ?? ""
              ),

              quantity: String(
                entry.quantity ?? 1
              ),

              unitValue: String(
                entry.unitValue ?? 0
              ),
            })
          );
        }

        /*
         * COMPATIBILIDADE COM ORÇAMENTOS ANTIGOS
         */
        if (loadedItems.length === 0) {
          loadedItems = [
            {
              id: `legacy-${item.id}`,
              description:
                item.servico ?? "Serviço",
              quantity: "1",
              unitValue: String(
                legacyValue
              ),
            },
          ];
        }

        const calculatedLoadedSubtotal =
          loadedItems.reduce(
            (sum, entry) =>
              sum + itemTotal(entry),
            0
          );

        const loadedSubtotal =
          Number(item.subtotal ?? 0) ||
          calculatedLoadedSubtotal;

        const loadedDiscountPercent =
          Number(
            item.desconto_percentual ?? 0
          );

        const loadedDiscountValue =
          Number(
            item.desconto_valor ?? 0
          ) ||
          loadedSubtotal *
            (loadedDiscountPercent / 100);

        const loadedReference =
          Number(
            item.valor_referencia ?? 0
          ) || loadedSubtotal;

        const loadedFinal =
          Number(item.valor_final ?? 0) ||
          Math.max(
            0,
            legacyValue ||
              loadedReference -
                loadedDiscountValue
          );

        /*
         * MATERIAL DOS ORÇAMENTOS NOVOS
         *
         * Orçamentos antigos recebem 0.
         */
        const loadedMaterials =
          Math.max(
            0,
            Number(
              item.materiais_valor ?? 0
            )
          );

        const loadedTotal =
          Number(
            item.total_geral ?? 0
          ) ||
          loadedFinal +
            loadedMaterials;

        return {
          id: item.id,

          number: item.numero,

          client: item.cliente_nome,

          clientId: item.cliente_id,

          city: item.cidade ?? "",

          service:
            item.servico ??
            loadedItems
              .map(
                (entry) =>
                  entry.description
              )
              .join(", "),

          equipment:
            item.equipamentos ?? "",

          value: loadedFinal,

          date: item.data
            ? new Date(
                `${item.data}T00:00:00`
              ).toLocaleDateString(
                "pt-BR"
              )
            : "",

          status:
            item.status as BudgetStatus,

          items: loadedItems,

          subtotal: loadedSubtotal,

          discountPercent:
            loadedDiscountPercent,

          discountValue:
            loadedDiscountValue,

          referenceValue:
            loadedReference,

          finalValue:
            loadedFinal,

          materialsValue:
            loadedMaterials,

          totalValue:
            loadedTotal,
        };
      });

    setBudgets(formattedBudgets);

    setClients(
      (clientsResult.data ??
        []) as Client[]
    );

    setLoading(false);
  }

  function clearForm() {
    setClientId("");

    setCity("");

    setEquipment("");

    setDate("");

    setItems([newItem()]);

    setDiscountPercent("");

    setDesiredAmount("");

    setMaterialsValue("");

    setNegotiationMessage("");

    setShowNegotiation(false);
  }

  useEffect(() => {
    loadData();

    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("novo") === "1") {
      setShowForm(true);

      const url = new URL(
        window.location.href
      );

      url.searchParams.delete("novo");

      window.history.replaceState(
        {},
        "",
        url.toString()
      );
    }
  }, []);

  const filteredBudgets = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return budgets.filter((budget) => {
      const matchesSearch =
        !term ||
        budget.number
          .toLowerCase()
          .includes(term) ||
        budget.client
          .toLowerCase()
          .includes(term) ||
        budget.city
          .toLowerCase()
          .includes(term) ||
        budget.service
          .toLowerCase()
          .includes(term) ||
        budget.equipment
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "Todos" ||
        budget.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    budgets,
    search,
    statusFilter,
  ]);

  function openNewBudget() {
    clearForm();

    setShowForm(true);
  }

  function handleClientChange(
    id: string
  ) {
    setClientId(id);

    const client = clients.find(
      (item) => item.id === id
    );

    if (client) {
      setCity(client.cidade || "");
    }
  }

  function updateItem(
    id: string,
    field:
      | "description"
      | "quantity"
      | "unitValue",
    value: string
  ) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      newItem(),
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  }

  /*
   * NEGOCIAÇÃO INTERNA
   */
  function applyNegotiation() {
    if (desiredNumber <= 0) {
      setNegotiationMessage(
        "Informe quanto você quer receber."
      );

      return;
    }

    if (discountNumber <= 0) {
      setNegotiationMessage(
        "Informe a porcentagem de desconto."
      );

      return;
    }

    if (discountNumber >= 100) {
      setNegotiationMessage(
        "Para usar a calculadora de negociação, o desconto deve ser menor que 100%."
      );

      return;
    }

    if (calculatedReference <= 0) {
      setNegotiationMessage(
        "Não foi possível calcular o valor de referência."
      );

      return;
    }

    if (
      calculatedReference <=
      desiredNumber
    ) {
      setNegotiationMessage(
        "O valor de referência precisa ser maior que o valor final."
      );

      return;
    }

    if (subtotal <= 0) {
      setNegotiationMessage(
        "Adicione serviços e valores antes de aplicar a negociação."
      );

      return;
    }

    const factor =
      calculatedReference /
      subtotal;

    setItems((current) =>
      current.map((item) => {
        const oldValue =
          toNumber(
            item.unitValue
          );

        const newValue =
          oldValue * factor;

        return {
          ...item,

          unitValue:
            newValue
              .toFixed(2)
              .replace(
                ".",
                ","
              ),
        };
      })
    );

    setNegotiationMessage(
      `Negociação aplicada. Referência: ${money(
        calculatedReference
      )}. Você receberá: ${money(
        desiredNumber
      )}.`
    );
  }

  function generateNumber() {
    const numbers = budgets
      .map((budget) => {
        const match =
          budget.number.match(
            /ORC-(\d+)/i
          );

        return match
          ? Number(match[1])
          : 0;
      })
      .filter(
        (value) => value > 0
      );

    const next =
      Math.max(0, ...numbers) + 1;

    return `ORC-${String(
      next
    ).padStart(4, "0")}`;
  }

  function getServiceType(
    serviceName: string
  ) {
    const normalized =
      serviceName.toLowerCase();

    if (
      normalized.includes(
        "instala"
      )
    ) {
      return "Instalação";
    }

    if (
      normalized.includes(
        "higien"
      )
    ) {
      return "Higienização";
    }

    if (
      normalized.includes(
        "corret"
      )
    ) {
      return "Corretiva";
    }

    if (
      normalized.includes(
        "prevent"
      )
    ) {
      return "Preventiva";
    }

    return "Visita técnica";
  }

  async function generateOrderNumber() {
    const { data } =
      await supabase
        .from("ordens_servico")
        .select("numero")
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    const lastNumber =
      typeof data?.numero ===
      "string"
        ? Number(
            data.numero.replace(
              /\D/g,
              ""
            )
          )
        : 0;

    return `OS-${String(
      lastNumber + 1
    ).padStart(4, "0")}`;
  }

  async function generateServiceOrder(
    budget: Budget
  ) {
    if (
      budget.status !==
      "Aprovado"
    ) {
      alert(
        "O orçamento precisa estar aprovado para gerar uma OS."
      );

      return;
    }

    if (!budget.clientId) {
      alert(
        "Este orçamento não possui cliente vinculado."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Gerar Ordem de Serviço para ${budget.client}?\n\n` +
          `Orçamento: ${budget.number}\n` +
          `Serviços: ${budget.service}\n` +
          `Valor dos serviços: ${money(
            budget.finalValue
          )}\n` +
          `Materiais: ${money(
            budget.materialsValue
          )}\n` +
          `Total geral: ${money(
            budget.totalValue
          )}`
      );

    if (!confirmed) {
      return;
    }

    setGeneratingOrderId(
      budget.id
    );

    try {
      const {
        data: existingOrders,
        error: existingError,
      } = await supabase
        .from("ordens_servico")
        .select(
          "id, numero, observacoes"
        )
        .eq(
          "cliente_id",
          budget.clientId
        );

      if (existingError) {
        throw existingError;
      }

      const alreadyGenerated =
        (existingOrders ?? []).some(
          (order) =>
            String(
              order.observacoes ??
                ""
            ).includes(
              budget.number
            )
        );

      if (alreadyGenerated) {
        alert(
          "A Ordem de Serviço deste orçamento já foi gerada."
        );

        return;
      }

      const number =
        await generateOrderNumber();

      const serviceDescription =
        budget.items
          .filter(
            (item) =>
              item.description.trim()
          )
          .map(
            (item) =>
              `${item.quantity}x ${item.description} - ${money(
                itemTotal(item)
              )}`
          )
          .join("\n");

      const serviceType =
        getServiceType(
          budget.service
        );

      const materialDescription =
        budget.materialsValue > 0
          ? `\nMateriais: ${money(
              budget.materialsValue
            )}`
          : "";

      const { error } =
        await supabase
          .from("ordens_servico")
          .insert({
            numero: number,

            cliente_id:
              budget.clientId,

            cliente_nome:
              budget.client,

            equipamento:
              budget.equipment ||
              "Não informado",

            cidade:
              budget.city,

            tipo_servico:
              serviceType,

            descricao:
              (
                serviceDescription ||
                budget.service
              ) +
              materialDescription,

            data: new Date()
              .toISOString()
              .slice(0, 10),

            tecnico: null,

            valor:
              budget.finalValue,

            status: "Aberta",

            observacoes:
              `Gerada automaticamente a partir do orçamento ${budget.number}. Materiais previstos: ${money(
                budget.materialsValue
              )}. Total geral do orçamento: ${money(
                budget.totalValue
              )}.`,
          });

      if (error) {
        throw error;
      }

      alert(
        `OS ${number} criada com sucesso!`
      );

      window.location.href =
        "/ordens-servico";
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível gerar a Ordem de Serviço."
      );
    } finally {
      setGeneratingOrderId(
        null
      );
    }
  }

  async function saveBudget(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!clientId) {
      alert(
        "Selecione um cliente."
      );

      return;
    }

    if (!city.trim()) {
      alert(
        "Informe a cidade."
      );

      return;
    }

    const validItems =
      items.filter(
        (item) =>
          item.description.trim() &&
          toNumber(
            item.quantity
          ) > 0 &&
          toNumber(
            item.unitValue
          ) > 0
      );

    if (validItems.length === 0) {
      alert(
        "Adicione pelo menos um serviço com descrição, quantidade e valor."
      );

      return;
    }

    if (discountNumber >= 100) {
      alert(
        "O desconto deve ser menor que 100%."
      );

      return;
    }

    const selected =
      clients.find(
        (client) =>
          client.id === clientId
      );

    if (!selected) {
      alert(
        "Cliente não encontrado."
      );

      return;
    }

    setSaving(true);

    try {
      const normalizedItems =
        validItems.map(
          (item) => ({
            id: item.id,

            description:
              item.description.trim(),

            quantity:
              toNumber(
                item.quantity
              ),

            unitValue:
              toNumber(
                item.unitValue
              ),

            total:
              itemTotal(item),
          })
        );

      const calculatedSubtotal =
        normalizedItems.reduce(
          (sum, item) =>
            sum + item.total,
          0
        );

      const calculatedDiscount =
        calculatedSubtotal *
        (discountNumber / 100);

      const calculatedFinal =
        Math.max(
          0,
          calculatedSubtotal -
            calculatedDiscount
        );

      const calculatedMaterials =
        Math.max(
          0,
          toNumber(
            materialsValue
          )
        );

      const calculatedTotal =
        calculatedFinal +
        calculatedMaterials;

      const number =
        generateNumber();

      const serviceDescription =
        normalizedItems
          .map(
            (item) =>
              `${item.quantity}x ${item.description}`
          )
          .join(" • ");

      const { error } =
        await supabase
          .from("orcamentos")
          .insert({
            numero: number,

            cliente_id:
              selected.id,

            cliente_nome:
              selected.nome,

            cidade:
              city.trim(),

            servico:
              serviceDescription,

            equipamentos:
              equipment.trim() ||
              null,

            /*
             * Mantemos "valor" como
             * valor final dos serviços
             * para compatibilidade
             * com o sistema atual.
             */
            valor:
              calculatedFinal,

            data:
              date || null,

            status:
              "Rascunho",

            itens:
              normalizedItems,

            subtotal:
              calculatedSubtotal,

            desconto_percentual:
              discountNumber,

            desconto_valor:
              calculatedDiscount,

            valor_referencia:
              calculatedSubtotal,

            valor_final:
              calculatedFinal,

            materiais_valor:
              calculatedMaterials,

            total_geral:
              calculatedTotal,
          });

      if (error) {
        throw error;
      }

      alert(
        `Orçamento ${number} salvo com sucesso!`
      );

      setShowForm(false);

      clearForm();

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível salvar o orçamento. Verifique os dados do Supabase."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    id: string,
    status: BudgetStatus
  ) {
    const { error } =
      await supabase
        .from("orcamentos")
        .update({ status })
        .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Não foi possível alterar o status."
      );

      return;
    }

    await loadData();
  }

  async function deleteBudget(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir este orçamento?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("orcamentos")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Não foi possível excluir o orçamento."
      );

      return;
    }

    await loadData();
  }

  function openPreview(
    budget: Budget
  ) {
    setPreviewBudget(
      budget
    );

    setShowPreview(true);
  }

  function printBudget(
    budget: Budget
  ) {
    const itemsHtml =
      budget.items
        .map(
          (item) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${money(
                toNumber(
                  item.unitValue
                )
              )}</td>
              <td>${money(
                itemTotal(item)
              )}</td>
            </tr>
          `
        )
        .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">

      <head>

        <meta charset="UTF-8">

        <title>
          ${budget.number}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #111827;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 25px;
          }

          h1 {
            margin: 0;
            font-size: 25px;
          }

          h2 {
            font-size: 17px;
            margin-top: 25px;
          }

          .muted {
            color: #6b7280;
          }

          .client {
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            margin-bottom: 25px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th,
          td {
            border-bottom: 1px solid #ddd;
            padding: 10px 8px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .totals {
            width: 340px;
            margin-left: auto;
            margin-top: 25px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            padding: 7px 0;
          }

          .materials {
            color: #2563eb;
          }

          .final {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #111827;
            margin-top: 8px;
            padding-top: 12px;
          }

          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <div>

            <h1>
              Nando's Ar-Condicionado
            </h1>

            <div class="muted">
              Qualidade e confiança em todos os detalhes.
            </div>

          </div>

          <div>

            <strong>
              ORÇAMENTO
            </strong>

            <br>

            ${budget.number}

            <br>

            ${
              budget.date ||
              new Date().toLocaleDateString(
                "pt-BR"
              )
            }

          </div>

        </div>

        <div class="client">

          <strong>
            Cliente:
          </strong>

          ${budget.client}

          <br>

          <strong>
            Cidade:
          </strong>

          ${budget.city}

          ${
            budget.equipment
              ? `
                <br>
                <strong>
                  Equipamento:
                </strong>
                ${budget.equipment}
              `
              : ""
          }

        </div>

        <h2>
          Serviços
        </h2>

        <table>

          <thead>

            <tr>

              <th>
                Descrição
              </th>

              <th>
                Qtd.
              </th>

              <th>
                Valor unit.
              </th>

              <th>
                Total
              </th>

            </tr>

          </thead>

          <tbody>
            ${itemsHtml}
          </tbody>

        </table>

        <div class="totals">

          <div class="row">

            <span>
              Subtotal dos serviços
            </span>

            <strong>
              ${money(
                budget.referenceValue
              )}
            </strong>

          </div>

          ${
            budget.discountPercent >
            0
              ? `
                <div class="row">

                  <span>
                    Desconto especial
                    (${budget.discountPercent.toFixed(
                      2
                    )}%)
                  </span>

                  <strong>
                    - ${money(
                      budget.discountValue
                    )}
                  </strong>

                </div>
              `
              : ""
          }

          <div class="row">

            <span>
              Serviços com desconto
            </span>

            <strong>
              ${money(
                budget.finalValue
              )}
            </strong>

          </div>

          ${
            budget.materialsValue >
            0
              ? `
                <div class="row materials">

                  <span>
                    Materiais
                  </span>

                  <strong>
                    ${money(
                      budget.materialsValue
                    )}
                  </strong>

                </div>
              `
              : ""
          }

          <div class="row final">

            <span>
              Total geral
            </span>

            <strong>
              ${money(
                budget.totalValue
              )}
            </strong>

          </div>

        </div>

        <div class="footer">

          Nando's Ar-Condicionado

          <br>

          Qualidade e confiança em todos os detalhes.

        </div>

      </body>

      </html>
    `;

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {
      alert(
        "O navegador bloqueou a janela de impressão. Permita pop-ups para este site."
      );

      return;
    }

    printWindow.document.write(
      html
    );

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  }

  function sendWhatsApp(
    budget: Budget
  ) {
    const lines =
      budget.items
        .map(
          (item) =>
            `• ${item.quantity}x ${item.description} — ${money(
              itemTotal(item)
            )}`
        )
        .join("\n");

    const message =
      `Olá, ${budget.client}! 👋\n\n` +
      `Segue o orçamento da Nando's Ar-Condicionado.\n\n` +
      `*Orçamento ${budget.number}*\n\n` +
      `*Serviços:*\n` +
      `${lines}\n\n` +
      `Subtotal dos serviços: ${money(
        budget.referenceValue
      )}\n` +
      `${
        budget.discountPercent >
        0
          ? `Desconto especial: ${budget.discountPercent.toFixed(
              2
            )}% (-${money(
              budget.discountValue
            )})\n` +
            `Serviços com desconto: ${money(
              budget.finalValue
            )}\n`
          : ""
      }` +
      `${
        budget.materialsValue >
        0
          ? `Materiais: ${money(
              budget.materialsValue
            )}\n`
          : ""
      }` +
      `*Total geral: ${money(
        budget.totalValue
      )}*\n\n` +
      `Qualidade e confiança em todos os detalhes.`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  }

  const totalValue =
    budgets.reduce(
      (sum, budget) =>
        sum + budget.totalValue,
      0
    );

  const approvedBudgets =
    budgets.filter(
      (budget) =>
        budget.status ===
        "Aprovado"
    ).length;

  const pendingBudgets =
    budgets.filter(
      (budget) =>
        budget.status ===
          "Rascunho" ||
        budget.status ===
          "Enviado"
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl p-4 md:p-6">

        {/* CABEÇALHO */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h1 className="text-2xl font-bold md:text-3xl">
              Orçamentos
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Controle de propostas,
              serviços, materiais e negociações.
            </p>

          </div>

          <button
            onClick={
              openNewBudget
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >

            <Plus className="h-5 w-5" />

            Novo orçamento

          </button>

        </div>

        {/* INDICADORES */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <p className="text-xs text-slate-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold">
              {budgets.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <p className="text-xs text-slate-500">
              Aprovados
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {approvedBudgets}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <p className="text-xs text-slate-500">
              Pendentes
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-400">
              {pendingBudgets}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <p className="text-xs text-slate-500">
              Valor total
            </p>

            <p className="mt-1 text-xl font-bold">
              {money(totalValue)}
            </p>

          </div>

        </div>

        {/* PESQUISA */}

        <div className="mb-5 flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar orçamento, cliente, cidade ou serviço..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500"
            />

          </div>

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "Todos"
                  | BudgetStatus
              )
            }
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
          >

            <option value="Todos">
              Todos os status
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}

          </select>

        </div>

        {/* LISTA */}

        {loading ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">

            Carregando orçamentos...

          </div>

        ) : filteredBudgets.length ===
          0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />

            <p className="font-semibold">
              Nenhum orçamento encontrado.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Crie seu primeiro orçamento usando o botão acima.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {filteredBudgets.map(
              (budget) => (

                <div
                  key={budget.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        <span className="font-bold">
                          {budget.number}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[budget.status]}`}
                        >
                          {budget.status}
                        </span>

                        {budget.items.length >
                          1 && (

                          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400">

                            {
                              budget
                                .items
                                .length
                            }{" "}
                            itens

                          </span>

                        )}

                        {budget.discountPercent >
                          0 && (

                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">

                            {budget.discountPercent.toFixed(
                              2
                            )}
                            % desconto

                          </span>

                        )}

                        {budget.materialsValue >
                          0 && (

                          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">

                            Materiais{" "}
                            {money(
                              budget.materialsValue
                            )}

                          </span>

                        )}

                      </div>

                      <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">

                        <div className="flex items-start gap-2">

                          <User className="mt-0.5 h-4 w-4 text-cyan-400" />

                          <span>
                            {budget.client}
                          </span>

                        </div>

                        <div className="flex items-start gap-2">

                          <Wrench className="mt-0.5 h-4 w-4 text-cyan-400" />

                          <span className="line-clamp-2">
                            {budget.service}
                          </span>

                        </div>

                        <div className="flex items-start gap-2">

                          <ClipboardList className="mt-0.5 h-4 w-4 text-cyan-400" />

                          <span>
                            {budget.city}
                          </span>

                        </div>

                        <div className="flex items-start gap-2">

                          <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-400" />

                          <span>
                            {budget.date ||
                              "Sem data"}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">

                      <div className="text-xl font-bold text-emerald-400">
                        {money(
                          budget.totalValue
                        )}
                      </div>

                      <div className="text-xs text-slate-500">
                        Serviços:{" "}
                        {money(
                          budget.finalValue
                        )}
                      </div>

                      {budget.materialsValue >
                        0 && (

                        <div className="text-xs text-blue-400">
                          Materiais:{" "}
                          {money(
                            budget.materialsValue
                          )}
                        </div>

                      )}

                      {budget.discountPercent >
                        0 && (

                        <div className="text-xs text-slate-500">
                          Referência:{" "}
                          {money(
                            budget.referenceValue
                          )}
                        </div>

                      )}

                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            openPreview(
                              budget
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                        >

                          <Eye className="h-4 w-4" />

                          Visualizar

                        </button>

                        <button
                          onClick={() =>
                            printBudget(
                              budget
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                        >

                          <FileText className="h-4 w-4" />

                          Imprimir

                        </button>

                        <button
                          onClick={() =>
                            sendWhatsApp(
                              budget
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-emerald-700/50 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10"
                        >

                          <MessageCircle className="h-4 w-4" />

                          WhatsApp

                        </button>

                        {budget.status ===
                          "Aprovado" && (

                          <button
                            onClick={() =>
                              generateServiceOrder(
                                budget
                              )
                            }
                            disabled={
                              generatingOrderId ===
                              budget.id
                            }
                            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                          >

                            <CheckCircle2 className="h-4 w-4" />

                            {generatingOrderId ===
                            budget.id
                              ? "Gerando..."
                              : "Gerar OS"}

                          </button>

                        )}

                        <select
                          value={
                            budget.status
                          }
                          onChange={(
                            event
                          ) =>
                            changeStatus(
                              budget.id,
                              event
                                .target
                                .value as BudgetStatus
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs outline-none"
                        >

                          {statuses.map(
                            (
                              status
                            ) => (

                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {status}
                              </option>

                            )
                          )}

                        </select>

                        <button
                          onClick={() =>
                            deleteBudget(
                              budget.id
                            )
                          }
                          className="rounded-lg border border-red-900/50 p-2 text-red-400 hover:bg-red-500/10"
                          title="Excluir"
                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* MODAL NOVO ORÇAMENTO */}

      {showForm && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 md:p-6">

          <div className="mx-auto my-4 max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl md:my-10">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">

              <div>

                <h2 className="text-xl font-bold">
                  Novo orçamento
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Adicione serviços e informe os materiais separadamente.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 hover:bg-slate-800"
              >

                <X className="h-5 w-5" />

              </button>

            </div>

            <form
              onSubmit={
                saveBudget
              }
            >

              <div className="space-y-6 p-5">

                {/* CLIENTE */}

                <div className="grid gap-4 md:grid-cols-3">

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium">
                      Cliente *
                    </label>

                    <select
                      value={
                        clientId
                      }
                      onChange={(
                        event
                      ) =>
                        handleClientChange(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
                      required
                    >

                      <option value="">
                        Selecione o cliente
                      </option>

                      {clients.map(
                        (client) => (

                          <option
                            key={
                              client.id
                            }
                            value={
                              client.id
                            }
                          >
                            {
                              client.nome
                            }
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Data
                    </label>

                    <input
                      type="date"
                      value={
                        date
                      }
                      onChange={(
                        event
                      ) =>
                        setDate(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Cidade *
                    </label>

                    <input
                      value={
                        city
                      }
                      onChange={(
                        event
                      ) =>
                        setCity(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
                      required
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium">
                      Equipamento
                    </label>

                    <input
                      value={
                        equipment
                      }
                      onChange={(
                        event
                      ) =>
                        setEquipment(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Ex.: Split Fujitsu 12.000 BTUs"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                  </div>

                </div>

                {/* SERVIÇOS */}

                <div>

                  <div className="mb-3 flex items-center justify-between gap-3">

                    <div>

                      <h3 className="font-semibold">
                        Serviços / itens
                      </h3>

                      <p className="text-xs text-slate-500">
                        Adicione quantos serviços forem necessários.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        addItem
                      }
                      className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >

                      <Plus className="h-4 w-4" />

                      Adicionar item

                    </button>

                  </div>

                  <div className="space-y-3">

                    {items.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={
                            item.id
                          }
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                        >

                          <div className="mb-3 flex items-center justify-between">

                            <span className="text-sm font-semibold text-slate-400">
                              Item{" "}
                              {index +
                                1}
                            </span>

                            {items.length >
                              1 && (

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                              >

                                <Trash2 className="h-4 w-4" />

                              </button>

                            )}

                          </div>

                          <div className="grid gap-3 md:grid-cols-12">

                            <div className="md:col-span-6">

                              <label className="mb-1 block text-xs text-slate-500">
                                Serviço / descrição
                              </label>

                              <input
                                value={
                                  item.description
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "description",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ex.: Instalação de Split 12.000 BTUs"
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-500"
                              />

                            </div>

                            <div className="md:col-span-2">

                              <label className="mb-1 block text-xs text-slate-500">
                                Quantidade
                              </label>

                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  item.quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "quantity",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="1"
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-500"
                              />

                            </div>

                            <div className="md:col-span-2">

                              <label className="mb-1 block text-xs text-slate-500">
                                Valor unitário
                              </label>

                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  item.unitValue
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "unitValue",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="0,00"
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-500"
                              />

                            </div>

                            <div className="md:col-span-2">

                              <label className="mb-1 block text-xs text-slate-500">
                                Total
                              </label>

                              <div className="rounded-lg border border-cyan-500/20 bg-slate-950 px-3 py-3 text-sm font-bold text-cyan-400">

                                {money(
                                  itemTotal(
                                    item
                                  )
                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* MATERIAIS */}

                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">

                  <div className="mb-4">

                    <h3 className="font-semibold text-blue-300">
                      Materiais
                    </h3>

                    <p className="mt-1 text-xs text-blue-200/60">
                      Informe separadamente o valor dos materiais. Esse valor será apresentado ao cliente no orçamento.
                    </p>

                  </div>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Valor dos materiais
                      </label>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          materialsValue
                        }
                        onChange={(
                          event
                        ) =>
                          setMaterialsValue(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Ex.: 250,00"
                        className="w-full rounded-xl border border-blue-500/20 bg-slate-950 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-400"
                      />

                    </div>

                    <div className="rounded-xl bg-slate-950 p-4">

                      <p className="text-xs text-slate-500">
                        Materiais
                      </p>

                      <p className="mt-1 text-2xl font-bold text-blue-400">
                        {money(
                          materialsNumber
                        )}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        O pagamento antecipado e o QR Code Pix serão adicionados na próxima etapa.
                      </p>

                    </div>

                  </div>

                </div>

                {/* DESCONTO + NEGOCIAÇÃO */}

                <div className="grid gap-4 lg:grid-cols-2">

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                    <div className="mb-4 flex items-center gap-2">

                      <Percent className="h-5 w-5 text-cyan-400" />

                      <div>

                        <h3 className="font-semibold">
                          Desconto
                        </h3>

                        <p className="text-xs text-slate-500">
                          O desconto será aplicado somente aos serviços.
                        </p>

                      </div>

                    </div>

                    <label className="mb-2 block text-sm">
                      Desconto especial (%)
                    </label>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={
                        discountPercent
                      }
                      onChange={(
                        event
                      ) =>
                        setDiscountPercent(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Ex.: 10"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between">

                        <span className="text-slate-400">
                          Subtotal dos serviços
                        </span>

                        <strong>
                          {money(
                            subtotal
                          )}
                        </strong>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-400">
                          Desconto
                        </span>

                        <strong className="text-amber-400">
                          -{" "}
                          {money(
                            discountValue
                          )}
                        </strong>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-400">
                          Serviços com desconto
                        </span>

                        <strong>
                          {money(
                            finalValue
                          )}
                        </strong>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-400">
                          Materiais
                        </span>

                        <strong className="text-blue-400">
                          {money(
                            materialsNumber
                          )}
                        </strong>

                      </div>

                      <div className="mt-3 flex justify-between border-t border-slate-800 pt-3 text-lg">

                        <span>
                          Total geral
                        </span>

                        <strong className="text-emerald-400">
                          {money(
                            grandTotal
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">

                    <div className="mb-4 flex items-center gap-2">

                      <Calculator className="h-5 w-5 text-amber-400" />

                      <div>

                        <h3 className="font-semibold text-amber-300">
                          Negociação interna
                        </h3>

                        <p className="text-xs text-amber-200/60">
                          Somente você vê esta área.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNegotiation(
                          !showNegotiation
                        )
                      }
                      className="mb-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300"
                    >

                      {showNegotiation
                        ? "Ocultar calculadora"
                        : "Abrir calculadora de negociação"}

                    </button>

                    {showNegotiation && (

                      <div className="space-y-4">

                        <div>

                          <label className="mb-2 block text-sm">
                            Quanto eu quero receber?
                          </label>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              desiredAmount
                            }
                            onChange={(
                              event
                            ) =>
                              setDesiredAmount(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Ex.: 450"
                            className="w-full rounded-xl border border-amber-500/20 bg-slate-950 px-4 py-3 outline-none focus:border-amber-400"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm">
                            Desconto que vou oferecer (%)
                          </label>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              discountPercent
                            }
                            onChange={(
                              event
                            ) =>
                              setDiscountPercent(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Ex.: 10"
                            className="w-full rounded-xl border border-amber-500/20 bg-slate-950 px-4 py-3 outline-none focus:border-amber-400"
                          />

                        </div>

                        <div className="rounded-xl bg-slate-950 p-4">

                          <p className="text-xs text-slate-500">
                            Valor de referência necessário
                          </p>

                          <p className="mt-1 text-2xl font-bold text-amber-300">
                            {money(
                              calculatedReference
                            )}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            O valor desejado é interno e não aparece para o cliente.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={
                            applyNegotiation
                          }
                          className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300"
                        >
                          Aplicar negociação aos itens
                        </button>

                        {negotiationMessage && (

                          <p className="rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
                            {
                              negotiationMessage
                            }
                          </p>

                        )}

                      </div>

                    )}

                  </div>

                </div>

                {/* RESUMO */}

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                  <div className="flex items-start gap-3">

                    <Calculator className="mt-0.5 h-5 w-5 text-cyan-400" />

                    <div className="flex-1">

                      <p className="font-semibold">
                        Resumo do orçamento
                      </p>

                      <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">

                        <div>

                          <span className="text-slate-500">
                            Itens
                          </span>

                          <p className="font-semibold">
                            {items.length}
                          </p>

                        </div>

                        <div>

                          <span className="text-slate-500">
                            Serviços
                          </span>

                          <p className="font-semibold">
                            {money(
                              finalValue
                            )}
                          </p>

                        </div>

                        <div>

                          <span className="text-slate-500">
                            Materiais
                          </span>

                          <p className="font-semibold text-blue-400">
                            {money(
                              materialsNumber
                            )}
                          </p>

                        </div>

                        <div>

                          <span className="text-slate-500">
                            Total geral
                          </span>

                          <p className="text-xl font-bold text-emerald-400">
                            {money(
                              grandTotal
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* BOTÕES */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {

                    if (!clientId) {
                      alert(
                        "Selecione um cliente."
                      );

                      return;
                    }

                    const valid =
                      items.some(
                        (item) =>
                          item.description.trim() &&
                          toNumber(
                            item.quantity
                          ) > 0 &&
                          toNumber(
                            item.unitValue
                          ) > 0
                      );

                    if (!valid) {
                      alert(
                        "Adicione pelo menos um serviço válido."
                      );

                      return;
                    }

                    const tempItems =
                      items
                        .filter(
                          (
                            item
                          ) =>
                            item.description.trim() &&
                            toNumber(
                              item.quantity
                            ) > 0 &&
                            toNumber(
                              item.unitValue
                            ) > 0
                        )
                        .map(
                          (
                            item
                          ) => ({
                            ...item,
                          })
                        );

                    const tempBudget: Budget =
                      {
                        id: "preview",

                        number:
                          "PRÉVIA",

                        client:
                          selectedClient?.nome ||
                          "Cliente",

                        clientId,

                        city,

                        service:
                          tempItems
                            .map(
                              (
                                item
                              ) =>
                                item.description
                            )
                            .join(
                              " • "
                            ),

                        equipment,

                        value:
                          finalValue,

                        date: date
                          ? new Date(
                              `${date}T00:00:00`
                            ).toLocaleDateString(
                              "pt-BR"
                            )
                          : new Date().toLocaleDateString(
                              "pt-BR"
                            ),

                        status:
                          "Rascunho",

                        items:
                          tempItems,

                        subtotal,

                        discountPercent:
                          discountNumber,

                        discountValue,

                        referenceValue:
                          subtotal,

                        finalValue,

                        materialsValue:
                          materialsNumber,

                        totalValue:
                          grandTotal,
                      };

                    setPreviewBudget(
                      tempBudget
                    );

                    setShowPreview(
                      true
                    );
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 px-5 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10"
                >

                  <Eye className="h-4 w-4" />

                  Ver como cliente

                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                >

                  {saving
                    ? "Salvando..."
                    : "Salvar orçamento"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* VISUALIZAÇÃO DO CLIENTE */}

      {showPreview &&
        previewBudget && (

          <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 p-3 md:p-6">

            <div className="mx-auto my-4 max-w-3xl rounded-2xl bg-white text-slate-900 shadow-2xl md:my-10">

              <div className="flex items-center justify-between border-b border-slate-200 p-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Visualização para o cliente
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Orçamento{" "}
                    {
                      previewBudget.number
                    }
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowPreview(
                      false
                    )
                  }
                  className="rounded-lg p-2 hover:bg-slate-100"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

              <div className="space-y-6 p-5 md:p-8">

                <div className="flex flex-col justify-between gap-4 sm:flex-row">

                  <div>

                    <h1 className="text-2xl font-bold">
                      Nando's Ar-Condicionado
                    </h1>

                    <p className="text-sm text-slate-500">
                      Qualidade e confiança em todos os detalhes.
                    </p>

                  </div>

                  <div className="text-left sm:text-right">

                    <p className="text-sm font-semibold">
                      {
                        previewBudget.number
                      }
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        previewBudget.date
                      }
                    </p>

                  </div>

                </div>

                <div className="rounded-xl bg-slate-100 p-4">

                  <p className="text-xs uppercase text-slate-500">
                    Cliente
                  </p>

                  <p className="mt-1 font-bold">
                    {
                      previewBudget.client
                    }
                  </p>

                  <p className="text-sm text-slate-500">
                    {
                      previewBudget.city
                    }
                  </p>

                  {previewBudget.equipment && (

                    <p className="mt-2 text-sm text-slate-600">

                      <strong>
                        Equipamento:
                      </strong>{" "}

                      {
                        previewBudget.equipment
                      }

                    </p>

                  )}

                </div>

                <div>

                  <h3 className="mb-3 font-bold">
                    Serviços
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-slate-200">

                    <div className="grid grid-cols-12 bg-slate-100 p-3 text-xs font-bold">

                      <div className="col-span-6">
                        Descrição
                      </div>

                      <div className="col-span-2 text-center">
                        Qtd.
                      </div>

                      <div className="col-span-2 text-right">
                        Unit.
                      </div>

                      <div className="col-span-2 text-right">
                        Total
                      </div>

                    </div>

                    {previewBudget.items.map(
                      (item) => (

                        <div
                          key={
                            item.id
                          }
                          className="grid grid-cols-12 border-t border-slate-200 p-3 text-sm"
                        >

                          <div className="col-span-6">
                            {
                              item.description
                            }
                          </div>

                          <div className="col-span-2 text-center">
                            {
                              item.quantity
                            }
                          </div>

                          <div className="col-span-2 text-right">
                            {money(
                              toNumber(
                                item.unitValue
                              )
                            )}
                          </div>

                          <div className="col-span-2 text-right font-semibold">
                            {money(
                              itemTotal(
                                item
                              )
                            )}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                <div className="ml-auto max-w-sm space-y-2">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal dos serviços
                    </span>

                    <strong>
                      {money(
                        previewBudget.referenceValue
                      )}
                    </strong>

                  </div>

                  {previewBudget.discountPercent >
                    0 && (

                    <div className="flex justify-between text-sm">

                      <span className="text-slate-500">
                        Desconto especial (
                        {previewBudget.discountPercent.toFixed(
                          2
                        )}
                        %)
                      </span>

                      <strong className="text-red-600">
                        -{" "}
                        {money(
                          previewBudget.discountValue
                        )}
                      </strong>

                    </div>

                  )}

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Serviços com desconto
                    </span>

                    <strong>
                      {money(
                        previewBudget.finalValue
                      )}
                    </strong>

                  </div>

                  {previewBudget.materialsValue >
                    0 && (

                    <div className="flex justify-between text-sm">

                      <span className="text-slate-500">
                        Materiais
                      </span>

                      <strong className="text-blue-600">
                        {money(
                          previewBudget.materialsValue
                        )}
                      </strong>

                    </div>

                  )}

                  <div className="flex justify-between border-t border-slate-300 pt-3 text-xl">

                    <span className="font-bold">
                      Total geral
                    </span>

                    <strong className="text-emerald-600">
                      {money(
                        previewBudget.totalValue
                      )}
                    </strong>

                  </div>

                </div>

                <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">

                  Nando's Ar-Condicionado

                  <br />

                  Qualidade e confiança em todos os detalhes.

                </div>

              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">

                <button
                  onClick={() =>
                    setShowPreview(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100"
                >
                  Fechar
                </button>

                <button
                  onClick={() =>
                    printBudget(
                      previewBudget
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                >

                  <FileText className="h-4 w-4" />

                  Imprimir / PDF

                </button>

                <button
                  onClick={() =>
                    sendWhatsApp(
                      previewBudget
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white"
                >

                  <MessageCircle className="h-4 w-4" />

                  Enviar WhatsApp

                </button>

              </div>

            </div>

          </div>

        )}

    </main>
  );
}
