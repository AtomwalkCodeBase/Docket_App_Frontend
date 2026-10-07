import { useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import { FiX, FiCheck, FiCheckCircle, FiLoader } from "react-icons/fi";
import { formatCurrency } from "../../utils/reimbursementUtils";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const uppercaseLabel = css`
  font-weight: 700;
  color: var(--rf-slate);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export const SpinIcon = styled(FiLoader)`
  animation: ${spin} 0.9s linear infinite;
  flex-shrink: 0;
`;

export const SectionIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--rf-brass-soft);
  color: var(--rf-brass-dark);
  flex-shrink: 0;

  svg {
    display: block;
  }
`;

const buttonBase = css`
  height: 46px;
  border-radius: var(--rf-radius-sm);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const SecondaryBtn = styled.button`
  ${buttonBase}
  padding: 0 20px;
  border: 1px solid var(--rf-line);
  background: var(--rf-surface);
  color: var(--rf-ink);
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-paper);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const PrimaryBtn = styled.button`
  ${buttonBase}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  border: 1px solid transparent;
  background: var(--rf-brass);
  color: #fff;
  box-shadow: var(--rf-shadow-sm);
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-brass-dark);
  }

  &:disabled {
    opacity: 0.65;
  }
`;

const RemarkText = styled.span`
  display: inline-block;
  max-width: 260px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const EmptyDash = styled.span`
  color: var(--rf-slate-light);
`;

export function RemarkCell({ value }) {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? <RemarkText>{text}</RemarkText> : <EmptyDash>—</EmptyDash>;
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
  animation: ${fadeIn} 0.15s ease;
`;

const Modal = styled.div`
  width: calc(100% - 32px);
  max-width: 800px;
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: var(--rf-surface);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-md);
  overflow: hidden;
  animation: ${scaleIn} 0.18s ease;

  @media (max-width: 560px) {
    width: 100%;
    max-height: calc(100vh - 24px);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 22px;
  background: var(--rf-paper);
  border-bottom: 1px solid var(--rf-line);
  flex-shrink: 0;

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

const ModalHeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModalTitle = styled.h2`
  margin: 0 0 3px;
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 19px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--rf-slate);
`;

const ModalCloseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: var(--rf-radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--rf-slate);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-surface);
    border-color: var(--rf-line);
    color: var(--rf-ink);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

const ModalSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--rf-line);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ModalSummaryField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const ModalSummaryFieldFull = styled(ModalSummaryField)`
  grid-column: 1 / -1;
`;

const ModalSummaryLabel = styled.span`
  ${uppercaseLabel}
  font-size: 11px;
`;

const ModalSummaryValue = styled.span`
  font-size: 14.5px;
  font-weight: 600;
  color: var(--rf-ink);
  word-break: break-word;
`;

const ModalRemarkValue = styled(ModalSummaryValue)`
  font-weight: 500;
  white-space: pre-wrap;
`;

const ModalItemsHeading = styled.h3`
  ${uppercaseLabel}
  margin: 0 0 10px;
  font-size: 11px;
`;

const ModalItemsWrap = styled.div`
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);
  overflow: auto;
  max-height: 260px;
`;

const ModalItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  min-width: 600px;

  thead th {
    position: sticky;
    top: 0;
    background: var(--rf-paper);
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--rf-ink-soft);
    padding: 10px 14px;
    border-bottom: 2px solid var(--rf-line-strong);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  thead th.rf-num {
    text-align: right;
  }

  tbody td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--rf-line);
    color: var(--rf-ink-soft);
  }

  tbody td.rf-num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const ModalTotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding-top: 14px;
`;

const ModalTotalLabel = styled.span`
  ${uppercaseLabel}
  font-size: 11.5px;
`;

const ModalTotalValue = styled.span`
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const ModalActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  background: var(--rf-paper);
  border-top: 1px solid var(--rf-line);
  flex-shrink: 0;

  @media (max-width: 560px) {
    padding: 14px 16px;
    flex-direction: column-reverse;

    & > button {
      width: 100%;
    }
  }
`;

const ConfirmReimbursementModal = ({
  open,
  customerLabel,
  invoiceDate,
  additionalRemarks = "",
  items = [],
  totalAmount,
  submitting = false,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalOverlay
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal role="dialog" aria-modal="true" aria-labelledby="rf-confirm-modal-title">
        <ModalHeader>
          <SectionIconCircle>
            <FiCheckCircle size={17} />
          </SectionIconCircle>
          <ModalHeaderText>
            <ModalTitle id="rf-confirm-modal-title">Confirm Reimbursement</ModalTitle>
            <ModalSubtitle>Please review the reimbursement details before creating the invoice.</ModalSubtitle>
          </ModalHeaderText>
          <ModalCloseBtn type="button" onClick={onClose} disabled={submitting} aria-label="Close">
            <FiX size={16} />
          </ModalCloseBtn>
        </ModalHeader>

        <ModalBody>
          <ModalSection>
            <ModalSummaryField>
              <ModalSummaryLabel>Customer</ModalSummaryLabel>
              <ModalSummaryValue>{customerLabel || "—"}</ModalSummaryValue>
            </ModalSummaryField>
            <ModalSummaryField>
              <ModalSummaryLabel>Reimbursement Date</ModalSummaryLabel>
              <ModalSummaryValue>{invoiceDate || "—"}</ModalSummaryValue>
            </ModalSummaryField>
            <ModalSummaryFieldFull>
              <ModalSummaryLabel>Additional Remarks</ModalSummaryLabel>
              <ModalRemarkValue>{additionalRemarks.trim() || "—"}</ModalRemarkValue>
            </ModalSummaryFieldFull>
          </ModalSection>

          <div>
            <ModalItemsHeading>Items</ModalItemsHeading>
            <ModalItemsWrap>
              <ModalItemTable>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="rf-num">Qty</th>
                    <th className="rf-num">Price</th>
                    <th>Remark</th>
                    <th className="rf-num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.key}>
                      <td>{it.productLabel}</td>
                      <td className="rf-num">{it.quantity}</td>
                      <td className="rf-num">₹{formatCurrency(it.price)}</td>
                      <td>
                        <RemarkCell value={it.remark} />
                      </td>
                      <td className="rf-num">₹{formatCurrency(Number(it.quantity) * Number(it.price))}</td>
                    </tr>
                  ))}
                </tbody>
              </ModalItemTable>
            </ModalItemsWrap>

            <ModalTotalRow>
              <ModalTotalLabel>Total</ModalTotalLabel>
              <ModalTotalValue>₹{formatCurrency(totalAmount)}</ModalTotalValue>
            </ModalTotalRow>
          </div>
        </ModalBody>

        <ModalActions>
          <SecondaryBtn type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </SecondaryBtn>
          <PrimaryBtn type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <SpinIcon size={14} />
                Creating reimbursement...
              </>
            ) : (
              <>
                <FiCheck size={14} />
                Confirm &amp; Create
              </>
            )}
          </PrimaryBtn>
        </ModalActions>
      </Modal>
    </ModalOverlay>
  );
};

export default ConfirmReimbursementModal;
