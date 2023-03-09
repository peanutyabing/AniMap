import { useContext } from "react";
import { UserContext } from "../App";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useLocation, useNavigate } from "react-router-dom";

export default function NavBar(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  let location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" sticky="top">
      <Navbar.Brand href="#top">PLACEHOLDER FOR LOGO</Navbar.Brand>
      {user.email && location !== "/login-signup" && (
        <Nav id="logged-in-nav">
          <NavDropdown
            title={`Welcome, ${user.email}`}
            id="collasible-nav-dropdown"
          >
            {/* Will come back and finish the sign out logic */}
            <NavDropdown.Item onClick="">Sign out</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      )}
      {!user.email && location !== "/login-signup" && (
        <Nav id="signed-out-nav">
          <Nav.Link onClick={() => navigate("/login-signup")}>
            Log in or sign up to post
          </Nav.Link>
        </Nav>
      )}
    </Navbar>
  );
}
