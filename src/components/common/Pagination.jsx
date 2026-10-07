import styled from "styled-components";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const C = {
  primary: "var(--rf-brass, #a9762f)",
  primaryHover: "var(--rf-brass-dark, #8a5f22)",
  surface: "var(--color-surface, #ffffff)",
  hoverBg: "var(--rf-brass-soft, #f1e4cc)",
  border: "var(--color-border, #c8dded)",
  text: "var(--color-text-secondary, #16213e)",
  muted: "var(--color-text-muted, #5b6578)",
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-family: var(--font-family-base, "IBM Plex Sans", system-ui, sans-serif);
  box-sizing: border-box;
  ${({ $embedded }) =>
    $embedded
      ? `padding: 14px 18px; border-top: 1px solid ${C.border};`
      : "margin-top: 18px;"}

  /* Phone: stack, centre, never overflow */
  @media (max-width: 600px) {
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    ${({ $embedded }) => ($embedded ? "padding: 12px;" : "")}
  }
`;

const Info = styled.span`
  font-size: 13px;
  color: ${C.muted};
  white-space: nowrap;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
  flex-wrap: nowrap;

  @media (max-width: 600px) {
    gap: 4px;
    justify-content: center;
  }
`;

const Btn = styled.button`
  flex: 0 0 auto;
  box-sizing: border-box;
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid ${({ $active }) => ($active ? C.primary : C.border)};
  background: ${({ $active }) => ($active ? C.primary : C.surface)};
  color: ${({ $active }) => ($active ? "#ffffff" : C.text)};
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  /* hover keeps text readable: active stays teal (darker), others get a soft tint */
  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? C.primaryHover : C.hoverBg)};
    border-color: ${({ $active }) => ($active ? C.primaryHover : C.primary)};
    color: ${({ $active }) => ($active ? "#ffffff" : C.primaryHover)};
  }

  &:focus-visible {
    outline: 2px solid ${C.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
  }
`;

const NavLabel = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

const PageBtn = styled(Btn)`
  @media (max-width: 480px) {
    ${({ $far }) => ($far ? "display: none;" : "")}
  }
`;

const MAX_VISIBLE = 5;

function getPageNumbers(current, total) {
  if (total <= MAX_VISIBLE) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(MAX_VISIBLE / 2));
  let end = start + MAX_VISIBLE - 1;
  if (end > total) {
    end = total;
    start = end - MAX_VISIBLE + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const Pagination = ({
  currentPage,
  totalPages,
  totalCount,
  startIdx,
  endIdx,
  onPageChange,
  showPageNumbers = false,
  embedded = false,
}) => {
  const pageNumbers = showPageNumbers ? getPageNumbers(currentPage, totalPages) : [];
  const safeTotal = totalPages || 1;

  return (
    <Bar $embedded={embedded}>
      <Info>
        {totalCount != null
          ? `Showing ${startIdx}–${endIdx} of ${totalCount}`
          : `Page ${currentPage} of ${safeTotal}`}
      </Info>

      <Controls>
        <Btn
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <FiChevronLeft size={14} />
          <NavLabel>Previous</NavLabel>
        </Btn>

        {pageNumbers.map((page) => (
          <PageBtn
            key={page}
            type="button"
            $active={page === currentPage}
            $far={Math.abs(page - currentPage) >= 2}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </PageBtn>
        ))}

        <Btn
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <NavLabel>Next</NavLabel>
          <FiChevronRight size={14} />
        </Btn>
      </Controls>
    </Bar>
  );
};

export default Pagination;