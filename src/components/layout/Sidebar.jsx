import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  FiTrendingUp,
  FiFileText,
  FiCreditCard,
  FiDollarSign,
  FiBarChart2,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext"; 

const EXPANDED_WIDTH = "255px";
const COLLAPSED_WIDTH = "0px";


const menuSections = [
  {
    id: "docket",
    label: "Docket",
    icon: FiTrendingUp,
    items: [
      {
        label: "Docket Process",
        path: "/document-management",
        icon: FiFileText,
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: FiBarChart2,
    items: [
      {
        label: "Reimbursement Fees",
        path: "/reimbursement-fees",
        icon: FiDollarSign,
      },
      {
        label: "Account Statements",
        path: "/account-statements",
        icon: FiCreditCard,
      },
    ],
  },
];


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
  padding: ${({ $collapsed }) => ($collapsed ? "15px 10px" : "10px 10px")};
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
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-weight: 650;
  font-size: 15px;
  color: #ffffff;
  letter-spacing: -0.1px;
`;

const BrandSub = styled.span`
  margin-top: 3px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
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
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
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

const Subitem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 42px;
  padding: 9px 13px;
  border-radius: 9px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
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

const UserFooter = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "space-between"};
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

const UserAvatar = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #d5a03a;
  color: #171717;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  text-transform: uppercase;
`;

const UserName = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 500;
  color: #f0f2f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #aeb7cd;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #d5a03a;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Same source the Topbar uses for the logged-in user's name.
const getUsername = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("seaUser") || "{}");
    return userData.username || "";
  } catch {
    return "";
  }
};

const isItemActive = (item, pathname) => pathname === item.path;

const isSectionActive = (section, pathname) =>
  section.items.some((item) => isItemActive(item, pathname));

const Sidebar = ({
  collapsed = false,
  onExpand,
  onCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Every section starts open; state is keyed by section id.
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(menuSections.map((section) => [section.id, true]))
  );

  // Make sure the section holding the current route is open after navigation.
  useEffect(() => {
    const active = menuSections.find((section) =>
      isSectionActive(section, location.pathname)
    );
    if (active) {
      setOpenSections((prev) =>
        prev[active.id] ? prev : { ...prev, [active.id]: true }
      );
    }
  }, [location.pathname]);

  const handleSectionClick = (sectionId) => {
    if (collapsed) {
      onExpand?.();
      setOpenSections((prev) => ({ ...prev, [sectionId]: true }));
      return;
    }
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleItemClick = () => {
    onCloseMobile?.();
    onCollapse?.();
  };

  const userName = getUsername();

  return (
    <>
      <Scrim $show={mobileOpen} onClick={onCloseMobile} />

      <Aside $collapsed={collapsed} $mobileOpen={mobileOpen}>
        <Brand $collapsed={collapsed}>
          <Logo src="/docket/Atom_walk_logo.jpg" alt="Company Logo" />

          {!collapsed && (
            <BrandText>
              <BrandName>Docket</BrandName>
              <BrandSub>Office Management</BrandSub>
            </BrandText>
          )}
        </Brand>

        <Nav aria-label="Primary navigation">
          {menuSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpen = !!openSections[section.id];
            const sectionActive = isSectionActive(section, location.pathname);

            return (
              <div key={section.id}>
                <NavParent
                  type="button"
                  $collapsed={collapsed}
                  $active={sectionActive}
                  onClick={() => handleSectionClick(section.id)}
                  aria-expanded={isOpen && !collapsed}
                  title={collapsed ? section.label : undefined}
                >
                  <SectionIcon size={18} />
                  {!collapsed && <span>{section.label}</span>}
                  {!collapsed &&
                    (isOpen ? (
                      <FiChevronDown size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    ))}
                </NavParent>

                {!collapsed && isOpen && (
                  <Submenu>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Subitem
                          key={item.path}
                          to={item.path}
                          $active={isItemActive(item, location.pathname)}
                          onClick={handleItemClick}
                        >
                          <ItemIcon size={17} />
                          <span>{item.label}</span>
                        </Subitem>
                      );
                    })}
                  </Submenu>
                )}
              </div>
            );
          })}
        </Nav>

        <UserFooter $collapsed={collapsed}>
          {!collapsed && (
            <UserInfo>
              <UserAvatar>{userName.charAt(0) || "U"}</UserAvatar>
              <UserName title={userName}>{userName}</UserName>
            </UserInfo>
          )}
          <LogoutButton type="button" onClick={logout} title="Logout">
            <FiLogOut />
          </LogoutButton>
        </UserFooter>
      </Aside>
    </>
  );
};

export default Sidebar;