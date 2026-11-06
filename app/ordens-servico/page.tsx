"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Edit,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  applyMonthlyPlanToServiceOrder,
  registerPlanUse,
} from "@/lib/ordens-servico-plano";
import {
  getPlanoOSBadgeClass,
  getPlanoOSInfo,
} from "@/lib/ordens-servico-plano-ui";

const supabase = createClient();

type ServiceOrderStatus =
  | "Aberta"
  | "Agendada"
  | "Em andamento"
  | "Concluída"
  | "Cancelada";

type ServiceType =
  | "Preventiva"
  | "Corretiva"
  | "Instalação"
  | "Higienização"
  | "Visita técnica";

type Client = {
  id: string;
  nome: string;
  cidade: string;
};

type Equipment = {
  id: string;
  cliente_id?: string | null;
  clienteId?: string | null;
  nome?: string | null;
  descricao?: string | null;
  marca?: string | null;
  modelo?: string | null;
  capacidade?: string | null;
  btus?: string | number | null;
  tipo?: string | null;
  numero_serie?: string | null;
  numeroSerie?: string | null;
  localizacao?: string | null;
  ambiente?: string | null;
  [key: string]: unknown;
};

type Technician = {
  id: string;
  nome: string;
};

type ServiceOrder = {
  id: string;
  number: string;
  clientId: string;
  client: string;
  equipment: string;
  equipmentId: string;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentCapacity: string;
  city: string;
  serviceType: ServiceType;
  description: string;
  date: string;
  technician: string;
  technicianId: string;
  serviceValue: number;
  discountPercent: number;
  materialsValue: number;
  materialsDescription: string;
  materialsPaid: boolean;
  materialsPaidAt: string | null;
  value: number;
  status: ServiceOrderStatus;
  notes: string;

  monthlyPlanId: string | null;
  monthlyPlanCovered: boolean;
  monthlyPlanStatus: string;
  monthlyPlanWarning: string;
  monthlyPlanIncludedService: string;
};

type FormData = {
  clientId: string;
  client: string;
  equipmentId: string;
  equipment: string;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentCapacity: string;
  city: string;

  serviceType: ServiceType;
  description: string;
  date: string;

  technicianId: string;
  technician: string;

  value: string;
  discountPercent: string;
  materialsValue: string;
  materialsDescription: string;
  materialsPaid: boolean;

  status: ServiceOrderStatus;
  notes: string;

  monthlyPlanId: string | null;
  monthlyPlanCovered: boolean;
  monthlyPlanStatus: string;
  monthlyPlanWarning: string;
  monthlyPlanIncludedService: string;
};

const emptyForm: FormData = {
  clientId: "",
  client: "",
  equipmentId: "",
  equipment: "",
  equipmentBrand: "",
  equipmentModel: "",
  equipmentCapacity: "",
  city: "",

  serviceType: "Preventiva",
  description: "",
  date: new Date().toISOString().slice(0, 10),

  technicianId: "",
  technician: "",

  value: "",
  discountPercent: "",
  materialsValue: "",
  materialsDescription: "",
  materialsPaid: false,

  status: "Aberta",
  notes: "",

  monthlyPlanId: null,
  monthlyPlanCovered: false,
  monthlyPlanStatus: "",
  monthlyPlanWarning: "",
  monthlyPlanIncludedService: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("pt-BR");
}

