import { useState, useEffect, useContext } from "react";
import { database } from "../Firebase.js";
import { ref, onValue, push, set, onChildAdded } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import { UserContext } from "../App.js";

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
  const [comments, setComments] = useState("");
  const [postComments, setPostComments] = useState([]);

  useEffect(() => {
    const postRef = ref(database, `${POSTS_DATABASE_KEY}/${postId}`);
    onValue(postRef, (snapshot) => {
      setUrl(snapshot.val().url);
      setContent(snapshot.val().content);
      setDate(snapshot.val().date);
      setAuthorEmail(snapshot.val().authorEmail);
      setPostComments(snapshot.val().comments);
    });
  }, []);

  const writeData = () => {
    const commentDate = new Date().toLocaleString();
    const postsCommentsRef = ref(
      database,
      `${POSTS_DATABASE_KEY}/${postId}/${COMMENTS_DATABASE_KEY}`
    );
    const newCommentsRef = push(postsCommentsRef);
    set(newCommentsRef, {
      userComment: comments,
      userCommentDate: commentDate,
      user: user.email,
    });
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    writeData();
    setComments("");
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
        <div className="comments">{renderComments()}</div>
        <form onSubmit={handleSendComment}>
          <input
            type="text"
            value={comments}
            placeholder="Enter your comment"
            onChange={(e) => setComments(e.target.value)}
          />
          <input type="submit" value="send"></input>
        </form>
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
