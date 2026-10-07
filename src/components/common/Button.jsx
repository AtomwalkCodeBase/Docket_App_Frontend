import { forwardRef } from "react";
import styled, { css } from "styled-components";

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--rf-radius-sm, 8px);
  border: 1px solid transparent;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;

  svg {
    flex-shrink: 0;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--rf-brass, #a9762f);
    outline-offset: 2px;
  }
`;

/* -------------------------------------------------------------------------- */
/*  Variants – only colours differ; size, spacing and font stay the same.     */
/* -------------------------------------------------------------------------- */
const solid = (bg, hoverBg) => css`
  background: ${bg};
  color: #ffffff;

  &:hover:not(:disabled) {
    background: ${hoverBg};
  }
`;

const outline = (color, hoverBg, hoverBorder, hoverColor) => css`
  background: var(--rf-surface, #ffffff);
  border-color: var(--rf-line-strong, #cdc6b4);
  color: ${color};

  &:hover:not(:disabled) {
    background: ${hoverBg};
    border-color: ${hoverBorder};
    color: ${hoverColor};
  }
`;

const VARIANTS = {
  // Standard design – identical to the old ReimbursementTable View button
  view: solid("#1b3358", "#142542"),

  // Primary actions
  add: solid("var(--rf-brass, #a9762f)", "var(--rf-brass-dark, #8a5f22)"),
  save: solid("var(--rf-brass, #a9762f)", "var(--rf-brass-dark, #8a5f22)"),

  // Secondary / neutral actions
  back: outline(
    "var(--rf-ink, #16213e)",
    "var(--rf-brass-soft, #f1e4cc)",
    "var(--rf-brass, #a9762f)",
    "var(--rf-brass-dark, #8a5f22)"
  ),
  cancel: outline(
    "var(--rf-ink, #16213e)",
    "var(--rf-paper, #f6f5f1)",
    "var(--rf-line-strong, #cdc6b4)",
    "var(--rf-ink, #16213e)"
  ),
  upload: outline(
    "var(--rf-ink-soft, #3b4a6b)",
    "var(--rf-brass-soft, #f1e4cc)",
    "var(--rf-brass, #a9762f)",
    "var(--rf-brass-dark, #8a5f22)"
  ),

  // Row-level actions
  edit: css`
    background: var(--rf-brass-soft, #f1e4cc);
    color: var(--rf-brass-dark, #8a5f22);

    &:hover:not(:disabled) {
      background: var(--rf-brass, #a9762f);
      color: #ffffff;
    }
  `,
  delete: css`
    background: var(--rf-surface, #ffffff);
    border-color: var(--rf-rust, #b23a34);
    color: var(--rf-rust, #b23a34);

    &:hover:not(:disabled) {
      background: var(--rf-rust, #b23a34);
      color: #ffffff;
    }
  `,
};

const StyledButton = styled.button`
  ${base}
  ${({ $variant }) => VARIANTS[$variant] || VARIANTS.view}
`;

const Button = forwardRef(function Button(
  { variant = "view", icon, type = "button", children, ...rest },
  ref
) {
  return (
    <StyledButton ref={ref} type={type} $variant={variant} {...rest}>
      {icon}
      {children}
    </StyledButton>
  );
});

export default Button;