function parseMoney(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const normalized = text
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEquipmentClientId(equipment: Equipment) {
  return String(
    equipment.cliente_id ??
      equipment.clienteId ??
      equipment.client_id ??
      equipment.clientId ??
      ""
  );
}

function getEquipmentName(equipment: Equipment) {
  const name =
    equipment.nome ??
    equipment.descricao ??
    equipment.equipamento ??
    "";
  if (String(name).trim()) {
    return String(name);
  }
  const brand = String(equipment.marca ?? "").trim();
  const model = String(equipment.modelo ?? "").trim();
  if (brand || model) {
    return [brand, model].filter(Boolean).join(" ");
  }
  return "Equipamento";
}

function getEquipmentBrand(equipment: Equipment) {
  return String(equipment.marca ?? equipment.brand ?? "").trim();
}

function getEquipmentModel(equipment: Equipment) {
  return String(equipment.modelo ?? equipment.model ?? "").trim();
}

function getEquipmentCapacity(equipment: Equipment) {
  const value =
    equipment.btus ??
    equipment.capacidade ??
    equipment.capacidade_btus ??
    equipment.btu ??
    "";
  if (!String(value).trim()) return "";
  return String(value);
}

function statusClass(status: ServiceOrderStatus) {
  if (status === "Concluída") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (status === "Cancelada") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (status === "Em andamento") {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
  if (status === "Agendada") {
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  }
  return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
}

function parseMaterialsList(description: string) {
  if (!description) return [];
  let items = description.split(/\r?\n/).map((i) => i.trim()).filter(Boolean);
  if (items.length <= 1) {
    const regex = /(\d+\s*[\w\/\s]+?)(?=\s+\d+\s+[\w\/]|$)/gi;
    const matches = description.match(regex);
    if (matches && matches.length > 0) {
      items = matches.map((m) => m.trim());
    } else {
      items = [description];
    }
  }
  return items;
}

function printServiceOrder(order: ServiceOrder) {
  const rawMaterials = parseMaterialsList(order.materialsDescription);
  const halfLength = Math.ceil(rawMaterials.length / 2);
  const col1 = rawMaterials.slice(0, halfLength);
  const col2 = rawMaterials.slice(halfLength);

  const materialsRowsHtml = Array.from({ length: Math.max(col1.length, col2.length) })
    .map((_, idx) => {
      const idx1 = idx + 1;
      const item1 = col1[idx] || "";
      const idx2 = halfLength + idx + 1;
      const item2 = col2[idx] || "";
      return `
        <tr>
          <td class="num">${item1 ? idx1 : ""}</td>
          <td>${escapeHtml(item1)}</td>
          <td class="num">${item2 ? idx2 : ""}</td>
          <td>${escapeHtml(item2)}</td>
        </tr>
      `;
    })
    .join("");

  const discountHtml = order.discountPercent > 0
    ? `<div style="margin-top: 4px; color: #166534; font-weight: bold;">Desconto Aplicado: ${order.discountPercent}%</div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>OS ${escapeHtml(order.number)}</title>
<style>
  @page { size: A4; margin: 10mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111; background: #fff; font-size: 13px; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; }
  .logo-header { text-align: center; margin-bottom: 8px; }
  .brand-title { font-size: 26px; font-weight: 800; color: #0b4a78; margin: 0; letter-spacing: -0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .header-info { font-size: 11px; color: #333; line-height: 1.35; margin-top: 4px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
  .os-title-box { text-align: center; margin: 12px 0 16px; }
  .os-title-box h1 { font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; }
  .os-subtitle { font-size: 13px; color: #444; font-style: italic; margin-top: 2px; }
  .section-title { font-size: 14px; font-weight: 800; margin: 14px 0 6px 0; text-transform: uppercase; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .info-card { border: 1px solid #777; border-radius: 8px; padding: 6px 10px; min-height: 44px; }
  .card-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #222; }
  .card-val { font-size: 13px; font-weight: 600; margin-top: 2px; color: #000; }
  table.tbl { width: 100%; border-collapse: collapse; margin-top: 2px; }
  table.tbl td, table.tbl th { border: 1px solid #333; padding: 5px 8px; font-size: 12px; }
  table.tbl td.num { width: 28px; text-align: center; font-weight: bold; background: #f9f9f9; }
  .pendente-text { color: #c5221f; font-weight: 900; font-size: 16px; letter-spacing: 0.5px; }
  .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; text-align: center; }
  .signature-line { border-top: 1.5px solid #000; padding-top: 5px; font-size: 12px; font-weight: bold; }
  .signature-hand { font-family: 'Brush Script MT', cursive, sans-serif; font-size: 26px; height: 35px; line-height: 35px; color: #1a365d; }
  @media print { body { padding: 0; } .sheet { padding: 0; width: 100%; max-width: 100%; } }
</style>
</head>
<body>
<div class="sheet">
  <div class="logo-header">
    <div class="brand-title">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b4a78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      Nando's Ar-Condicionado
    </div>
    <div class="header-info">
      <strong>NANDO'S AR-CONDICIONADO</strong> | CNPJ: 12.345.678/0001-90 | IE: 123.456.789.110<br>
      Rua Bernardino de Campos, 12-45, Vila Noemy, CEP: 17012-000, Bauru - SP<br>
      Tel/WhatsApp: (14) 99168-9815
    </div>
  </div>

  <div class="os-title-box">
    <h1>ORDEM DE SERVIÇO Nº ${escapeHtml(order.number)}</h1>
    <div class="os-subtitle">Qualidade e confiança em todos os detalhes.</div>
  </div>

  <div class="section-title">1. DADOS DO CLIENTE E EQUIPE:</div>
  <div class="grid-2">
    <div class="info-card">
      <div class="card-label">CLIENTE:</div>
      <div class="card-val">${escapeHtml(order.client)}</div>
    </div>
    <div class="info-card">
      <div class="card-label">CIDADE:</div>
      <div class="card-val">${escapeHtml(order.city)}</div>
    </div>
    <div class="info-card">
      <div class="card-label">DATA:</div>
      <div class="card-val">${escapeHtml(formatDate(order.date))}</div>
    </div>
    <div class="info-card">
      <div class="card-label">TÉCNICO:</div>
      <div class="card-val">${escapeHtml(order.technician || "Anderson")}</div>
    </div>
  </div>

  <div class="section-title">2. EQUIPAMENTO E SERVIÇO:</div>
  <div class="grid-2" style="margin-bottom: 8px;">
    <div class="info-card">
      <div class="card-label">EQUIPAMENTO:</div>
      <div class="card-val">${escapeHtml(order.equipment || "2 Aparelhos de Ar-Condicionado")}</div>
    </div>
    <div class="info-card">
      <div class="card-label">TIPO:</div>
      <div class="card-val">${escapeHtml(order.serviceType)}</div>
    </div>
  </div>

  <div class="info-card" style="min-height: 60px;">
    <div class="card-label">Descrição detalhada dos serviços:</div>
    <div class="card-val" style="font-weight: normal; font-size: 12px; line-height: 1.4; margin-top: 4px;">
      ${escapeHtml(order.description || "Serviços executados conforme combinado.")}
      ${discountHtml}
    </div>
  </div>

  <div class="section-title">3. MATERIAIS UTILIZADOS:</div>
  <table class="tbl">
    <tbody>
      ${
        materialsRowsHtml ||
        `
        <tr><td class="num">1</td><td>3 metros de cano 3/8</td><td class="num">6</td><td>2 fitas PVC</td></tr>
        <tr><td class="num">2</td><td>3 metros de cano 1/4</td><td class="num">7</td><td>1 fita prateada</td></tr>
        <tr><td class="num">3</td><td>Esponjoso para tubos</td><td class="num">8</td><td>4 metros de cabo PP 4 vias 1,5</td></tr>
        <tr><td class="num">4</td><td>1 suporte para telhado</td><td class="num">9</td><td>8 parafusos e 8 buchas</td></tr>
        <tr><td class="num">5</td><td>1 suporte de 45</td><td class="num">10</td><td>4 buchas e parafusos 10</td></tr>
        `
      }
    </tbody>
  </table>

  <div class="section-title">4. RESUMO FINANCEIRO:</div>
  <div class="grid-2">
    <div class="info-card">
      <div class="card-label">Valor do Serviço:</div>
      <div class="card-val">${formatCurrency(order.serviceValue)} ${order.discountPercent > 0 ? `(${order.discountPercent}% desc.)` : ""}</div>
    </div>
    <div class="info-card">
      <div class="card-label">Valor dos Materiais:</div>
      <div class="card-val">${formatCurrency(order.materialsValue)}</div>
    </div>
    <div class="info-card">
      <div class="card-label">TOTAL GERAL:</div>
      <div class="card-val" style="font-size: 15px; font-weight: 800;">${formatCurrency(order.value)}</div>
    </div>
    <div class="info-card">
      <div class="card-label">PAGAMENTO MATERIAIS:</div>
      <div class="card-val ${order.materialsPaid ? "" : "pendente-text"}">
        ${order.materialsPaid ? "PAGO" : "PENDENTE"}
      </div>
    </div>
  </div>

  <div class="section-title">5. ASSINATURAS:</div>
  <div class="signatures-grid">
    <div>
      <div class="signature-hand">Nando's</div>
      <div class="signature-line">Assinatura do Administrador (Nando's)</div>
    </div>
    <div>
      <div class="signature-hand">Cliente</div>
      <div class="signature-line">Assinatura do Cliente (Aprovação)</div>
    </div>
  </div>
</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>
`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Não foi possível abrir a janela de impressão.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}

function sendServiceOrderWhatsApp(order: ServiceOrder) {
  const message = [
    `*NANDO'S AR-CONDICIONADO*`,
    `*ORDEM DE SERVIÇO ${order.number}*`,
    ``,
    `Cliente: ${order.client}`,
    `Cidade: ${order.city}`,
    `Data: ${formatDate(order.date)}`,
    `Técnico: ${order.technician || "Não definido"}`,
    ``,
    `*Equipamento*`,
    `${order.equipment || "Não informado"}`,
    order.equipmentBrand ? `Marca: ${order.equipmentBrand}` : "",
    order.equipmentModel ? `Modelo: ${order.equipmentModel}` : "",
    order.equipmentCapacity ? `Capacidade: ${order.equipmentCapacity}` : "",
    ``,
    `*Serviço:* ${order.serviceType}`,
    `Descrição: ${order.description || "Não informada"}`,
    order.discountPercent > 0 ? `Desconto Aplicado: ${order.discountPercent}%` : "",
    ``,
    order.monthlyPlanId
      ? `*Plano mensal:* ${order.monthlyPlanCovered ? "SERVIÇO COBERTO" : order.monthlyPlanStatus}`
      : "",
    order.monthlyPlanWarning ? `Aviso: ${order.monthlyPlanWarning}` : "",
    ``,
    `*Valores*`,
    `Serviço: ${formatCurrency(order.serviceValue)} ${order.discountPercent > 0 ? `(com ${order.discountPercent}% de desconto)` : ""}`,
    `Materiais: ${formatCurrency(order.materialsValue)}`,
    `Materiais: ${order.materialsPaid ? "PAGO" : "PENDENTE"}`,
    `*Total: ${formatCurrency(order.value)}*`,
    ``,
    order.materialsDescription ? `Materiais: ${order.materialsDescription}` : "",
    ``,
    `Status: ${order.status}`,
    order.notes ? `Observações: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

export default function OrdensServicoPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | ServiceOrderStatus>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [clientEquipmentLoading, setClientEquipmentLoading] = useState(false);
  const [planChecking, setPlanChecking] = useState(false);

  const selectedClientEquipments = useMemo(() => {
    if (!form.clientId) return [];
    return equipments.filter((equipment) => getEquipmentClientId(equipment) === form.clientId);
  }, [equipments, form.clientId]);

  const serviceBaseValue = parseMoney(form.value);
  const discountPctNumber = parseMoney(form.discountPercent);
  const serviceValueNumber = discountPctNumber > 0 
    ? serviceBaseValue * (1 - discountPctNumber / 100) 
    : serviceBaseValue;

  const materialsValueNumber = parseMoney(form.materialsValue);
  const totalValue = serviceValueNumber + materialsValueNumber;

  async function loadData() {
    setLoading(true);

    const [ordersResult, clientsResult, equipmentsResult, techniciansResult] = await Promise.all([
      supabase.from("ordens_servico").select("*").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome, cidade").order("nome", { ascending: true }),
      supabase.from("equipamentos").select("*").order("created_at", { ascending: false }),
      supabase.from("tecnicos").select("id, nome").order("nome", { ascending: true }),
    ]);

    const loadedOrders: ServiceOrder[] = (ordersResult.data ?? []).map((item: any) => ({
      id: item.id,
      number: String(item.numero ?? ""),
      clientId: String(item.cliente_id ?? ""),
      client: String(item.cliente_nome ?? ""),
      equipment: String(item.equipamento ?? ""),
      equipmentId: String(item.equipamento_id ?? ""),
      equipmentBrand: String(item.equipamento_marca ?? ""),
      equipmentModel: String(item.equipamento_modelo ?? ""),
      equipmentCapacity: String(item.equipamento_capacidade ?? ""),
      city: String(item.cidade ?? ""),
      serviceType: (item.tipo_servico as ServiceType) || "Preventiva",
      description: String(item.descricao ?? ""),
      date: String(item.data ?? ""),
      technician: String(item.tecnico ?? ""),
      technicianId: String(item.tecnico_id ?? ""),
      serviceValue: Number(item.valor_servicos ?? item.valor ?? 0),
      discountPercent: Number(item.desconto_percentual ?? 0),
      materialsValue: Number(item.valor_materiais ?? 0),
      materialsDescription: String(item.materiais_descricao ?? ""),
      materialsPaid: Boolean(item.materiais_pago ?? false),
      materialsPaidAt: item.materiais_pago_em ?? null,
      value: Number(item.valor ?? Number(item.valor_servicos ?? 0) + Number(item.valor_materiais ?? 0)),
      status: (item.status as ServiceOrderStatus) || "Aberta",
      notes: String(item.observacoes ?? ""),
      monthlyPlanId: item.plano_mensal_id ?? null,
      monthlyPlanCovered: Boolean(item.plano_mensal_coberto ?? false),
      monthlyPlanStatus: String(item.plano_mensal_status ?? ""),
      monthlyPlanWarning: String(item.plano_mensal_aviso ?? ""),
      monthlyPlanIncludedService: String(item.plano_mensal_servico_incluso ?? ""),
    }));

    const loadedClients: Client[] = (clientsResult.data ?? []).map((item: any) => ({
      id: item.id,
      nome: String(item.nome ?? ""),
      cidade: String(item.cidade ?? ""),
    }));

    setOrders(loadedOrders);
    setClients(loadedClients);
    setEquipments((equipmentsResult.data ?? []) as Equipment[]);
    setTechnicians((techniciansResult.data ?? []).map((item: any) => ({ id: item.id, nome: String(item.nome ?? "") })));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.number.toLowerCase().includes(term) ||
        order.client.toLowerCase().includes(term) ||
        order.city.toLowerCase().includes(term) ||
        order.equipment.toLowerCase().includes(term) ||
        order.serviceType.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "Todos" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      open: orders.filter((item) => item.status === "Aberta").length,
      scheduled: orders.filter((item) => item.status === "Agendada").length,
      progress: orders.filter((item) => item.status === "Em andamento").length,
      completed: orders.filter((item) => item.status === "Concluída").length,
    };
  }, [orders]);

  function openNewOrder() {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  }

  function openEditOrder(order: ServiceOrder) {
    setEditingId(order.id);
    setForm({
      clientId: order.clientId,
      client: order.client,
      equipmentId: order.equipmentId,
      equipment: order.equipment,
      equipmentBrand: order.equipmentBrand,
      equipmentModel: order.equipmentModel,
      equipmentCapacity: order.equipmentCapacity,
      city: order.city,
      serviceType: order.serviceType,
      description: order.description,
      date: order.date,
      technicianId: order.technicianId,
      technician: order.technician,
      value: String(order.serviceValue),
      discountPercent: order.discountPercent ? String(order.discountPercent) : "",
      materialsValue: String(order.materialsValue),
      materialsDescription: order.materialsDescription,
      materialsPaid: order.materialsPaid,
      status: order.status,
      notes: order.notes,
      monthlyPlanId: order.monthlyPlanId,
      monthlyPlanCovered: order.monthlyPlanCovered,
      monthlyPlanStatus: order.monthlyPlanStatus,
      monthlyPlanWarning: order.monthlyPlanWarning,
      monthlyPlanIncludedService: order.monthlyPlanIncludedService,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleClientChange(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    if (!client) {
      setForm((old) => ({
        ...old,
        clientId: "",
        client: "",
        city: "",
        equipmentId: "",
        equipment: "",
        equipmentBrand: "",
        equipmentModel: "",
        equipmentCapacity: "",
        monthlyPlanId: null,
        monthlyPlanCovered: false,
        monthlyPlanStatus: "",
        monthlyPlanWarning: "",
        monthlyPlanIncludedService: "",
      }));
      return;
    }

    setForm((old) => ({
      ...old,
      clientId: client.id,
      client: client.nome,
      city: client.cidade ?? "",
      equipmentId: "",
      equipment: "",
      equipmentBrand: "",
      equipmentModel: "",
      equipmentCapacity: "",
      monthlyPlanId: null,
      monthlyPlanCovered: false,
      monthlyPlanStatus: "",
      monthlyPlanWarning: "",
      monthlyPlanIncludedService: "",
    }));

    setClientEquipmentLoading(true);
    try {
      const { data } = await supabase.from("equipamentos").select("*");
      setEquipments((data ?? []) as Equipment[]);
    } catch (error) {
      console.error(error);
    }
    setClientEquipmentLoading(false);

    await checkPlanForCurrentService(client.id, form.serviceType, parseMoney(form.value));
  }

  function handleEquipmentChange(equipmentId: string) {
    const equipment = equipments.find((item) => item.id === equipmentId);
    if (!equipment) {
      setForm((old) => ({
        ...old,
        equipmentId: "",
        equipment: "",
        equipmentBrand: "",
        equipmentModel: "",
        equipmentCapacity: "",
      }));
      return;
    }

    setForm((old) => ({
      ...old,
      equipmentId: equipment.id,
      equipment: getEquipmentName(equipment),
      equipmentBrand: getEquipmentBrand(equipment),
      equipmentModel: getEquipmentModel(equipment),
      equipmentCapacity: getEquipmentCapacity(equipment),
    }));
  }

  async function checkPlanForCurrentService(clientId: string, service: string, normalValue: number) {
    if (!clientId) return;
    setPlanChecking(true);
    try {
      const result = await applyMonthlyPlanToServiceOrder({
        clientId,
        service,
        normalServiceValue: normalValue,
      });

      setForm((old) => ({
        ...old,
        monthlyPlanId: result.plano_mensal_id,
        monthlyPlanCovered: result.plano_mensal_coberto,
        monthlyPlanStatus: result.plano_mensal_status,
        monthlyPlanWarning: result.plano_mensal_aviso,
        monthlyPlanIncludedService: result.plano_mensal_servico_incluso,
        value: String(result.valor_servicos),
      }));
    } catch (error) {
      console.error(error);
    }
    setPlanChecking(false);
  }

  async function handleServiceChange(service: ServiceType) {
    setForm((old) => ({ ...old, serviceType: service }));
    if (!form.clientId) return;
    await checkPlanForCurrentService(form.clientId, service, parseMoney(form.value));
  }

  function handleTechnicianChange(technicianId: string) {
    const technician = technicians.find((item) => item.id === technicianId);
    setForm((old) => ({ ...old, technicianId, technician: technician?.nome ?? "" }));
  }

  async function saveOrder() {
    if (!form.clientId) {
      alert("Selecione um cliente.");
      return;
    }
    if (!form.serviceType) {
      alert("Selecione o tipo de serviço.");
      return;
    }
    if (!form.date) {
      alert("Informe a data da ordem de serviço.");
      return;
    }

    setSaving(true);
    try {
      const monthlyPlanData = await applyMonthlyPlanToServiceOrder({
        clientId: form.clientId,
        service: form.serviceType,
        normalServiceValue: serviceValueNumber,
      });

      const finalServiceValue = monthlyPlanData.plano_mensal_coberto ? 0 : serviceValueNumber;
      const finalTotal = finalServiceValue + materialsValueNumber;

      const commonData = {
        cliente_id: form.clientId,
        cliente_nome: form.client,
        cidade: form.city,
        equipamento: form.equipment || "Não informado",
        equipamento_id: form.equipmentId || null,
        equipamento_marca: form.equipmentBrand || null,
        equipamento_modelo: form.equipmentModel || null,
        equipamento_capacidade: form.equipmentCapacity || null,
        tipo_servico: form.serviceType,
        descricao: form.description || null,
        data: form.date,
        tecnico: form.technician || null,
        tecnico_id: form.technicianId || null,
        valor_servicos: finalServiceValue,
        desconto_percentual: discountPctNumber,
        valor_materiais: materialsValueNumber,
        materiais_descricao: form.materialsDescription || null,
        valor: finalTotal,
        status: form.status,
        observacoes: form.notes || null,
        plano_mensal_id: monthlyPlanData.plano_mensal_id,
        plano_mensal_coberto: monthlyPlanData.plano_mensal_coberto,
        plano_mensal_status: monthlyPlanData.plano_mensal_status,
        plano_mensal_aviso: monthlyPlanData.plano_mensal_aviso,
        plano_mensal_servico_incluso: monthlyPlanData.plano_mensal_servico_incluso,
      };

      let savedOrder: any = null;

      if (editingId) {
        const existingOrder = orders.find((item) => item.id === editingId);
        const { data, error } = await supabase
          .from("ordens_servico")
          .update({
            ...commonData,
            materiais_pago: existingOrder?.materialsPaid ?? form.materialsPaid ?? false,
            materiais_pago_em: existingOrder?.materialsPaidAt ?? null,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;
        savedOrder = data;
      } else {
        const number = `OS-${String(Date.now()).slice(-6)}`;
        const { data, error } = await supabase
          .from("ordens_servico")
          .insert({
            ...commonData,
            numero: number,
            materiais_pago: false,
            materiais_pago_em: null,
          })
          .select()
          .single();

        if (error) throw error;
        savedOrder = data;
      }

      if (savedOrder?.id && monthlyPlanData.plano_mensal_id) {
        try {
          await registerPlanUse({
            planoId: monthlyPlanData.plano_mensal_id,
            ordemServicoId: savedOrder.id,
            clientId: form.clientId,
            service: form.serviceType,
            equipment: form.equipment,
            covered: monthlyPlanData.plano_mensal_coberto,
            reason: monthlyPlanData.plano_mensal_aviso || "",
            notes: form.notes || "",
          });
        } catch (usageError) {
          console.error(usageError);
        }
      }

      alert(editingId ? "Ordem de serviço atualizada com sucesso." : "Ordem de serviço criada com sucesso.");
      closeForm();
      await loadData();
    } catch (error: any) {
      alert(error?.message || "Não foi possível salvar a ordem de serviço.");
    }
    setSaving(false);
  }

  async function deleteOrder(order: ServiceOrder) {
    if (!window.confirm(`Deseja excluir a ordem de serviço ${order.number}?`)) return;
    const { error } = await supabase.from("ordens_servico").delete().eq("id", order.id);
    if (error) {
      alert("Não foi possível excluir a ordem de serviço.");
      return;
    }
    if (selectedOrder?.id === order.id) setSelectedOrder(null);
    await loadData();
  }

  async function changeStatus(order: ServiceOrder, status: ServiceOrderStatus) {
    const { error } = await supabase.from("ordens_servico").update({ status }).eq("id", order.id);
    if (error) {
      alert("Não foi possível alterar o status.");
      return;
    }
    await loadData();
    setSelectedOrder((old) => (old ? { ...old, status } : old));
  }

  async function toggleMaterialsPayment(order: ServiceOrder) {
    const nextPaid = !order.materialsPaid;
    const { error } = await supabase
      .from("ordens_servico")
      .update({
        materiais_pago: nextPaid,
        materiais_pago_em: nextPaid ? new Date().toISOString() : null,
      })
      .eq("id", order.id);

    if (error) {
      alert("Não foi possível atualizar o pagamento dos materiais.");
      return;
    }

    const updated = {
      ...order,
      materialsPaid: nextPaid,
      materialsPaidAt: nextPaid ? new Date().toISOString() : null,
    };
    setSelectedOrder(updated);
    setOrders((old) => old.map((item) => (item.id === order.id ? updated : item)));
  }

  function getCurrentPlanInfo() {
    return getPlanoOSInfo({
      plano_mensal_status: form.monthlyPlanStatus,
      plano_mensal_coberto: form.monthlyPlanCovered,
      plano_mensal_aviso: form.monthlyPlanWarning,
      plano_mensal_servico_incluso: form.monthlyPlanIncludedService,
    });
  }

  const currentPlanInfo = getCurrentPlanInfo();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3">
                <ClipboardList className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Ordens de Serviço</h1>
                <p className="text-sm text-slate-400">Controle completo das ordens de serviço</p>
              </div>
            </div>
          </div>
          <button
            onClick={openNewOrder}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />
            Nova Ordem de Serviço
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Abertas</p>
            <p className="mt-2 text-2xl font-bold text-yellow-400">{stats.open}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Agendadas</p>
            <p className="mt-2 text-2xl font-bold text-purple-400">{stats.scheduled}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Em andamento</p>
            <p className="mt-2 text-2xl font-bold text-blue-400">{stats.progress}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Concluídas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.completed}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar OS, cliente, cidade ou equipamento..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "Todos" | ServiceOrderStatus)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="Todos">Todos os status</option>
              <option value="Aberta">Abertas</option>
              <option value="Agendada">Agendadas</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluídas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">Ordens de Serviço</h2>
            <p className="text-xs text-slate-500">{filteredOrders.length} ordem(ns) encontrada(s)</p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">Carregando ordens de serviço...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <ClipboardList className="mb-4 h-12 w-12 text-slate-700" />
              <h3 className="font-semibold">Nenhuma ordem encontrada</h3>
              <p className="mt-1 text-sm text-slate-500">Crie uma nova ordem de serviço para começar.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredOrders.map((order) => {
                const planInfo = getPlanoOSInfo({
                  plano_mensal_status: order.monthlyPlanStatus,
                  plano_mensal_coberto: order.monthlyPlanCovered,
                  plano_mensal_aviso: order.monthlyPlanWarning,
                  plano_mensal_servico_incluso: order.monthlyPlanIncludedService,
                });

                return (
                  <div key={order.id} className="p-5 transition hover:bg-slate-800/30">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{order.number}</h3>
                          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(order.status)}`}>
                            {order.status}
                          </span>
                          {order.monthlyPlanId && (
                            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getPlanoOSBadgeClass(planInfo.status, planInfo.coberto)}`}>
                              {planInfo.coberto ? "Plano: Coberto" : `Plano: ${planInfo.status}`}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                          <span className="flex items-center gap-2"><User className="h-4 w-4 text-cyan-400" />{order.client}</span>
                          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" />{order.city || "-"}</span>
                          <span className="flex items-center gap-2"><Wrench className="h-4 w-4 text-cyan-400" />{order.equipment || "-"}</span>
                          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-400" />{formatDate(order.date)}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <span>Serviço: <strong>{formatCurrency(order.serviceValue)}</strong> {order.discountPercent > 0 && <span className="text-emerald-400">({order.discountPercent}% desc.)</span>}</span>
                          <span>Materiais: <strong>{formatCurrency(order.materialsValue)}</strong></span>
                          <span>Total: <strong className="text-cyan-400">{formatCurrency(order.value)}</strong></span>
                          <span className={order.materialsPaid ? "text-emerald-400" : "text-yellow-400"}>
                            Materiais: {order.materialsPaid ? "Pago" : "Pendente"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">Ver</button>
                        <button onClick={() => openEditOrder(order)} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"><Edit className="h-4 w-4" />Editar</button>
                        <button onClick={() => printServiceOrder(order)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800" title="Imprimir"><Printer className="h-4 w-4" /></button>
                        <button onClick={() => sendServiceOrderWhatsApp(order)} className="rounded-lg border border-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/10" title="WhatsApp"><MessageCircle className="h-4 w-4" /></button>
                        <button onClick={() => deleteOrder(order)} className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">{editingId ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</h2>
                <p className="text-xs text-slate-500">Cliente, equipamento, plano, serviço e materiais</p>
              </div>
              <button onClick={closeForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6 p-5">
              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  <div><h3 className="font-semibold">Cliente</h3><p className="text-xs text-slate-500">Selecione o cliente cadastrado</p></div>
                </div>
                <select
                  value={form.clientId}
                  onChange={(event) => handleClientChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.nome}{client.cidade ? ` — ${client.cidade}` : ""}</option>
                  ))}
                </select>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-cyan-400" />
                  <div><h3 className="font-semibold">Equipamento</h3><p className="text-xs text-slate-500">Equipamentos cadastrados para este cliente</p></div>
                </div>
                {!form.clientId ? (
                  <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">Primeiro selecione um cliente.</div>
                ) : clientEquipmentLoading ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-300">Buscando equipamentos...</div>
                ) : selectedClientEquipments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">Nenhum equipamento encontrado.</div>
                ) : (
                  <select
                    value={form.equipmentId}
                    onChange={(event) => handleEquipmentChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  >
                    <option value="">Selecione o equipamento...</option>
                    {selectedClientEquipments.map((equipment) => (
                      <option key={equipment.id} value={equipment.id}>{getEquipmentName(equipment)}</option>
                    ))}
                  </select>
                )}
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-cyan-400" /><h3 className="font-semibold">Serviço</h3></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Tipo de serviço</label>
                    <select
                      value={form.serviceType}
                      onChange={(event) => handleServiceChange(event.target.value as ServiceType)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    >
                      <option value="Preventiva">Preventiva</option>
                      <option value="Corretiva">Corretiva</option>
                      <option value="Instalação">Instalação</option>
                      <option value="Higienização">Higienização</option>
                      <option value="Visita técnica">Visita técnica</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Data</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm((old) => ({ ...old, date: event.target.value }))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-400">Descrição do serviço</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((old) => ({ ...old, description: event.target.value }))}
                      rows={4}
                      placeholder="Descreva o serviço..."
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center gap-2"><Wrench className="h-5 w-5 text-cyan-400" /><h3 className="font-semibold">Técnico</h3></div>
                <select
                  value={form.technicianId}
                  onChange={(event) => handleTechnicianChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                >
                  <option value="">Selecione o técnico...</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>{technician.nome}</option>
                  ))}
                </select>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-cyan-400" /><h3 className="font-semibold">Valores e Desconto</h3></div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Valor Bruto do Serviço</label>
                    <input
                      value={form.value}
                      onChange={(event) => setForm((old) => ({ ...old, value: event.target.value }))}
                      placeholder="0,00"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Desconto (%)</label>
                    <input
                      value={form.discountPercent}
                      onChange={(event) => setForm((old) => ({ ...old, discountPercent: event.target.value }))}
                      placeholder="Ex: 15"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Materiais</label>
                    <input
                      value={form.materialsValue}
                      onChange={(event) => setForm((old) => ({ ...old, materialsValue: event.target.value }))}
                      placeholder="0,00"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Total Geral</label>
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-lg font-bold text-cyan-400">
                      {formatCurrency(totalValue)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-slate-400">Descrição dos materiais</label>
                  <textarea
                    value={form.materialsDescription}
                    onChange={(event) => setForm((old) => ({ ...old, materialsDescription: event.target.value }))}
                    rows={3}
                    placeholder="Listar materiais..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-800 bg-slate-900 p-5">
              <button onClick={closeForm} disabled={saving} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800">Cancelar</button>
              <button onClick={saveOrder} disabled={saving} className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400">
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar Ordem de Serviço"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
              <h2 className="text-xl font-bold">{selectedOrder.number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-4">
                  <h3 className="font-semibold">Cliente</h3>
                  <p className="font-semibold">{selectedOrder.client}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <h3 className="font-semibold">Atendimento</h3>
                  <p className="text-sm">Data: <strong>{formatDate(selectedOrder.date)}</strong></p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <h3 className="font-semibold mb-2">Valores</h3>
                <p className="text-sm">Serviço: <strong>{formatCurrency(selectedOrder.serviceValue)}</strong> {selectedOrder.discountPercent > 0 && <span className="text-emerald-400">({selectedOrder.discountPercent}% de desconto)</span>}</p>
                <p className="text-sm">Materiais: <strong>{formatCurrency(selectedOrder.materialsValue)}</strong></p>
                <p className="text-sm mt-1">Total Geral: <strong className="text-cyan-400">{formatCurrency(selectedOrder.value)}</strong></p>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-800 bg-slate-900 p-5">
              <button onClick={() => printServiceOrder(selectedOrder)} className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"><Printer className="h-4 w-4" />Imprimir</button>
              <button onClick={() => sendServiceOrderWhatsApp(selectedOrder)} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10"><MessageCircle className="h-4 w-4" />WhatsApp</button>
              <button onClick={() => setSelectedOrder(null)} className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
