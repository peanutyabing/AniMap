import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, ref, onValue, update } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, CloseButton, Button } from "react-bootstrap";

export default function FriendManager() {
  const user = useContext(UserContext);
  const [userDatabaseKey, setUserDatabaseKey] = useState("");
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setUserDatabaseKey(userData.key);
        setRequests(userData.val().requestsReceived.slice(1));
        setFriends(userData.val().friends.slice(1));
      }
    });
  }, [user.email]);

  const renderPendingRequests = () => {
    const pendingRequests = requests.filter(
      (request) => request.status === false
    );
    return pendingRequests.map((request) => (
      <div>
        {request.email} <Button>Accept</Button>
      </div>
    ));
  };

  const navigate = useNavigate();
  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>FRIEND REQUESTS</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <div id="friend-requests-container">{renderPendingRequests()}</div>
      </Modal.Body>
    </Modal>
  );
}
