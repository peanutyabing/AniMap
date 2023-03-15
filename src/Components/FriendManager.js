import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, ref, onValue, update } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, CloseButton, Button } from "react-bootstrap";

export default function FriendManager() {
  const user = useContext(UserContext);
  const [userDatabaseKey, setUserDatabaseKey] = useState();
  const [requests, setRequests] = useState();

  useEffect(() => {}, [user.email]);

  useEffect(() => {
    const requestsRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${userDatabaseKey}`
    );
    onValue(requestsRef, (snapshot) => {
      // setRequests...
    });
  }, []);

  const navigate = useNavigate();
  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>FRIEND REQUESTS</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <div id="friend-requests-container">
          {/* <div className="friend-request">placeholder: lala@abc.com</div>
          <Button>Accept</Button>
          <Button>Decline</Button> */}
        </div>
      </Modal.Body>
    </Modal>
  );
}
