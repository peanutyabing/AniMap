import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, ref, set, update } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, CloseButton, Button, ButtonGroup } from "react-bootstrap";

export default function FriendManager(props) {
  const user = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setRequests(userData.val().requestsReceived);
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  useEffect(() => {
    renderPendingRequests();
  }, [requests]);

  useEffect(() => {
    renderMyFriends();
  }, [friends]);

  const handleAccept = (e) => {
    updateRequestReceived(e);
    updateRequestSent(e);
    const requestToUpdate = { ...requests };
    requestToUpdate[e.target.id].status = true;
    setRequests(requestToUpdate);

    updateFriends(e);
    const friendsToUpdate = { ...friends };
    friendsToUpdate[e.target.id] = { email: requests[e.target.id].email };
    setFriends(friendsToUpdate);
  };

  const updateRequestReceived = (e) => {
    const requestReceivedRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${props.userDatabaseKey}/requestsReceived/${e.target.id}`
    );
    update(requestReceivedRef, {
      email: requests[e.target.id].email,
      status: true,
    });
  };

  const updateRequestSent = (e) => {
    const requestSentRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${e.target.id}/requestsSent/${props.userDatabaseKey}`
    );
    update(requestSentRef, { email: user.email, status: true });
  };

  const updateFriends = (e) => {
    const receiverNewFriendRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${props.userDatabaseKey}/friends/${e.target.id}`
    );
    set(receiverNewFriendRef, { email: requests[e.target.id].email });

    const requestorNewFriendRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${e.target.id}/friends/${props.userDatabaseKey}`
    );
    set(requestorNewFriendRef, { email: user.email });
  };

  const renderPendingRequests = () => {
    const requestsRender = [];
    for (const key in requests) {
      if (requests[key].status === false) {
        requestsRender.push(
          <div key={key} className="friend-request">
            {requests[key].email}
            <ButtonGroup>
              <Button
                id={key}
                variant="success"
                size="sm"
                onClick={handleAccept}
              >
                Accept
              </Button>
              <Button id={key} variant="danger" size="sm" disabled={true}>
                Reject
              </Button>
            </ButtonGroup>
          </div>
        );
      }
    }
    return requestsRender;
  };

  const renderMyFriends = () => {
    if (Object.values(friends).length > 1) {
      return Object.values(friends).map((friend) => (
        <div key={friend.email}>{friend.email}</div>
      ));
    } else {
      return <div>You don't have any friends yet!</div>;
    }
  };

  const navigate = useNavigate();
  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>FRIENDS</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <div className="friends-container" id="friend-requests">
          {renderPendingRequests().length > 0 ? (
            <>
              <div className="header">Pending requests:</div>
              {renderPendingRequests()}
            </>
          ) : (
            <div className="grey-italics">
              No pending friend requests at the moment
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Body>
        <div className="friends-container" id="my-friends">
          <div className="header">My friends:</div>
          {renderMyFriends()}
        </div>
      </Modal.Body>
    </Modal>
  );
}
