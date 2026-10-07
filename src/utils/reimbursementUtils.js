const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};


export function parseApiDate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split("-");
  if (parts.length !== 3) return null;
  const [day, mon, year] = parts;
  const monthIndex = MONTHS[mon.toLowerCase().slice(0, 3)];
  if (monthIndex === undefined) return null;
  const d = new Date(Number(year), monthIndex, Number(day));
  return Number.isNaN(d.getTime()) ? null : d;
}


export function parseInputDate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("-"); // "YYYY-MM-DD"
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Pulls a numeric amount out of either a plain number or a pre-formatted
// string like "₹10,000.00" / "$5,000.00".
export function parseAmount(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function getCurrencySymbol(record) {
  return record?.currency_symbol || "";
}

export function getTotalAmount(record) {
  return parseAmount(record?.total);
}

// outstanding_amt is provided directly by the API; fall back to total only
// if it is missing, so the UI never shows a blank figure.
export function getOutstandingAmount(record) {
  if (record?.outstanding_amt === null || record?.outstanding_amt === undefined) {
    return getTotalAmount(record);
  }
  return parseAmount(record.outstanding_amt);
}

// Reliable because outstanding_amt comes straight from the API — this is
// simply total minus that figure, never an assumption based on status.
export function getPaidAmount(record) {
  const paid = getTotalAmount(record) - getOutstandingAmount(record);
  return paid > 0 ? paid : 0;
}

export function isPaid(record) {
  return record?.invoice_status === "B";
}

export function getPaymentStatusLabel(record) {
  return isPaid(record) ? "Paid" : "Not Paid";
}

export function isOverdueRecord(record) {
  return Boolean(record?.is_over_due);
}

// "Due today" = the record's due date is today's LOCAL calendar date.
// parseApiDate builds a local-midnight Date, so comparing year / month / day
// components is a pure calendar comparison: no timestamps, no timezone or DST
// drift, and it doesn't matter what time of day `today` was read.
export function isDueToday(record, today = new Date()) {
  const due = parseApiDate(record?.invoice_due_date);
  if (!due) return false;
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

export function formatCurrency(amount, symbol = "") {
  const value = Number(amount) || 0;
  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// API dates are already display-ready strings ("23-Sep-2026"); this just
// guards against null/missing values.
export function formatApiDate(value) {
  return value ? value : "—";
}

export function safeText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

// ---- Currency-grouped aggregation ----
// Sums are grouped by currency symbol rather than combined, since invoices
// in this dataset can use different currencies and converting would mean
// inventing an exchange rate.

export function sumByCurrency(records, amountGetter) {
  const groups = {};
  records.forEach((r) => {
    const symbol = getCurrencySymbol(r) || "—";
    const amount = amountGetter(r);
    groups[symbol] = (groups[symbol] || 0) + amount;
  });
  return groups;
}

export function formatGroupedAmount(groups) {
  const entries = Object.entries(groups || {});
  if (entries.length === 0) return "—";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, amount]) => formatCurrency(amount, symbol === "—" ? "" : symbol))
    .join(" · ");
}

// ---- Summary cards ----

export function getSummary(records) {
  const paidRecords = records.filter(isPaid);
  const notPaidRecords = records.filter((r) => !isPaid(r));
  const overdueRecords = records.filter(isOverdueRecord);

  return {
    totalInvoices: records.length,
    totalInvoiceAmountGrouped: sumByCurrency(records, getTotalAmount),
    totalOutstandingGrouped: sumByCurrency(records, getOutstandingAmount),
    paidCount: paidRecords.length,
    notPaidCount: notPaidRecords.length,
    overdueCount: overdueRecords.length,
  };
}

// ---- Total Outstanding Fees (page-level summary) ----
// Sums the API's own outstanding_amt field, restricted to records whose
// invoice_status marks them as not-paid — matches "Only include records
// that are actually pending/unpaid" rather than trusting outstanding_amt
// alone to already be zero on paid rows.
export function getPendingOutstandingGrouped(records) {
  return sumByCurrency(records.filter((r) => !isPaid(r)), getOutstandingAmount);
}

// ---- Overdue panel ----

export function getOverdueSummary(records) {
  const overdueRecords = records.filter(isOverdueRecord);
  return {
    overdueCount: overdueRecords.length,
    overdueOutstandingGrouped: sumByCurrency(overdueRecords, getOutstandingAmount),
  };
}

// ---- Amount distribution: paid vs outstanding, per currency ----

