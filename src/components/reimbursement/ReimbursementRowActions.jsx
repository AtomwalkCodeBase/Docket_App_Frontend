// src/components/reimbursement/ReimbursementRowActions.jsx
import styled from "styled-components";
import { FiEye } from "react-icons/fi";

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
`;

const variantStyles = {
  view: { bg: "#1B3358", bgHover: "#142542", color: "#ffffff" },
  update: { bg: "#DCEBFB", bgHover: "#C7DFF8", color: "#1D5A9E" },
  mail: { bg: "#D8F3EE", bgHover: "#C3ECE4", color: "#0F7A65" },
  pdf: { bg: "#EDE3FA", bgHover: "#E1D1F5", color: "#6B3FA0" },
};

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid transparent;
  background: ${({ $variant }) => variantStyles[$variant].bg};
  color: ${({ $variant }) => variantStyles[$variant].color};
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, opacity 0.15s ease,transform 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $variant }) => variantStyles[$variant].bgHover};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const ReimbursementRowActions = ({ record, onView }) => (
  <Actions>
    <ActionBtn
      type="button"
      $variant="view"
      onClick={onView}
      aria-label={`View ${record?.invoice_number || record?.id}`}
      title="View details"
    >
      <FiEye size={13} />
      View
    </ActionBtn>
  </Actions>
);

export default ReimbursementRowActions;
