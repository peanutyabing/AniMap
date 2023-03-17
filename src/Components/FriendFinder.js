import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, ref, set } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, Form, CloseButton, Button } from "react-bootstrap";

export default function FriendFinder(props) {
  const user = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.email) {
      navigate("../login-signup");
    }
  });

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (data) => {
      if (!users.map((user) => user.userDatabaseKey).includes(data.key)) {
        setUsers((users) => [
          ...users,
          {
            userDatabaseKey: data.key,
            email: data.val().email,
            friended: Object.values(data.val().friends)
              .map((friend) => friend.email)
              .includes(user.email),
            requested:
              Object.values(data.val().requestsReceived)
                .map((req) => req.email)
                .includes(user.email) ||
              Object.values(data.val().requestsSent)
                .map((req) => req.email)
                .includes(user.email),
          },
        ]);
      }
    });
  }, [user.email]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let results = users.filter(
      (eachUser) =>
        eachUser.email.includes(searchTerm) && eachUser.email !== user.email
    );
    setSearchResults(results);
    setSearchTerm("");
  };

  const sendFriendRequest = (e) => {
    const requestsReceivedRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${e.target.id}/requestsReceived/${props.userDatabaseKey}`
    );
    set(requestsReceivedRef, {
      email: user.email,
      status: false,
    });

    const requestsSentRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${props.userDatabaseKey}/requestsSent/${e.target.id}`
    );
    set(requestsSentRef, {
      email: searchResults.filter(
        (result) => result.userDatabaseKey === e.target.id
      )[0].email,
      status: false,
    });
    updateSearchResults(e);
  };

  const updateSearchResults = (e) => {
    const searchResultsToUpdate = [...searchResults];
    for (const result of searchResultsToUpdate) {
      if (result.userDatabaseKey === e.target.id) {
        result.requested = true;
        break;
      }
    }
    setSearchResults(searchResultsToUpdate);
  };

  const renderSearchResults = () => {
    return searchResults.map((result) => (
      <div key={result.userDatabaseKey} className="search-result">
        <div className="search-result-email">{result.email}</div>
        {renderFriendRequestBtn(result)}
      </div>
    ));
  };

  const renderFriendRequestBtn = (searchResult) => {
    if (searchResult.friended) {
      return (
        <Button
          className="friend-btn"
          variant="success"
          size="sm"
          disabled={true}
        >
          Friends
        </Button>
      );
    } else if (searchResult.requested) {
      return (
        <Button
          className="friend-btn"
          variant="success"
          size="sm"
          disabled={true}
        >
          Request pending
        </Button>
      );
    } else {
      return (
        <Button
          className="friend-btn"
          variant="success"
          size="sm"
          id={searchResult.userDatabaseKey}
          onClick={sendFriendRequest}
        >
          Add friend
        </Button>
      );
    }
  };

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Find Friends</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <div id="friend-search-container">
          <Form className="friend-search-form" onSubmit={handleSubmit}>
            <Form.Group className="friend-search-input">
              <Form.Control
                name="friend-search-term"
                type="text"
                value={searchTerm}
                placeholder={"Search with name or email"}
                onChange={handleChange}
                autoFocus
              />
              <Button variant="secondary" type="submit" onClick={null}>
                Search
              </Button>
            </Form.Group>
          </Form>
          <div className="grey-italics">
            {searchResults.length}{" "}
            {searchResults.length > 1 ? "users found" : "user found"}
          </div>
          <div className="search-results">{renderSearchResults()}</div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
