import { useContext } from "react";
import { UserContext } from "../App";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../Icons/AniMap-2.png";
import { Button } from "react-bootstrap";

export default function NavBar(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  let location = useLocation();

  return (
    <Navbar bg="light" variant="light" sticky="top">
      <Navbar.Brand>
        <img src={logo} alt="ANIMAP" id="logo" />
      </Navbar.Brand>
      {user.email && location !== "/login-signup" && (
        <Nav id="logged-in-nav">
          <NavDropdown
            title={`Welcome, ${user.email.split("@")[0]}!`}
            id="collasible-nav-dropdown"
          >
            <NavDropdown.Item>Friend requests</NavDropdown.Item>
            <NavDropdown.Item
              onClick={() => {
                navigate("friend-finder");
              }}
            >
              Find friends
            </NavDropdown.Item>

            <NavDropdown.Item onClick={props.signOutUser}>
              Sign out
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link onClick={() => navigate("post-form")}>Posts</Nav.Link>
          <Nav.Link
            onClick={() => {
              navigate("q");
            }}
          >
            Posts Filter
          </Nav.Link>
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
