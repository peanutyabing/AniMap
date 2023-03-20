import { useNavigate } from "react-router-dom";
import { Modal, CloseButton } from "react-bootstrap";
import catIconG from "../Icons/cat-pin-green.png";
import otterIconG from "../Icons/otter-pin-green.png";
import otterIconR from "../Icons/otter-pin-red.png";

export default function Help() {
  const navigate = useNavigate();

  return (
    <Modal centered show={true} backdrop="static">
      <Modal.Header>
        <Modal.Title>First time here?</Modal.Title>
        <CloseButton
          onClick={() => {
            navigate("/");
          }}
        />
      </Modal.Header>
      <Modal.Body>
        Welcome to AniMap, the ultimate map for animal lovers!
      </Modal.Body>
      <Modal.Body>
        Each pin on the map represents a post by the community. Click on the
        pins to see more details.
        <div className="example smaller">
          <img className="icon-example" src={catIconG} alt="cat-icon" />
          This is a cat sighting
        </div>
        <div className="example smaller">
          <img className="icon-example" src={otterIconG} alt="otter-icon" />
          This is an otter sighting
        </div>
        <div className="example smaller">
          <img className="icon-example" src={otterIconR} alt="otter-icon-red" />
          Also an otter sighting, which the poster found unpleasant :(
        </div>
      </Modal.Body>
      <Modal.Body>Please submit posts to share your experience.</Modal.Body>
      <Modal.Body>
        Worried about safety and privacy? When drafting your post, place the pin
        on an approximate location, or select "only my friends" to restrict who
        can see your post's location.
      </Modal.Body>
      <Modal.Footer className="grey-smaller">
        Designed and developed by
        <a className="smaller green" href="https://github.com/peanutyabing">
          Yabing
        </a>{" "}
        and{" "}
        <a className="smaller green" href="https://github.com/ivan89kiat">
          Ivan
        </a>
      </Modal.Footer>
    </Modal>
  );
}
