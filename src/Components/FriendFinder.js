import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, ref, onValue, update } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, Form, CloseButton, Button } from "react-bootstrap";

export default function FriendFinder() {
  const user = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (data) => {
      if (!users.map((user) => user.id).includes(data.key)) {
        setUsers((users) => [
          ...users,
          {
            id: data.key,
            email: data.val().email,
            friended: data
              .val()
              .friends.map((friend) => friend.email)
              .includes(user.email),
            requested: data
              .val()
              .requestsReceived.map((req) => req.email)
              .includes(user.email),
          },
        ]);
      }
    });
  }, []);

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
    const userRef = ref(database, `${USERS_DATABASE_KEY}/${e.target.id}`);
    onValue(
      userRef,
      (snapshot) => {
        let existingRequests = snapshot.val().requestsReceived;
        update(userRef, {
          requestsReceived: [
            ...existingRequests,
            {
              email: user.email,
              status: false,
            },
          ],
        });
      },
      { onlyOnce: true }
    );
    updateSearchResults(e);
  };

  const updateSearchResults = (e) => {
    const searchResultsToUpdate = [...searchResults];
    for (const result of searchResultsToUpdate) {
      if (result.id === e.target.id) {
        result.requested = true;
        break;
      }
    }
    setSearchResults(searchResultsToUpdate);
  };

  const renderSearchResults = () => {
    return searchResults.map((result) => (
      <div key={result.id} className="search-result">
        <div className="search-result-email">{result.email}</div>
        {renderFriendRequestBtn(result)}
      </div>
    ));
  };

  const renderFriendRequestBtn = (searchResult) => {
    if (searchResult.friended) {
      return (
        <Button variant="secondary" size="sm" disabled={true}>
          Friends
        </Button>
      );
    } else if (searchResult.requested) {
      return (
        <Button variant="secondary" size="sm" disabled={true}>
          Request pending
        </Button>
      );
    } else {
      return (
        <Button
          variant="secondary"
          size="sm"
          id={searchResult.id}
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
        <Modal.Title>FIND FRIENDS</Modal.Title>
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
              <Button variant="primary" type="submit" onClick={null}>
                Search
              </Button>
            </Form.Group>
          </Form>
          <div id="results-found">
            {searchResults.length}{" "}
            {searchResults.length > 1 ? "users found" : "user found"}
          </div>
          <div className="search-results">{renderSearchResults()}</div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
