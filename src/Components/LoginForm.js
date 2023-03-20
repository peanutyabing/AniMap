import {
  CloseButton,
  Button,
  Form,
  Modal,
  FloatingLabel,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function LoginForm(props) {
  const navigate = useNavigate();
  const handleChange = (e) => {
    let { name, value } = e.target;
    props.onChange(name, value);
  };

  return (
    <Modal show={true} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Log in / sign up</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <Form className="login-form">
          <Form.Group className="login-input">
            <FloatingLabel label="Email">
              <Form.Control
                name="email"
                type="email"
                value={props.email}
                onChange={handleChange}
                placeholder="my@email.com"
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group className="login-input">
            <FloatingLabel label="Password">
              <Form.Control
                name="password"
                type="password"
                value={props.password}
                placeholder="12345"
                onChange={handleChange}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group className="side-by-side-btns">
            <Button variant="primary" id="login" onClick={props.login}>
              Existing user | log in
            </Button>
            <Button variant="primary" id="sign-up" onClick={props.signup}>
              New user | sign up
            </Button>
          </Form.Group>
          <Form.Group>
            <div
              className="grey-smaller prevent-select forgot-password"
              onClick={() => {
                navigate("../reset-password");
              }}
            >
              Forgot your password? Reset via email
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
