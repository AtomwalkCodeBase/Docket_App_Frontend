import styled, { css } from "styled-components";
import { FiX, FiTrash2, FiEdit2, FiCheck } from "react-icons/fi";
import { RemarkCell } from "../modal/ConfirmReimbursementModal";
import { formatCurrency } from "../../utils/reimbursementUtils";

/*
  Shared style helpers (copied unchanged from AddReimbursement.jsx).
  They are required by CellInput / CellError below and are still used
  by the parent's own form controls, so they live in both files.
*/
const ErrorText = styled.span`
  font-size: 11.5px;
  color: var(--rf-rust);
`;

const inputBorder = ({ $hasError }) => ($hasError ? "var(--rf-rust)" : "var(--rf-line)");

const focusRing = css`
  &:focus {
    outline: none;
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 1px var(--rf-brass);
  }

  &:disabled {
    background: var(--rf-paper);
    color: var(--rf-slate-light);
  }
`;

const textControl = css`
  width: 100%;
  border: 1px solid ${inputBorder};
  border-radius: var(--rf-radius-sm);
  background: var(--rf-surface);
  font-family: inherit;
  color: var(--rf-ink);
  outline: none;
  box-shadow: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  ${focusRing}
`;

const ItemsWrap = styled.div`
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);
  overflow: auto;
  max-height: 320px;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  min-width: 880px;

  thead th {
    position: sticky;
    top: 0;
    background: var(--rf-paper);
    text-align: left;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--rf-ink-soft);
    padding: 11px 14px;
    border-bottom: 2px solid var(--rf-line-strong);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  thead th.rf-num {
    text-align: right;
  }

  thead th.rf-col-qty {
    width: 120px;
  }

  thead th.rf-col-price {
    width: 150px;
  }

  thead th.rf-col-remark {
    min-width: 200px;
  }

  thead th.rf-actions {
    width: 150px;
    text-align: center;
  }

  tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--rf-line);
    color: var(--rf-ink-soft);
  }

  tbody td.rf-num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  tbody td.rf-actions {
    text-align: center;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background-color 0.12s ease;
  }

  tbody tr:hover {
    background: var(--rf-paper);
  }

  tbody tr.rf-editing {
    background: var(--rf-paper);
  }

  tbody tr.rf-editing td {
    vertical-align: top;
  }
`;

const RemoveBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: var(--rf-rust);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--rf-radius-sm);
  display: inline-flex;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-rust-soft);
    border-color: var(--rf-rust);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditBtn = styled(RemoveBtn)`
  color: var(--rf-brass-dark);

  &:hover:not(:disabled) {
    background: var(--rf-brass-soft);
    border-color: var(--rf-brass);
  }
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CellStatic = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $right }) => ($right ? "flex-end" : "flex-start")};
  min-height: 38px;
`;

const CellInput = styled.input`
  ${textControl}
  height: 38px;
  padding: 0 10px;
  font-size: 13.5px;
  text-align: ${({ $right }) => ($right ? "right" : "left")};
`;

const CellError = styled(ErrorText)`
  display: block;
  margin-top: 4px;
  text-align: left;
  line-height: 1.4;
`;

const InlineSaveBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 11px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid transparent;
  background: var(--rf-brass);
  color: #fff;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-brass-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InlineCancelBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 11px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid var(--rf-line);
  background: var(--rf-surface);
  color: var(--rf-ink);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-paper);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/*
  Presentational Product/Item table.
  All state, handlers, validation and sanitizers are owned by AddReimbursement
  and passed in as props.
*/
const ReimbursementItems = ({
  items,
  editingKey,
  editDraft,
  setEditDraft,
  editErrors,
  setEditErrors,
  submitting,
  onStartEdit,
  onRemove,
  onSaveEdit,
  onCancelEdit,
  onEditKeyDown,
  sanitizeQuantity,
  sanitizePrice,
  maxQtyDigits,
}) => {
  return (
    <ItemsWrap>
      <ItemsTable>
        <thead>
          <tr>
            <th>Product</th>
            <th className="rf-num rf-col-qty">Qty</th>
            <th className="rf-num rf-col-price">Price</th>
            <th className="rf-col-remark">Remark</th>
            <th className="rf-num">Amount</th>
            <th className="rf-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            if (editingKey === it.key) {
              const liveAmount = (Number(editDraft.quantity) || 0) * (Number(editDraft.price) || 0);
              return (
                <tr key={it.key} className="rf-editing">
                  <td>
                    <CellStatic>{it.productLabel}</CellStatic>
                  </td>
                  <td className="rf-num">
                    <CellInput
                      type="text"
                      inputMode="numeric"
                      maxLength={maxQtyDigits}
                      $right
                      value={editDraft.quantity}
                      onChange={(e) => {
                        setEditDraft((d) => ({ ...d, quantity: sanitizeQuantity(e.target.value) }));
                        setEditErrors((p) => ({ ...p, quantity: undefined }));
                      }}
                      onKeyDown={onEditKeyDown}
                      disabled={submitting}
                      $hasError={!!editErrors.quantity}
                      aria-label={`Quantity for ${it.productLabel}`}
                    />
                    {editErrors.quantity && <CellError>{editErrors.quantity}</CellError>}
                  </td>
                  <td className="rf-num">
                    <CellInput
                      type="text"
                      inputMode="decimal"
                      $right
                      value={editDraft.price}
                      onChange={(e) => {
                        setEditDraft((d) => ({ ...d, price: sanitizePrice(e.target.value) }));
                        setEditErrors((p) => ({ ...p, price: undefined }));
                      }}
                      onKeyDown={onEditKeyDown}
                      disabled={submitting}
                      $hasError={!!editErrors.price}
                      aria-label={`Price for ${it.productLabel}`}
                    />
                    {editErrors.price && <CellError>{editErrors.price}</CellError>}
                  </td>
                  <td>
                    <CellInput
                      type="text"
                      placeholder="Maximum 100 character"
                      value={editDraft.remark}
                      onChange={(e) => setEditDraft((d) => ({ ...d, remark: e.target.value }))}
                      maxLength={100}
                      onKeyDown={onEditKeyDown}
                      disabled={submitting}
                      autoComplete="off"
                      aria-label={`Remark for ${it.productLabel}`}
                    />
                  </td>
                  <td className="rf-num">
                    <CellStatic $right>₹{formatCurrency(liveAmount)}</CellStatic>
                  </td>
                  <td className="rf-actions">
                    <ActionGroup>
                      <InlineSaveBtn type="button" onClick={onSaveEdit} disabled={submitting}>
                        <FiCheck size={13} />
                        Save
                      </InlineSaveBtn>
                      <InlineCancelBtn type="button" onClick={onCancelEdit} disabled={submitting}>
                        <FiX size={13} />
                        Cancel
                      </InlineCancelBtn>
                    </ActionGroup>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={it.key}>
                <td>{it.productLabel}</td>
                <td className="rf-num">{it.quantity}</td>
                <td className="rf-num">₹{formatCurrency(it.price)}</td>
                <td>
                  <RemarkCell value={it.remark} />
                </td>
                <td className="rf-num">₹{formatCurrency(it.quantity * it.price)}</td>
                <td className="rf-actions">
                  <ActionGroup>
                    <EditBtn
                      type="button"
                      onClick={() => onStartEdit(it)}
                      disabled={submitting || (!!editingKey && editingKey !== it.key)}
                      aria-label={`Edit ${it.productLabel}`}
                      title={editingKey ? "Save or cancel the current edit first" : "Edit"}
                    >
                      <FiEdit2 size={13} />
                    </EditBtn>
                    <RemoveBtn
                      type="button"
                      onClick={() => onRemove(it.key)}
                      disabled={submitting}
                      aria-label={`Remove ${it.productLabel}`}
                      title="Remove"
                    >
                      <FiTrash2 size={13} />
                    </RemoveBtn>
                  </ActionGroup>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ItemsTable>
    </ItemsWrap>
  );
};

export default ReimbursementItems;
