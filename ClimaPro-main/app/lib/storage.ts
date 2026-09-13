export type ClimaProData = {
  clients: unknown[];
  equipments: unknown[];
  budgets: unknown[];
  serviceOrders: unknown[];
  appointments: unknown[];
  contracts: unknown[];
  employees: unknown[];
  transactions: unknown[];
  products: unknown[];
};

const STORAGE_KEY = "climapro_data";

const initialData: ClimaProData = {
  clients: [],
  equipments: [],
  budgets: [],
  serviceOrders: [],
  appointments: [],
  contracts: [],
  employees: [],
  transactions: [],
  products: [],
};

export function getClimaProData(): ClimaProData {
  if (typeof window === "undefined") {
    return initialData;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return initialData;
    }

    return {
      ...initialData,
      ...JSON.parse(saved),
    };
  } catch {
    return initialData;
  }
}

export function saveClimaProData(data: ClimaProData) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function updateClimaProData(
  section: keyof ClimaProData,
  value: unknown[]
) {
  const data = getClimaProData();

  data[section] = value;

  saveClimaProData(data);
}
