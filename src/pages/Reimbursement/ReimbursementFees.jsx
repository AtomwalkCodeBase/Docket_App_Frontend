// src/pages/ReimbursementFees.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { FiPlus, FiAlertCircle, FiRefreshCw, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SummaryCards from "../../components/reimbursement/SummaryCards";
import ReimbursementFilters from "../../components/reimbursement/ReimbursementFilters";
import ReimbursementTable from "../../components/reimbursement/ReimbursementTable";
import ReimbursementDetailsModal from "../../components/modal/ReimbursementDetailsModal";
import ReimbursementUploadModal from "../../components/modal/ReimbursementUploadModal"; // NEW
import { getReimbursementOrderList } from "../../services/productServices";
import {
  filterRecords,
  safeText,
  formatApiDate,
  getOutstandingAmount,
  getPaymentStatusLabel,
} from "../../utils/reimbursementUtils";
import {
  AMOUNT_RANGE_OPTIONS,
  DUE_RANGE_OPTIONS,
  resolveAmount,
  applyAmountRange,
  applyDueRange,
} from "../../utils/reimbursementFilterRanges";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  search: "",
  customer: "",
  status: "",
  overdue: "",
  amountRange: "all",
  dueRange: "",
  dateFrom: "",
  dateTo: "",
};

const readFiltersFromUrl = (searchParams) => {
  const amountRange = searchParams.get("amountRange");
  const dueRange = searchParams.get("dueRange");
  return {
    ...EMPTY_FILTERS,
    amountRange: AMOUNT_RANGE_OPTIONS.some((o) => o.value === amountRange)
      ? amountRange
      : EMPTY_FILTERS.amountRange,
    dueRange: DUE_RANGE_OPTIONS.some((o) => o.value === dueRange) ? dueRange : EMPTY_FILTERS.dueRange,
  };
};


const Page = styled.div`
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
  margin: 0 auto;
  min-width: 0;
  padding: 24px 24px 40px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-family: var(--rf-font-serif, inherit);
  font-size: 28px;
  font-weight: 700;
  color: var(--rf-ink);
  margin: 0 0 4px;
`;

const Subtitle = styled.p`
  font-size: 13.5px;
  color: var(--rf-slate);
  margin: 0;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--rf-radius-sm);
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  background: var(--rf-brass);
  color: #ffffff;
  box-shadow: var(--rf-shadow-sm);
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--rf-brass-dark);
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 560px) {
    justify-content: center;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--rf-radius-sm);
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--rf-line-strong);
  background: var(--rf-surface);
  color: var(--rf-ink-soft);

  &:hover {
    background: var(--rf-paper);
  }
`;

const StateCard = styled.div`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: var(--rf-slate);

  ${({ $variant }) =>
    $variant === "error" &&
    `
    color: var(--rf-rust);

    p {
      color: var(--rf-ink-soft);
      margin: 0;
      max-width: 420px;
    }
  `}

  ${({ $variant }) =>
    $variant === "loading" &&
    `
    p {
      margin: 0;
      font-size: 13.5px;
    }
  `}
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid var(--rf-line);
  border-top-color: var(--rf-brass);
  border-radius: 50%;
  animation: rf-spin 0.7s linear infinite;

  @keyframes rf-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ExportSection = styled.div`
  margin-top: 20px;
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-sm);
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ExportText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ExportTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const ExportSubtitle = styled.span`
  font-size: 12.5px;
  color: var(--rf-slate);
`;

