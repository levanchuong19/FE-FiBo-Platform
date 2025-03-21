import { Outlet } from "react-router-dom";
import Header from "../Header";
import "./index.scss";

function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div>
        <Header />
      </div>
      <div className="Layout-Content">
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
