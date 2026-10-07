// src/components/reimbursement/ReimbursementTable.jsx
import styled from "styled-components";
import { FiInbox, FiUpload } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import ReimbursementRowActions from "./ReimbursementRowActions";
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

const TableWrap = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const Scroller = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1180px;
  font-family: var(--font-family-base, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 13px;

  thead th {
    position: sticky;
    top: 0;
    background: var(--color-background);
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--color-text);
    padding: 13px 14px;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  tbody td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: var(--color-background);
  }
`;

const NumCell = styled.th`
  text-align: center;
  width: 170px;
`;

const IdTd = styled.td`
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
`;

const DateTd = styled.td`
  white-space: nowrap;
  min-width: 120px;
  ${({ $overdue }) =>
    $overdue &&
    `
    color: var(--color-danger);
    font-weight: 500;
  `}
`;

const OutstandingTd = styled.td`
  text-align: center;
  font-weight: 700;
  color: var(--color-text);
  width: 170px;
`;

const StatusTd = styled.td`
  padding-left: 20px;
`;

const StatusHeadCell = styled.th`
  padding-left: 20px;
`;

// Rows are clickable to filter by customer. Hover background is already
// handled by `tbody tr:hover td` in Table; this only adds the pointer and a
// keyboard focus ring.
const ClickableRow = styled.tr`
  ${({ $clickable }) => $clickable && "cursor: pointer;"}

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
`;

// "Actions" column holds only the View button.
const ActionsCell = styled.td`
  text-align: left;
  white-space: nowrap;
`;

const ActionsHeadCell = styled.th`
  text-align: left;
`;

// NEW: separate "Upload" column so it has its own header.
const UploadCell = styled.td`
  text-align: left;
  white-space: nowrap;
  width: 170px;
  padding-left: 30px;
`;

const UploadHeadCell = styled.th`
  text-align: left;
  width: 170px;
  padding-left: 30px;
`;

// Outlined button so it does not compete with the dark View button.
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
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

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

const ReimbursementTable = ({ records, onView, onUpload, onCustomerSelect, pagination }) => {
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

  return (
    <TableWrap>
      <Scroller>
        <Table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Reimbursement Number</th>
              <th>Reimbursement Date</th>
              <th>Due Date</th>
              <NumCell>Outstanding Amount</NumCell>
              <StatusHeadCell>Payment Status</StatusHeadCell>
              <ActionsHeadCell>Actions</ActionsHeadCell>
              {/* NEW: Upload column header */}
              <UploadHeadCell>Upload</UploadHeadCell>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const overdue = isOverdueRecord(r);
              const paid = isPaid(r);
              return (
                <ClickableRow
                  key={r.id}
                  $clickable={Boolean(onCustomerSelect && r.customer_name)}
                  onClick={() => selectCustomer(r.customer_name)}
                  onKeyDown={(e) => {
                    // Ignore keys pressed on inner controls (e.g. the View button).
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectCustomer(r.customer_name);
                    }
                  }}
                  tabIndex={onCustomerSelect && r.customer_name ? 0 : undefined}
                  title={onCustomerSelect && r.customer_name ? `Filter by ${r.customer_name}` : undefined}
                >
                  <td>{safeText(r.customer_name)}</td>
                  <IdTd>{safeText(r.invoice_number)}</IdTd>
                  <td>{formatApiDate(r.invoice_date)}</td>
                  <DateTd $overdue={overdue}>{formatApiDate(r.invoice_due_date)}</DateTd>
                  <OutstandingTd>{formatCurrency(getOutstandingAmount(r), getCurrencySymbol(r))}</OutstandingTd>
                  <StatusTd>
                    <StatusBadge paid={paid} overdue={overdue} />
                  </StatusTd>

                  {/* Stop propagation so clicking View / Upload never triggers the
                      row's customer filter. */}
                  <ActionsCell onClick={(e) => e.stopPropagation()}>
                    <ReimbursementRowActions record={r} onView={() => onView(r)} />
                  </ActionsCell>

                  {/* NEW: Upload cell */}
                  <UploadCell onClick={(e) => e.stopPropagation()}>
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
                  </UploadCell>
                </ClickableRow>
              );
            })}
          </tbody>
        </Table>
      </Scroller>

      {pagination && (
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
      )}
    </TableWrap>
  );
};

export default ReimbursementTable;