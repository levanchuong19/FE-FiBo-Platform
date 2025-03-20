import { Outlet } from "react-router-dom";
// import Header from "../Header";
// import Header from "../Header";
// import Footer from "../Footer";

function Layout() {
  return (
    <div>
      {/* <Header /> */}
      {/* <main style={{ paddingTop: "80px" }}> */}
      <Outlet />
      {/* </main> */}
      {/* <Footer /> */}
    </div>
  );
}

export default Layout;
