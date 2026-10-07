// src/components/reimbursement/ReimbursementTable.jsx
import styled from "styled-components";
import { FiEye, FiInbox, FiUpload } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import Table from "../common/Table";
import Pagination from "../common/Pagination";
import {
  formatCurrency,
  formatApiDate,
  getCurrencySymbol,
  getOutstandingAmount,
  isPaid,
  isOverdueRecord,
  safeText,
} from "../../utils/reimbursementUtils";

/* Page-specific cell content only – table structure/styling lives in common Table */
const Strong = styled.span`
  font-weight: ${({ $weight }) => $weight || 600};
  color: var(--color-text);
  white-space: nowrap;
`;

const DueDate = styled.span`
  white-space: nowrap;

  ${({ $overdue }) =>
    $overdue &&
    `
    color: var(--color-danger);
    font-weight: 500;
  `}
`;

const CustomerCell = styled.span`
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

const ActionButtons = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid transparent;
  background: #1b3358;
  color: #ffffff;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, opacity 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    background: #142542;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-primary-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

const Empty = styled.div`
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  text-align: center;
  font-family: var(--font-family-base, "IBM Plex Sans", system-ui, sans-serif);

  svg {
    color: var(--color-text-subtle);
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 13.5px;
  }

  span {
    font-size: 12.5px;
  }
`;

const ReimbursementTable = ({
  records,
  onView,
  onUpload,
  onCustomerSelect,
  pagination,
}) => {
  const selectCustomer = (name) => {
    if (onCustomerSelect && name) onCustomerSelect(name);
  };

  const totalCount = pagination ? pagination.totalCount : records.length;

  if (totalCount === 0) {
    return (
      <Empty>
        <FiInbox size={26} />
        <p>No reimbursement invoices match the current filters.</p>
        <span>Try clearing a filter or widening the date range.</span>
      </Empty>
    );
  }

  const columns = [
    {
      key: "customer_name",
      header: "Customer Name",
      render: (r) => {
        if (!(onCustomerSelect && r.customer_name)) {
          return safeText(r.customer_name);
        }

        return (
          <CustomerCell
            tabIndex={0}
            title={`Filter by ${r.customer_name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectCustomer(r.customer_name);
              }
            }}
          >
            {safeText(r.customer_name)}
          </CustomerCell>
        );
      },
    },
    {
      key: "invoice_number",
      header: "Reimbursement Number",
      render: (r) => <Strong>{safeText(r.invoice_number)}</Strong>,
    },
    {
      key: "invoice_date",
      header: "Reimbursement Date",
      render: (r) => formatApiDate(r.invoice_date),
    },
    {
      key: "invoice_due_date",
      header: "Due Date",
      render: (r) => (
        <DueDate $overdue={isOverdueRecord(r)}>
          {formatApiDate(r.invoice_due_date)}
        </DueDate>
      ),
    },
    {
      key: "outstanding_amount",
      header: "Outstanding Amount",
      align: "center",
      width: "170px",
      render: (r) => (
        <Strong $weight={700}>
          {formatCurrency(getOutstandingAmount(r), getCurrencySymbol(r))}
        </Strong>
      ),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (r) => (
        <StatusBadge paid={isPaid(r)} overdue={isOverdueRecord(r)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      nowrap: true,
      render: (r) => (
        <ActionButtons onClick={(e) => e.stopPropagation()}>
          <ViewButton
            type="button"
            onClick={() => onView(r)}
            aria-label={`View ${r?.invoice_number || r?.id}`}
            title="View details"
          >
            <FiEye size={13} />
            View
          </ViewButton>

          {onUpload && (
            <UploadButton
              type="button"
              onClick={() => onUpload(r)}
              aria-label={`Upload document for ${safeText(r.invoice_number)}`}
            >
              <FiUpload size={14} />
              <span>Upload</span>
            </UploadButton>
          )}
        </ActionButtons>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={records}
      rowKey="id"
      minWidth="1180px"
      onRowClick={
        onCustomerSelect ? (r) => selectCustomer(r.customer_name) : undefined
      }
      footer={
        pagination ? (
          <Pagination
            embedded
            showPageNumbers
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            startIdx={pagination.startIdx}
            endIdx={pagination.endIdx}
            onPageChange={pagination.onPageChange}
          />
        ) : null
      }
    />
  );
};

export default ReimbursementTable;