const ReimbursementFees = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFiltersFromUrl(searchParams));
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [uploadRecord, setUploadRecord] = useState(null); // NEW: record the Upload modal is open for
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: records = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchRecords,
  } = useQuery({
    queryKey: ["reimbursement-orders"],
    queryFn: async () => {
      try {
        const res = await getReimbursementOrderList();
        return Array.isArray(res?.data) ? res.data : [];
      } catch (err) {
        console.error("Failed to fetch reimbursement list:", err);
        throw err;
      }
    },
  });

  const error = queryError
    ? queryError?.response?.data?.detail ||
      queryError?.message ||
      "Something went wrong while loading reimbursement invoices."
    : null;


  useEffect(() => {
    if (records.length === 0) return;
    const resolved = records.map(resolveAmount).filter((r) => r.key);
    if (resolved.length === 0) {
      console.warn(
        "[ReimbursementFees] Amount Range: no amount field found on any record. Sample record keys/values:",
        records[0]
      );
    } else {
      console.info("[ReimbursementFees] Amount Range is using field:", resolved[0].key);
    }
  }, [records]);

  const customerOptions = useMemo(
    () => [...new Set(records.map((r) => r.customer_name).filter(Boolean))].sort(),
    [records]
  );

  const dateRangeError = useMemo(
    () =>
      filters.dateFrom && filters.dateTo && filters.dateTo < filters.dateFrom
        ? "To date cannot be earlier than From date."
        : "",
    [filters.dateFrom, filters.dateTo]
  );

  const effectiveFilters = useMemo(
    () => (dateRangeError ? { ...filters, dateFrom: "", dateTo: "" } : filters),
    [filters, dateRangeError]
  );

  const filteredRecords = useMemo(
    () =>
      applyDueRange(
        applyAmountRange(filterRecords(records, effectiveFilters), effectiveFilters.amountRange),
        effectiveFilters.dueRange
      ),
    [records, effectiveFilters]
  );

  const hasActiveFilters = useMemo(
    () => Object.keys(EMPTY_FILTERS).some((key) => effectiveFilters[key] !== EMPTY_FILTERS[key]),
    [effectiveFilters]
  );

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (filters.amountRange && filters.amountRange !== "all") next.set("amountRange", filters.amountRange);
    else next.delete("amountRange");
    if (filters.dueRange) next.set("dueRange", filters.dueRange);
    else next.delete("dueRange");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [filters.amountRange, filters.dueRange, searchParams, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const pagination = {
    currentPage,
    totalPages,
    totalCount: filteredRecords.length,
    startIdx: filteredRecords.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
    endIdx: Math.min(currentPage * PAGE_SIZE, filteredRecords.length),
    onPageChange: (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)),
  };

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearAllFilters = () => setFilters(EMPTY_FILTERS);

  const statusLabel = filters.status === "paid" ? "Paid" : filters.status === "not_paid" ? "Not Paid" : "";
  const overdueLabel =
    filters.overdue === "yes"
      ? "Overdue only"
      : filters.overdue === "no"
      ? "Not overdue"
      : filters.overdue === "today"
      ? "Due today"
      : "";
  const amountRangeLabel =
    AMOUNT_RANGE_OPTIONS.find((o) => o.value === filters.amountRange)?.chipLabel || "";
  const dueRangeLabel = DUE_RANGE_OPTIONS.find((o) => o.value === filters.dueRange)?.chipLabel || "";

  const activeChips = [
    filters.customer && {
      key: "customer",
      label: filters.customer,
      onRemove: () => updateFilter("customer", ""),
    },
    filters.status && {
      key: "status",
      label: statusLabel,
      onRemove: () => updateFilter("status", ""),
    },
    filters.overdue && {
      key: "overdue",
      label: overdueLabel,
      onRemove: () => updateFilter("overdue", ""),
    },
    amountRangeLabel && {
      key: "amountRange",
      label: amountRangeLabel,
      onRemove: () => updateFilter("amountRange", "all"),
    },
    dueRangeLabel && {
      key: "dueRange",
      label: dueRangeLabel,
      onRemove: () => updateFilter("dueRange", ""),
    },
    !dateRangeError &&
      (filters.dateFrom || filters.dateTo) && {
      key: "dateRange",
      label: `${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`,
      onRemove: () => {
        updateFilter("dateFrom", "");
        updateFilter("dateTo", "");
      },
    },
  ].filter(Boolean);

  const handleExportToExcel = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      toast.info(
        hasActiveFilters
          ? "No records match the current filters to export."
          : "No reimbursement records available to export."
      );
      return;
    }

    const exportRows = filteredRecords.map((r) => ({
      "Customer Name": safeText(r.customer_name),
      "Invoice Number": safeText(r.invoice_number),
      "Invoice Date": formatApiDate(r.invoice_date),
      "Due Date": formatApiDate(r.invoice_due_date),
      "Outstanding Amount": getOutstandingAmount(r),
      "Payment Status": getPaymentStatusLabel(r),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reimbursement Fees");

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    XLSX.writeFile(workbook, `Reimbursement_Fees${hasActiveFilters ? "_Filtered" : ""}_${dateStr}.xlsx`);
  };

  return (
    <DashboardLayout
      activeNav="reimbursement-fees"
      breadcrumb="Sales / Reimbursement Fees"
      pageTitle="Reimbursement Fees"
    >
      <Page>
        <HeaderRow>
          <div>
            <Title>Reimbursement Fees</Title>
            <Subtitle>Track outstanding patent-related fees paid on behalf of clients.</Subtitle>
          </div>
          <PrimaryButton type="button" onClick={() => navigate("/reimbursement-fees/add")}>
            <FiPlus size={16} />
            <span>Add Reimbursement</span>
          </PrimaryButton>
        </HeaderRow>

        {loading ? (
          <StateCard $variant="loading">
            <Spinner />
            <p>Loading reimbursement invoices…</p>
          </StateCard>
        ) : error ? (
          <StateCard $variant="error">
            <FiAlertCircle size={22} />
            <p>{error}</p>
            <SecondaryButton type="button" onClick={fetchRecords}>
              <FiRefreshCw size={14} />
              <span>Retry</span>
            </SecondaryButton>
          </StateCard>
        ) : (
          <>
            <SummaryCards
              records={filteredRecords}
              onDashboardClick={() => navigate("/reimbursement-fees/dashboard")}
            />
            
            <ReimbursementFilters
              filters={filters}
              onChange={updateFilter}
              onClearAll={clearAllFilters}
              customerOptions={customerOptions}
              amountRangeOptions={AMOUNT_RANGE_OPTIONS}
              dateRangeError={dateRangeError}
              activeChips={activeChips}
              resultCount={filteredRecords.length}
              totalCount={records.length}
            />

            <ReimbursementTable
              records={paginatedRecords}
              onView={setSelectedRecord}
              onUpload={setUploadRecord} // NEW
              onCustomerSelect={(customerName) => updateFilter("customer", customerName)}
              pagination={pagination}
            />

            <ExportSection>
              <ExportText>
                <ExportTitle>Export Data</ExportTitle>
                <ExportSubtitle>
                  {hasActiveFilters
                    ? `Download the ${filteredRecords.length} record${
                        filteredRecords.length === 1 ? "" : "s"
                      } matching your current filters`
                    : "Download all reimbursement records"}
                </ExportSubtitle>
              </ExportText>
              <SecondaryButton type="button" onClick={handleExportToExcel}>
                <FiDownload size={14} />
                <span>{hasActiveFilters ? "Export Filtered to Excel" : "Export to Excel"}</span>
              </SecondaryButton>
            </ExportSection>
          </>
        )}
      </Page>

      {selectedRecord && (
        <ReimbursementDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

      {uploadRecord && (
        <ReimbursementUploadModal
          record={uploadRecord}
          onClose={() => setUploadRecord(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ReimbursementFees;