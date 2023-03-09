import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import { useNavigate } from "react-router-dom";

export default function Post(props) {
  const navigate = useNavigate();

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
        <div>Placeholder for image, retrieve from Firebase</div>
        <div>Placeholder for message, retrieve from Firebase</div>
        <div>Like buttons, comments</div>
      </Modal.Body>
      <Modal.Footer>
        <div>Placeholder for timestamp, retrieve from Firebase</div>
        <div>Placeholder for poster, retrieve from Firebase</div>
      </Modal.Footer>
    </Modal>
  );
}
