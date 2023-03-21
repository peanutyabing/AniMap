import { useState, useContext } from "react";
import { UserContext } from "../App.js";
import { auth } from "../Firebase.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  CloseButton,
  Button,
  Form,
  Modal,
  FloatingLabel,
} from "react-bootstrap";

export default function PasswordReset() {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState(user.email ? user.email : "");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const sendResetPasswordEmail = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert(`We have sent an email to ${email} to reset your password.`);
        navigate("../login-signup");
      })
      .catch((error) => {
        alert(`Something went wrong! ${error.message}`);
      });
  };

  return (
    <Modal show={true} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Reset password</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="login-input">
            <FloatingLabel
              label={user.email ? "Confirm your email" : "Enter your email"}
            >
              <Form.Control
                name="email"
                type="email"
                value={email}
                placeholder="my@email.com"
                onChange={handleChange}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group className="side-by-side-btns">
            <Button variant="dark" onClick={sendResetPasswordEmail}>
              Send password reset email
            </Button>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
