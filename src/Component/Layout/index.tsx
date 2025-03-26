import { Outlet } from "react-router-dom";
import Header from "../Header";
import "./index.scss";

function Layout() {
  return (
    <div className="layout-container">
      <div className="sidebar-container">
        <Header />
      </div>
      <main className="layout-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
