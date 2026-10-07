// src/components/reimbursement/SummaryCards.jsx
import styled from "styled-components";
import { FiFileText, FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2 } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { getSummary, getPendingOutstandingGrouped, formatGroupedAmount } from "../../utils/reimbursementUtils";

const Wrap = styled.div`
  margin-bottom: 20px;
`;


const OutstandingBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, var(--rf-ink) 0%, #1f3252 100%);
  border-radius: var(--rf-radius-md);
  padding: 18px 22px;
  margin-bottom: 14px;
  box-shadow: var(--rf-shadow-sm);
`;

const OutstandingIcon = styled.span`
  width: 44px;
  height: 44px;
  border-radius: var(--rf-radius-sm);
  background: rgba(255, 255, 255, 0.12);
  color: var(--rf-brass, #c9974a);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const OutstandingBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const OutstandingLabel = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
`;

const OutstandingFigure = styled.span`
  font-family: var(--rf-font-serif, inherit);
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  word-break: break-word;
`;

const OutstandingNote = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count || 4}, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const toneColor = {
  ink: "var(--rf-ink)",
  brass: "var(--rf-brass)",
  rust: "var(--rf-rust)",
  green: "var(--rf-green)",
  slate: "var(--rf-slate-light)",
  accent: "var(--rf-brass-dark, #8a5f22)",
};

const Card = styled.div`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  padding: 18px 18px 16px;
  box-shadow: var(--rf-shadow-sm);
  border-left: 3px solid ${({ $tone }) => toneColor[$tone] || "var(--rf-line-strong)"};
`;

// Clickable box that opens the Dashboard page.
const DashCard = styled(Card)`
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--rf-brass, #a9762f);
    box-shadow: var(--rf-shadow-md);
  }

  &:focus-visible {
    outline: 2px solid var(--rf-brass, #a9762f);
    outline-offset: 2px;
  }

  @media (max-width: 1100px) {
    grid-column: 1 / -1;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rf-slate);
`;

const IconWrap = styled.span`
  width: 28px;
  height: 28px;
  border-radius: var(--rf-radius-sm);
  background: var(--rf-paper);
  color: var(--rf-ink-soft);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Figure = styled.div`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--rf-ink);
  line-height: 1.25;
  margin-bottom: 6px;
  word-break: break-word;
`;

const Detail = styled.div`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12.5px;
  color: var(--rf-slate);
`;

const SummaryCards = ({ records = [], onDashboardClick }) => {
  const summary = getSummary(records);

  const outstandingGrouped = getPendingOutstandingGrouped(records);
  const outstandingLabel = formatGroupedAmount(outstandingGrouped);

  const cards = [
    {
      key: "totalInvoices",
      label: "Total Reimbursement",
      figure: summary.totalInvoices,
      detail: "Invoices in current view",
      icon: FiFileText,
      tone: "ink",
    },
    {
      key: "paid",
      label: "Paid Reimbursement",
      figure: summary.paidCount,
      detail: "Fully paid",
      icon: FiCheckCircle,
      tone: "green",
    },
    {
      key: "notPaid",
      label: "Not Paid Reimbursement",
      figure: summary.notPaidCount,
      detail: "Awaiting payment",
      icon: FiClock,
      tone: "brass",
    },
    {
      key: "overdue",
      label: "Overdue Reimbursement",
      figure: summary.overdueCount,
      detail: "Past the due date",
      icon: FiAlertTriangle,
      tone: "rust",
    },
  ];

  return (
    <Wrap>
      <OutstandingBanner>
        <OutstandingIcon>
          <FaRupeeSign size={20}/>
        </OutstandingIcon>
        <OutstandingBody>
          <OutstandingLabel>Total Outstanding Fees</OutstandingLabel>
          <OutstandingFigure>{outstandingLabel}</OutstandingFigure>
          <OutstandingNote>Sum of pending amounts across not-paid invoices in the current view</OutstandingNote>
        </OutstandingBody>
      </OutstandingBanner>

      <Grid $count={onDashboardClick ? 5 : 4}>
        {cards.map(({ key, label, figure, detail, icon: Icon, tone }) => (
          <Card $tone={tone} key={key}>
            <CardTop>
              <Label>{label}</Label>
              <IconWrap>
                <Icon size={16} />
              </IconWrap>
            </CardTop>
            <Figure>{figure}</Figure>
            <Detail>{detail}</Detail>
          </Card>
        ))}

        {onDashboardClick && (
          <DashCard
            as="button"
            type="button"
            $tone="accent"
            onClick={onDashboardClick}
            aria-label="Open Dashboard"
          >
            <CardTop>
              <Label>Dashboard</Label>
              <IconWrap>
                <FiBarChart2 size={16} />
              </IconWrap>
            </CardTop>
            <Figure>View Charts</Figure>
            <Detail>Amount &amp; due date distribution</Detail>
          </DashCard>
        )}
      </Grid>
    </Wrap>
  );
};

export default SummaryCards;