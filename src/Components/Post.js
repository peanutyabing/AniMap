import { useState, useEffect, useContext } from "react";
import { database } from "../Firebase.js";
import { ref, onValue, push, set, update } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../App.js";
import { Modal, ButtonGroup, Button, CloseButton, Form } from "react-bootstrap";

const POSTS_DATABASE_KEY = "posts";
const COMMENTS_DATABASE_KEY = "comments";

export default function Post(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  let location = useLocation();
  let postId = location.pathname.split("/").slice(-1);

  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [reactions, setReactions] = useState({});
  const [postComments, setPostComments] = useState({});

  useEffect(() => {
    const postRef = ref(database, `${POSTS_DATABASE_KEY}/${postId}`);
    onValue(postRef, (snapshot) => {
      setUrl(snapshot.val().url);
      setContent(snapshot.val().content);
      setDate(snapshot.val().date);
      setAuthorEmail(snapshot.val().authorEmail);
      setReactions(snapshot.val().reactions);
      setPostComments(snapshot.val().comments);
    });
  }, []);

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

  const renderReactionButtons = () => {
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

  const renderComments = () => {
    let comments = [];
    for (const commentKey in postComments) {
      comments = [
        ...comments,
        <div key={commentKey}>
          {postComments[commentKey].user} {""}{" "}
          {postComments[commentKey].userComment} {""}
          {postComments[commentKey].userCommentDate}
        </div>,
      ];
    }
    return comments;
  };

  return (
    <Modal centered show={true} backdrop="static">
      <Modal.Header>
        <Modal.Title>SPOTTED</Modal.Title>
        <CloseButton
          onClick={() => {
            navigate("/");
          }}
        />
      </Modal.Header>
      <Modal.Body>
        <img src={url} alt={content} />
        <div>{content}</div>
        <div className="reaction-btns">{renderReactionButtons()}</div>
        <div className="comments">{renderComments()}</div>

        {user.email && (
          <Form onSubmit={handleSendComment}>
            <Form.Control
              type="text"
              value={comment}
              placeholder="Enter your comment"
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Send
            </Button>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="dark"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to feed
        </Button>
        <div>{date}</div>
        <div>{authorEmail}</div>
      </Modal.Footer>
    </Modal>
  );
}
