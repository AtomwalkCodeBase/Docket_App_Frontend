import { useState } from "react";
import styled, { css } from "styled-components";
import {FiTrendingUp,FiFileText,FiCreditCard,FiChevronDown,FiChevronRight} from "react-icons/fi";

const EXPANDED_WIDTH = "255px";
const COLLAPSED_WIDTH = "0px";

const Scrim = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: ${({ $show }) => ($show ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(10, 18, 38, 0.5);
    backdrop-filter: blur(2px);
    z-index: 50;
  }
`;

const Aside = styled.aside`
  width: ${({ $collapsed }) =>
    $collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH};

  flex-shrink: 0;
  background: #141f3d;
  color: #f3f5fa;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  transition: width 0.2s ease;
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.04);
  @media (max-width: 900px) {
    width: ${EXPANDED_WIDTH};
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(
      ${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")}
    );
    transition: transform 0.22s ease;
    z-index: 60;
    box-shadow: 8px 0 30px rgba(0, 0, 0, 0.2);
  }
`;

const Brand = styled.div`
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $collapsed }) =>
    $collapsed ? "15px 10px" : "10px 10px"};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;
const Logo = styled.img`
  height: 45px;
    width: 100px;
    margin-right: 10px;
    border-radius: 10px;
    
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
  white-space: nowrap;
`;

const BrandName = styled.span`
  font-family: var(
    --rf-font-sans,
    "IBM Plex Sans",
    system-ui,
    sans-serif
  );

  font-weight: 650;
  font-size: 15px;
  color: #ffffff;
  letter-spacing: -0.1px;
`;

const BrandSub = styled.span`
  margin-top: 3px;
  font-family: var(
    --rf-font-sans,
    "IBM Plex Sans",
    system-ui,
    sans-serif
  );

  font-size: 12px;
  color: #aeb7cd;
  font-weight: 400;
`;



const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 10px;
  }
`;

const itemBase = css`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 10px 13px;
  border-radius: 9px;
  background: transparent;
  border: none;
  color: #aeb7cd;
  font-family: var(
    --rf-font-sans,
    "IBM Plex Sans",
    system-ui,
    sans-serif
  );
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;



const NavParent = styled.button`
  ${itemBase}
  color: #f0f2f7;
  position: relative;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #ffffff;
  }

  svg:last-child {
    margin-left: auto;
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      justify-content: center;
      padding: 10px;
      svg:last-child {
        display: none;
      }
    `}

  ${({ $active, $collapsed }) =>
    $active &&
    $collapsed &&
    css`
      color: #d5a03a;
      background: rgba(201, 147, 47, 0.1);
      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        border-radius: 4px;
        background: #d5a03a;
      }
    `}
`;

const Submenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 18px;
  padding: 6px 0 8px 17px;
  border-left: 1px solid rgba(255, 255, 255, 0.13);
`;

const Subitem = styled.a`
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 42px;
  padding: 9px 13px;
  border-radius: 9px;
  font-family: var(
    --rf-font-sans,
    "IBM Plex Sans",
    system-ui,
    sans-serif
  );
  font-size: 14px;
  font-weight: 500;
  color: #b4bdd1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  svg {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    color: currentColor;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.07);

    color: #ffffff;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: #f1e4cc;
      color: #171717 !important;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      span {
        color: #171717 !important;
      }
      svg {
        color: #171717 !important;
      }
      &:hover {
        background: #f1e4cc;
        color: #171717 !important;
      }
    `}
`;



const Sidebar = ({
  activeNav = "reimbursement-fees",
  collapsed = false,
  onExpand,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [docketOpen, setDocketOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(true);

  const isDocketActive = activeNav === "docket-process";
  const isReimbursementActive = activeNav === "reimbursement-fees";
  const isAccountStatementsActive = activeNav === "account-statements";

  const handleDocketClick = () => {
    if (collapsed) {
      onExpand?.();

      setDocketOpen(true);

      return;
    }

    setDocketOpen((open) => !open);
  };

  const handleSalesClick = () => {
    if (collapsed) {
      onExpand?.();

      setSalesOpen(true);

      return;
    }

    setSalesOpen((open) => !open);
  };

  return (
    <>
      <Scrim $show={mobileOpen} onClick={onCloseMobile} />

      <Aside $collapsed={collapsed} $mobileOpen={mobileOpen} >


        <Brand $collapsed={collapsed}>
          <Logo src="/docket/Atom_walk_logo.jpg" alt="Company Logo" />

          {!collapsed && (
            <BrandText>
              <BrandName>Docket</BrandName>
              <BrandSub>Sales Operations</BrandSub>
            </BrandText>
          )}
        </Brand>

        <Nav aria-label="Primary navigation">

          <div>
            <NavParent
              type="button"
              $collapsed={collapsed}
              $active={isDocketActive}
              onClick={handleDocketClick}
              aria-expanded={ docketOpen && !collapsed}
              title={ collapsed ? "Docket" : undefined } >
              <FiTrendingUp size={18} />
              {!collapsed && (<span>Docket</span> )}

              {!collapsed &&
                (docketOpen ? ( <FiChevronDown size={16} /> ) : (<FiChevronRight size={16} />
                ))}
            </NavParent>

            {/* Docket submenu */}

            {!collapsed && docketOpen && (
              <Submenu>
                <Subitem href="/docket/document-management" $active={isDocketActive}>
                  <FiFileText size={17} />
                  <span>Docket Process</span>
                </Subitem>
              </Submenu>
            )}
          </div>


          <div>
            <NavParent
              type="button"
              $collapsed={collapsed}
              $active={isReimbursementActive || isAccountStatementsActive}
              onClick={handleSalesClick}
              aria-expanded={ salesOpen && !collapsed }
              title={ collapsed ? "Sales" : undefined } >
              <FiTrendingUp size={18} />

              {!collapsed && (<span>Sales</span>)}
              {!collapsed &&
                (salesOpen ? ( <FiChevronDown size={16} />
                ) : ( <FiChevronRight size={16} />            
                ))}
            </NavParent>

            {/* Sales submenu */}

            {!collapsed && salesOpen && (
              <Submenu>
                <Subitem href="/docket/reimbursement-fees" $active={isReimbursementActive}>
                  <FiFileText size={17} />
                  <span>Reimbursement Fees</span>
                </Subitem>
                <Subitem
                  href="/docket/account-statements"
                  $active={isAccountStatementsActive}>               
                  <FiCreditCard size={17} />
                  <span>Account Statements</span>
                </Subitem>
              </Submenu>
            )}
          </div>
        </Nav>
      </Aside>
    </>
  );
};

export default Sidebar;