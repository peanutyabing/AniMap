import { useState, useEffect } from "react";
import { database } from "../Firebase.js";
import { ref, onValue } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";

const POSTS_DATABASE_KEY = "posts";

export default function Post(props) {
  const navigate = useNavigate();
  let location = useLocation();
  let postId = location.pathname.split("/").slice(-1);
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  useEffect(() => {
    const postRef = ref(database, `${POSTS_DATABASE_KEY}/${postId}`);
    onValue(postRef, (snapshot) => {
      setUrl(snapshot.val().url);
      setContent(snapshot.val().content);
      setDate(snapshot.val().date);
      setAuthorEmail(snapshot.val().authorEmail);
    });
  }, []);

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
