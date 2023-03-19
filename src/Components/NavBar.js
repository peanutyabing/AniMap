import { useState, useContext, useEffect } from "react";
import { UserContext } from "../App.js";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../Icons/AniMap-2.png";
import { database, auth } from "../Firebase.js";
import { ref, onValue } from "firebase/database";
import { USERS_DATABASE_KEY } from "../App.js";

export default function NavBar(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  let location = useLocation();

  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (user.userDatabaseKey) {
      const userRef = ref(
        database,
        `${USERS_DATABASE_KEY}/${user.userDatabaseKey}`
      );
      onValue(userRef, (snapshot) => {
        if (snapshot.val().requestsReceived) {
          setPendingRequests(
            Object.values(snapshot.val().requestsReceived).filter(
              (req) => req.status === false
            )
          );
        }
      });
    }
  }, [user]);

  const renderUserAvatar = () => {
    if (auth.currentUser && auth.currentUser.photoURL) {
      return (
        <div className="avatar">
          <img src={auth.currentUser.photoURL} alt="avatar" />
        </div>
      );
    }
  };

  return (
    <Navbar bg="light" variant="light" sticky="top">
      <Navbar.Brand>
        <img src={logo} alt="ANIMAP" id="logo" />
      </Navbar.Brand>
      {user.email && location !== "/login-signup" && (
        <Nav id="logged-in-nav">
          <NavDropdown title="Account" id="collasible-nav-dropdown">
            <NavDropdown.Header className="flex-header">
              <div className="greeting grey-smaller">
                Welcome, <br />
                {`${user.email.split("@")[0]}!`}
              </div>
              {renderUserAvatar()}
            </NavDropdown.Header>
            <NavDropdown.Divider />
            <NavDropdown.Item
              onClick={() => {
                navigate("friend-manager");
              }}
            >
              <div>My friends</div>
              {pendingRequests.length > 0 ? (
                <div className="num-of-requests" id="pending-requests">
                  {pendingRequests.length}
                </div>
              ) : (
                <span className="num-of-requests" id="no-pending-requests">
                  0
                </span>
              )}
            </NavDropdown.Item>
            <NavDropdown.Item
              onClick={() => {
                navigate("friend-finder");
              }}
            >
              Find friends
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("choose-avatar")}>
              Choose avatar
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("reset-password")}>
              Reset password
            </NavDropdown.Item>
            <NavDropdown.Item onClick={props.signOutUser}>
              Sign out
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link onClick={() => navigate("post-form")}>Post</Nav.Link>
          <Nav.Link
            onClick={() => {
              navigate("q");
            }}
          >
            Filter
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
