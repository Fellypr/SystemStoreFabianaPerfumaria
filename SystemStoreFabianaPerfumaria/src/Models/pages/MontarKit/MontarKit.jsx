import React from "react";
import { Link } from "react-router-dom";
import "../../../components/Navbar/Navbar.css";
import KitBuilder from "../../../components/KitBuilder/KitBuilder";
function MontarKit() {
  return (
    <div>
      <nav className="navBar">
        <Link to={"/"}>
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>Fabiana Perfumaria</h1>
      </nav>
      <section className="montar-kit-section" style={{ padding: "20px" }}>
        <KitBuilder />
      </section>
    </div>
  );
}

export default MontarKit;
