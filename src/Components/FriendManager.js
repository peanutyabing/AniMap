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
        setRequests(userData.val().requestsReceived);
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  const handleAccept = (e) => {
    const receiverRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${userDatabaseKey}`
    );
    updateRequestsReceived(receiverRef, e.target.id);
    updateFriends(receiverRef, e.target.id);
  };

  const updateRequestsReceived = (receiverRef, requestorKey) => {
    const updatedRequest = requests.filter(
      (request) => request.userDatabaseKey === requestorKey
    )[0];
    updatedRequest.status = true;

    const updatedRequests = [
      ...requests.filter((request) => request.userDatabaseKey !== requestorKey),
      updatedRequest,
    ];
    update(receiverRef, {
      requestsReceived: updatedRequests,
    });
  };

  const updateFriends = (receiverRef, requestorKey) => {
    const request = requests.filter(
      (request) => request.userDatabaseKey === requestorKey
    )[0];
    const requestor = { email: request.email };
    const requestorRef = ref(database, `${USERS_DATABASE_KEY}/${requestorKey}`);
    // update(requestorRef, {friends: })

    const receiver = { email: user.email };
  };

  const renderPendingRequests = () => {
    return requests
      .filter((request) => request.status === false)
      .map((request) => (
        <div key={request.email}>
          {request.email}{" "}
          <Button id={request.userDatabaseKey} onClick={handleAccept}>
            Accept
          </Button>
          <Button id={request.userDatabaseKey}>Reject</Button>
        </div>
      ));
  };

  const renderMyFriends = () => {
    if (friends.slice(1).length > 0) {
      return friends.slice(1).map((friend) => <div>{friend.email}</div>);
    } else {
      return <div>You don't have any friends yet!</div>;
    }
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
        <div id="friends-container">{renderMyFriends()}</div>
      </Modal.Body>
    </Modal>
  );
}
