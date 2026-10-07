import styled from "styled-components";

/* Design tokens – same CSS-variable pattern as Pagination.jsx.
   Change the table look for the whole project here. */
const C = {
  border: "var(--color-border, #c8dded)",
  headerBg: "var(--rf-table-header-bg, #f8fafd)",
  headerText: "var(--color-text-secondary, #16213e)",
  text: "var(--color-text-secondary, #16213e)",
  muted: "var(--color-text-muted, #5b6578)",
  hoverBg: "rgba(20, 31, 61, 0.025)",
};

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${C.border};
  border-radius: 4px;
  overflow: hidden;
  font-family: var(--font-family-base, "IBM Plex Sans", system-ui, sans-serif);
`;

/* Horizontal overflow for wide tables */
const Scroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth};
  border-collapse: collapse;
  font-size: 14px;
  color: ${C.text};
`;

const Th = styled.th`
  padding: 20px 18px;
  background: ${C.headerBg};
  color: ${C.headerText};
  font-weight: 700;
  text-align: ${({ $align }) => $align};
  white-space: nowrap;
  border-bottom: 1px solid ${C.border};
  width: ${({ $width }) => $width || "auto"};
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${C.border};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${C.hoverBg};
  }
`;

const Td = styled.td`
  padding: 18px 18px;
  text-align: ${({ $align }) => $align};
  vertical-align: middle;
  overflow-wrap: anywhere;
  white-space: ${({ $nowrap }) => ($nowrap ? "nowrap" : "normal")};
  max-width: ${({ $maxWidth }) => $maxWidth || "none"};
`;

const EmptyCell = styled.td`
  padding: 48px 18px;
  text-align: center;
  color: ${C.muted};
`;

const Table = ({
  columns = [],
  data = [],
  rowKey,
  emptyMessage = "No data available",
  minWidth = "900px",
  onRowClick,
  footer,
}) => {
  const getRowKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    if (typeof rowKey === "string") return row[rowKey];
    return index;
  };

  return (
    <Card>
      <Scroll>
        <StyledTable $minWidth={minWidth}>
          <thead>
            <tr>
              {columns.map((col) => (
                <Th key={col.key} $align={col.align || "left"} $width={col.width}>
                  {col.header}
                </Th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <EmptyCell colSpan={columns.length || 1}>{emptyMessage}</EmptyCell>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <Tr
                  key={getRowKey(row, rowIndex)}
                  $clickable={!!onRowClick}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <Td
                      key={col.key}
                      $align={col.align || "left"}
                      $nowrap={col.nowrap}
                      $maxWidth={col.maxWidth}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </tbody>
        </StyledTable>
      </Scroll>

      {footer}
    </Card>
  );
};

export default Table;
