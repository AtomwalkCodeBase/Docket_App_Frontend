import { useEffect, useState } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/reimbursement/tokens.css";

const SIDEBAR_STORAGE_KEY = "rf.sidebar.collapsed";

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--rf-paper);
`;

const ShellMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const ShellContent = styled.main`
  flex: 1;

`;

const DashboardLayout = ({ activeNav, pageTitle, breadcrumb, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
    }
  }, [collapsed]);

  const handleToggleSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;
    if (isDesktop) {
      setCollapsed((value) => !value);
    } else {
      setMobileSidebarOpen((open) => !open);
    }
  };

  const handleCollapseSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;
    if (!isDesktop) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "1");
    } catch {
    }
    setCollapsed(true);
  };

  return (
    <Shell className="rf-module">
      <Sidebar
        activeNav={activeNav}
        collapsed={collapsed}
        onExpand={() => setCollapsed(false)}
        onCollapse={handleCollapseSidebar}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <ShellMain>
        <Topbar
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          sidebarCollapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <ShellContent>{children}</ShellContent>
      </ShellMain>
    </Shell>
  );
};

export default DashboardLayout;