import { useState, useEffect } from "react";
import { auth, storage } from "../Firebase.js";
import { ref as stRef, listAll, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Modal, CloseButton, Form, Button } from "react-bootstrap";
import { colorPalette } from "../ColorPalette.js";

export default function AvatarPicker() {
  const navigate = useNavigate();
  const [avatarURLs, setAvatarURLs] = useState({});
  const [animal, setAnimal] = useState("bear");
  const [bgColor, setBgColor] = useState("green");

  useEffect(() => {
    const avatarsRef = stRef(storage, "profiles/");
    listAll(avatarsRef)
      .then((res) => Promise.all(res.items.map((item) => getDownloadURL(item))))
      .then((urls) => {
        urls.forEach((url, index) => {
          setAvatarURLs((prevState) => {
            return { ...prevState, [getAvatarKeyFromURL(url)]: url };
          });
        });
      })
      .catch((error) => {
        alert(
          `Something went wrong while retrieving your avatar. Please try again later. ${error.message}`
        );
      });
  }, []);

  const getAvatarKeyFromURL = (downloadURL) => {
    return downloadURL.split("%2F")[1].split("?")[0];
  };

  const getAvatarFromState = () => {
    return avatarURLs[`${animal}-profile-${bgColor}.png`];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(auth.currentUser, {
      photoURL: getAvatarFromState(),
    })
      .then(() => {
        alert("You have updated your avatar!");
        navigate("/");
      })
      .catch((error) => {
        alert(`Something went wrong! Please try again later. ${error.message}`);
      });
  };

  const renderBackgroundPicker = (color) => {
    return (
      <div
        className="color-picker"
        style={{
          backgroundColor: colorPalette[color],
        }}
      ></div>
    );
  };

  const renderAvatar = () => {
    return (
      <div className="avatar">
        <img src={getAvatarFromState()} alt={`${animal}-${bgColor}`} />
      </div>
    );
  };

  return (
    <Modal show={true} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Choose avatar</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group flex-form">
            <Form.Label className="compact-label">
              What animal are you?
            </Form.Label>
            <Form.Select
              size="sm"
              className="narrow-select"
              onChange={(e) => {
                setAnimal(e.target.value);
              }}
            >
              <option value="bear">Bear</option>
              <option value="cat">Cat</option>
              <option value="chick">Chick</option>
              <option value="dog">Dog</option>
              <option value="duck">Duck</option>
              <option value="elephant">Elephant</option>
              <option value="fox">Fox</option>
              <option value="goat">Goat</option>
              <option value="hippo">Hippo</option>
              <option value="koala">Koala</option>
              <option value="lion">Lion</option>
              <option value="monkey">Monkey</option>
              <option value="owl">Owl</option>
              <option value="panda">Panda</option>
              <option value="penguin">Penguin</option>
              <option value="tiger">Tiger</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="flex-form">
            <Form.Label className="compact-label">
              Pick a background color:
            </Form.Label>
            <div className="side-by-side-btns">
              <Form.Check
                inline
                className="color-patch"
                type="radio"
                name="color"
                value="green"
                label={renderBackgroundPicker("light-green")}
                onChange={(e) => {
                  setBgColor(e.target.value);
                }}
                defaultChecked
              />
              <Form.Check
                inline
                className="color-patch"
                type="radio"
                name="color"
                value="pink"
                label={renderBackgroundPicker("light-pink")}
                onChange={(e) => {
                  setBgColor(e.target.value);
                }}
              />
            </div>
          </Form.Group>
          <Form.Group className="flex-center">
            {renderAvatar()}
            <Button type="submit">Confirm</Button>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
