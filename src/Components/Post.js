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
    const postCommentRef = ref(
      database,
      `${POSTS_DATABASE_KEY}/${postId}/${COMMENTS_DATABASE_KEY}`
    );
    onValue(postRef, (snapshot) => {
      setUrl(snapshot.val().url);
      setContent(snapshot.val().content);
      setDate(snapshot.val().date);
      setAuthorEmail(snapshot.val().authorEmail);
    });
    onChildAdded(postCommentRef, (data) => {
      if (!postComments.map((comment) => comment.id).includes(data.key)) {
        setPostComments((comments) => [
          ...postComments,
          {
            id: data.key,
            user: data.val().user,
            userComment: data.val().userComment,
            userCommentDate: data.val().userCommentDate,
          },
        ]);
      }
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

  const handleSend = (e) => {
    e.preventDefault();
    writeData();
    setComments("");
  };
  console.log("postComments", postComments);
  let postCommentsList = postComments.map((comment) => (
    <div key={comment.id}>
      {comment.user} {""} {comment.userComment} {""}
      {comment.userCommentDate}
    </div>
  ));

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
        <div style={{ fontSize: "x-small", margin: "4vmin 0" }}>
          ...Placeholder for likes, a like button and comments...
          {postCommentsList}
          <form onSubmit={handleSend}>
            <input
              type="text"
              value={comments}
              placeholder="Enter your comment"
              onChange={(e) => setComments(e.target.value)}
            />
            <input type="submit" value="send"></input>
          </form>
          ;
        </div>
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
