import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { onChildAdded, onChildChanged, ref, update } from "firebase/database";
import { UserContext } from "../App.js";
import { Modal, CloseButton, Button, ButtonGroup } from "react-bootstrap";

export default function FriendManager() {
  const user = useContext(UserContext);
  const [requests, setRequests] = useState({});
  const [friends, setFriends] = useState({});

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
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildChanged(usersRef, (userData) => {
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

  const handleReject = (e) => {
    let message =
      "Are you sure? The requestor will not be notified that you rejected their friend request.";
    if (window.confirm(message) === true) {
      updateRequestReceived(e, { [e.target.id]: null });
      updateRequestSent(e, { [user.userDatabaseKey]: null });

      const requestToUpdate = { ...requests };
      delete requestToUpdate[e.target.id];
      setRequests(requestToUpdate);
    }
  };

  const handleUnfriend = (e) => {
    let message =
      "Are you sure? Your friend will not be notified that you unfriended them.";
    if (window.confirm(message) === true) {
      updateRequestReceived(e, { [e.target.id]: null });
      updateRequestSent(e, { [user.userDatabaseKey]: null });
      updateFriends(e, null, null);

      const friendsToUpdate = { ...friends };
      delete friendsToUpdate[e.target.id];
      setFriends(friendsToUpdate);
    }
  };

  const handleAccept = (e) => {
    const updatedRequestReceived = {
      [e.target.id]: {
        email: requests[e.target.id].email,
        status: true,
      },
    };
    updateRequestReceived(e, updatedRequestReceived);

    const updatedRequestSent = {
      [user.userDatabaseKey]: { email: user.email, status: true },
    };
    updateRequestSent(e, updatedRequestSent);

    const requestToUpdate = { ...requests };
    requestToUpdate[e.target.id].status = true;
    setRequests(requestToUpdate);

    const receiverData = { email: requests[e.target.id].email };
    const requestorData = { email: user.email };
    updateFriends(e, receiverData, requestorData);

    const friendsToUpdate = { ...friends };
    friendsToUpdate[e.target.id] = { email: requests[e.target.id].email };
    setFriends(friendsToUpdate);
  };

  const updateRequestReceived = (e, data) => {
    const requestsReceivedRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${user.userDatabaseKey}/requestsReceived`
    );
    update(requestsReceivedRef, data);
  };

  const updateRequestSent = (e, data) => {
    const requestsSentRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${e.target.id}/requestsSent`
    );
    update(requestsSentRef, data);
  };

  const updateFriends = (e, receiverData, requestorData) => {
    const receiverFriendRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${user.userDatabaseKey}/friends/`
    );
    update(receiverFriendRef, { [e.target.id]: receiverData });

    const requestorFriendRef = ref(
      database,
      `${USERS_DATABASE_KEY}/${e.target.id}/friends/`
    );
    update(requestorFriendRef, { [user.userDatabaseKey]: requestorData });
  };

  const renderPendingRequests = () => {
    const pendingRequestsRender = [];
    for (const key in requests) {
      if (requests[key].status === false) {
        pendingRequestsRender.push(
          <div key={key} className="friend">
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
              <Button
                id={key}
                variant="danger"
                size="sm"
                onClick={handleReject}
              >
                Reject
              </Button>
            </ButtonGroup>
          </div>
        );
      }
    }
    if (pendingRequestsRender.length) {
      return pendingRequestsRender;
    } else {
      return (
        <div className="grey-italics">
          No pending friend requests at the moment
        </div>
      );
    }
  };

  const renderMyFriends = () => {
    if (Object.keys(friends).length > 1) {
      const friendsRender = [];
      for (const key in friends) {
        if (friends[key].email !== "") {
          friendsRender.push(
            <div className="friend" key={friends[key].email}>
              <div>{friends[key].email}</div>
              <Button
                id={key}
                variant="danger"
                size="sm"
                onClick={handleUnfriend}
              >
                Unfriend
              </Button>
            </div>
          );
        }
      }
      return friendsRender;
    } else {
      return (
        <div className="grey-italics">You don't have any friends yet!</div>
      );
    }
  };

  const navigate = useNavigate();
  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Friends</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <div className="friends-container" id="friend-requests">
          {renderPendingRequests()}
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