export function getAmountDistribution(records) {
  const paidGrouped = sumByCurrency(records, getPaidAmount);
  const outstandingGrouped = sumByCurrency(records, getOutstandingAmount);
  const symbols = [...new Set([...Object.keys(paidGrouped), ...Object.keys(outstandingGrouped)])].sort();

  return symbols.map((symbol) => {
    const paid = paidGrouped[symbol] || 0;
    const outstanding = outstandingGrouped[symbol] || 0;
    const total = paid + outstanding;
    return {
      symbol: symbol === "—" ? "" : symbol,
      paid,
      outstanding,
      paidShare: total > 0 ? paid / total : 0,
      outstandingShare: total > 0 ? outstanding / total : 0,
    };
  });
}

// ---- Filtering ----

export function filterRecords(records, filters) {
  const {
    search = "",
    customer = "",
    status = "", // "paid" | "not_paid" | ""
    overdue = "", // "yes" | "no" | "today" | ""
    dateFrom = "",
    dateTo = "",
  } = filters;

  const q = search.trim().toLowerCase();
  const today = new Date(); // read once so every record is compared to the same day

  return records.filter((r) => {
    if (q) {
      const haystack = [r.customer_name, r.invoice_number].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (customer && r.customer_name !== customer) return false;
    if (status === "paid" && !isPaid(r)) return false;
    if (status === "not_paid" && isPaid(r)) return false;
    if (overdue === "yes" && !isOverdueRecord(r)) return false;
    if (overdue === "no" && isOverdueRecord(r)) return false;
    // Independent of "yes"/"no": purely "is the due date today".
    if (overdue === "today" && !isDueToday(r, today)) return false;

    if (dateFrom || dateTo) {
      const invoiceDate = parseApiDate(r.invoice_date);
      if (!invoiceDate) return false;

      if (dateFrom) {
        const fromDate = parseInputDate(dateFrom);
        // Both sides are local-midnight Dates, so this is an inclusive
        // calendar-date comparison — the "from" day itself is included.
        if (fromDate && invoiceDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = parseInputDate(dateTo);
        // Same here — the "to" day itself is included.
        if (toDate && invoiceDate > toDate) return false;
      }
    }
    return true;
  });
}

export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getInvoiceDateError(iso) {
  if (!iso) return "Select a reimbursement date.";
  if (iso > todayISO()) return "Reimbursement date cannot be in the future.";
  return undefined;
}

const OLD_DATE_WARNING = "You are selecting a date from more than 5 days ago. Please choose carefully.";

export function getInvoiceDateWarning(iso) {
  if (!iso || getInvoiceDateError(iso)) return "";
  return iso < daysAgoISO(5) ? OLD_DATE_WARNING : "";
}

export function isoToDDMMYYYY(iso) {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}-${mm}-${yyyy}`;
}

export function normalizeListResponse(res) {
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function getProductLabel(p) {
  return p?.product_name || p?.name || p?.title || (p?.id !== undefined ? `Product #${p.id}` : "Unnamed product");
}

export function getProductPriceHint(p) {
  const raw = p?.price ?? p?.sale_price ?? p?.selling_price ?? p?.unit_price ?? p?.rate;
  if (raw === undefined || raw === null || raw === "") return "";
  const num = Number(raw);
  return Number.isFinite(num) ? String(num) : "";
}

export function extractApiError(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstVal = firstKey ? data[firstKey] : null;
    if (Array.isArray(firstVal) && firstVal.length) return String(firstVal[0]);
    if (typeof firstVal === "string") return firstVal;
  }
  return err?.message || fallback;
}

export const MAX_QTY_DIGITS = 4;
const MAX_PRICE_INT_DIGITS = 10;
const MAX_PRICE_DECIMALS = 2;

export const sanitizeQuantity = (value) => String(value).replace(/\D/g, "").slice(0, MAX_QTY_DIGITS);

export const sanitizePrice = (value) => {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const [intRaw = "", ...rest] = cleaned.split(".");
  const intPart = intRaw.slice(0, MAX_PRICE_INT_DIGITS);
  if (rest.length === 0) return intPart;
  return `${intPart}.${rest.join("").slice(0, MAX_PRICE_DECIMALS)}`;
};

export function getQuantityError(value) {
  const n = Number(value);
  if (value === "" || value === null || value === undefined || !Number.isFinite(n) || n <= 0) {
    return "Quantity must be greater than 0.";
  }
  if (!Number.isInteger(n)) return "Quantity must be a whole number.";
  if (String(value).length > MAX_QTY_DIGITS) return `Quantity can have at most ${MAX_QTY_DIGITS} digits.`;
  return undefined;
}

export function getPriceError(value) {
  const n = Number(value);
  if (value === "" || value === null || value === undefined || !Number.isFinite(n) || n <= 0) {
    return "Price must be greater than 0.";
  }
  const [intPart] = String(value).split(".");
  if (intPart.length > MAX_PRICE_INT_DIGITS) return `Price can have at most ${MAX_PRICE_INT_DIGITS} digits.`;
  return undefined;
}