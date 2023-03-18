import { useState, useEffect, useContext } from "react";
import { database } from "../Firebase.js";
import {
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  push,
  set,
  update,
} from "firebase/database";
import { USERS_DATABASE_KEY } from "../App.js";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../App.js";
import { Modal, ButtonGroup, Button, CloseButton, Form } from "react-bootstrap";
import Geocode from "react-geocode";
import userAvatar from "../Icons/user-avatar-bear.png";

const POSTS_DATABASE_KEY = "posts";
const COMMENTS_DATABASE_KEY = "comments";

export default function Post(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  let location = useLocation();
  let postId = location.pathname.split("/").slice(-1);

  const [publicPost, setPublicPost] = useState(false);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [address, setAddress] = useState(null);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [encounter, setEncounter] = useState("");
  const [reactions, setReactions] = useState({});
  const [postComments, setPostComments] = useState({});
  const [editComment, setEditComment] = useState(false);
  const [editCommentKey, setEditCommentKey] = useState("");
  const [commentSectionLen, setCommentSectionLen] = useState(5);
  const [friends, setFriends] = useState({});

  useEffect(() => {
    const postRef = ref(database, `${POSTS_DATABASE_KEY}/${postId}`);
    onValue(postRef, (snapshot) => {
      setPublicPost(snapshot.val().public === "true");
      setLng(snapshot.val().location.lng);
      setLat(snapshot.val().location.lat);
      setContent(snapshot.val().content);
      setUrl(snapshot.val().url);
      setDate(snapshot.val().date);
      setAuthorEmail(snapshot.val().authorEmail);
      setEncounter(snapshot.val().encounter);
      setReactions(snapshot.val().reactions);
      setPostComments(snapshot.val().comments);
    });
  }, []);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildChanged(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  useEffect(() => {
    if (lat || lng) {
      Geocode.fromLatLng(lat, lng).then(
        (response) => {
          setAddress(response.results[0].formatted_address);
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }, [lat, lng]);

  const writeData = () => {
    const commentDate = new Date().toLocaleString();
    const postsCommentsRef = ref(
      database,
      `${POSTS_DATABASE_KEY}/${postId}/${COMMENTS_DATABASE_KEY}`
    );
    const newCommentRef = push(postsCommentsRef);
    set(newCommentRef, {
      userComment: comment,
      userCommentDate: commentDate,
      user: user.email,
    });
  };

  const handleReaction = (e) => {
    let emotion = e.target.name;
    const reactionsToUpdate = { ...reactions };
    const reactedUsers = reactionsToUpdate[emotion];
    if (!reactedUsers.includes(user.email)) {
      reactionsToUpdate[emotion] = [...reactedUsers, user.email];
    } else {
      reactionsToUpdate[emotion] = reactedUsers.filter(
        (userEmail) => userEmail !== user.email
      );
    }
    const postRef = ref(database, `${POSTS_DATABASE_KEY}/${postId}`);
    update(postRef, { reactions: reactionsToUpdate });
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    writeData();
    setComment("");
  };

  const handleEdit = (e) => {
    let commentKey = e.target.id;
    if (user.email === postComments[commentKey].user) {
      setComment(postComments[commentKey].userComment);
      setEditComment(true);
      setEditCommentKey(commentKey);
    }
  };

  const handleEditComment = (e) => {
    e.preventDefault();
    const editDate = new Date().toLocaleString();
    const edited = "edited";
    const postsCommentsRef = ref(
      database,
      `${POSTS_DATABASE_KEY}/${postId}/${COMMENTS_DATABASE_KEY}/${editCommentKey}`
    );
    update(postsCommentsRef, {
      status: edited,
      user: user.email,
      userComment: comment,
      userCommentDate: editDate,
    });
    setEditComment(false);
    setComment("");
    setEditCommentKey("");
  };

  const hasViewAccess = () => {
    return (
      publicPost ||
      Object.values(friends)
        .map((friend) => friend.email)
        .includes(authorEmail) ||
      user.email === authorEmail
    );
  };

  const renderLocation = () => {
    if (hasViewAccess()) {
      return address ? (
        <div className="grey-smaller bold">📍 {address}</div>
      ) : (
        <div>Loading location...</div>
      );
    } else {
      return (
        <div className="grey-smaller bold">
          📍 Location is only available to friends
        </div>
      );
    }
  };

  const renderImage = () => {
    if (hasViewAccess()) {
      return (
        <div className="post-image">
          <img src={url} alt={content} />
        </div>
      );
    } else {
      return (
        <div className="post-image fade-off">
          <img src={url} alt={content} />
          <div
            className="grey-smaller prevent-select text-overlay cursor-pointer"
            onClick={() => {
              navigate("../friend-finder");
            }}
          >
            Become {authorEmail}'s friend to view this post!
          </div>
        </div>
      );
    }
  };

  const renderReactionButtons = () => {
    if (!hasViewAccess()) return;
    if (reactions.love && reactions.funny && reactions.shook && reactions.sad) {
      return (
        <ButtonGroup>
          <Button
            name="love"
            variant={reactions.love.includes(user.email) ? "dark" : "light"}
            onClick={handleReaction}
            disabled={!user.email}
          >
            😍 {reactions.love.length - 1}
          </Button>
          <Button
            name="funny"
            variant={reactions.funny.includes(user.email) ? "dark" : "light"}
            onClick={handleReaction}
            disabled={!user.email}
          >
            🤣 {reactions.funny.length - 1}
          </Button>
          <Button
            name="shook"
            variant={reactions.shook.includes(user.email) ? "dark" : "light"}
            onClick={handleReaction}
            disabled={!user.email}
          >
            😱 {reactions.shook.length - 1}
          </Button>
          <Button
            name="sad"
            variant={reactions.sad.includes(user.email) ? "dark" : "light"}
            onClick={handleReaction}
            disabled={!user.email}
          >
            😢 {reactions.sad.length - 1}
          </Button>
        </ButtonGroup>
      );
    }
  };

  const renderComments = (len = 5) => {
    if (!hasViewAccess()) return;
    let comments = [];
    if (postComments) {
      Object.keys(postComments)
        .reverse()
        .forEach((commentKey) => {
          comments = [
            ...comments,
            <div className="post-comment" key={commentKey}>
              <div className="post-comment-data">
                <div className="user-comment">
                  {postComments[commentKey].userComment}
                </div>
                <div className="info-status">
                  <div className="comment-info smallest">
                    {postComments[commentKey].user}{" "}
                    {postComments[commentKey].userCommentDate}
                  </div>
                  <div className="comment-status grey-italics smallest">
                    {postComments[commentKey].status
                      ? postComments[commentKey].status
                      : null}
                  </div>
                </div>
              </div>
              <div className="comment-section-btns">
                {user.email === postComments[commentKey].user ? (
                  <Button
                    variant="contained"
                    size="sm"
                    id={commentKey}
                    className="smallest"
                    name="edit"
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                ) : null}
              </div>
            </div>,
          ];
        });
      return comments.slice(0, len);
    }
  };

  const renderCommentForm = () => {
    if (!hasViewAccess()) return;
    return (
      <Modal.Footer>
        {user.email ? (
          <Form
            id="comment-form"
            onSubmit={editComment ? handleEditComment : handleSendComment}
          >
            <Form.Control
              as="textarea"
              rows={2}
              value={comment}
              placeholder="Join the conversation"
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="side-by-side-btns">
              <Button type="submit" variant="primary">
                Send comment
              </Button>
              <Button
                type={null}
                variant="primary"
                onClick={() => {
                  navigate("/");
                }}
              >
                Back to feed
              </Button>
            </div>
          </Form>
        ) : (
          <div
            className="grey-smaller prevent-select cursor-pointer"
            onClick={() => navigate("../login-signup")}
          >
            Log in or sign up to join the conversation!
          </div>
        )}
      </Modal.Footer>
    );
  };

  return (
    <Modal
      contentClassName={`modal-content-${encounter}`}
      centered
      show={true}
      backdrop="static"
    >
      <Modal.Header>
        <div className="user-avatar">
          <img src={userAvatar} alt={authorEmail} />
        </div>
        <div className="post-info">
          <div className="author">{authorEmail}</div>
          <div className="timestamp">{date}</div>
        </div>
        <CloseButton
          onClick={() => {
            navigate("/");
          }}
        />
      </Modal.Header>
      <Modal.Body>
        {renderLocation()}
        <div className="post-body">
          <div className="post-content">{content}</div>
          {renderImage()}
          <div className="reaction-btns">{renderReactionButtons()}</div>
        </div>

        <div className="post-comments">{renderComments(commentSectionLen)}</div>
        <div className="comment-section-btns">
          {postComments &&
            Object.keys(postComments).length > commentSectionLen && (
              <Button
                variant="contained"
                size="sm"
                className="smallest"
                onClick={() => setCommentSectionLen((prevLen) => prevLen + 5)}
              >
                More comments ↓
              </Button>
            )}
          {commentSectionLen > 5 && (
            <Button
              variant="contained"
              size="sm"
              className="smallest"
              onClick={() => setCommentSectionLen((prevLen) => prevLen - 5)}
            >
              Fewer comments ↑
            </Button>
          )}
        </div>
      </Modal.Body>
      {renderCommentForm()}
    </Modal>
  );
}
