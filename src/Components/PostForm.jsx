import React, { useState, useContext } from "react";
import { database, storage } from "../Firebase.js";
import { ref as databaseRef, push, set } from "firebase/database";
import {
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { Modal, Button, CloseButton, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Geocode from "react-geocode";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { UserContext } from "../App";

// This function allows user to post sightings with the input description, upload photo and the type of encounter.
const POSTS_DATABASE_KEY = "posts";
const POSTS_IMAGES_FOLDER_NAME = "images";
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
Geocode.setRegion("sgp");

export default function PostForm() {
  const user = useContext(UserContext);
  const [userSelectedAnimal, setUserSelectedAnimal] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [userInputFile, setUserInputFile] = useState("");
  const [userFileInputValue, setUserFileInputValue] = useState("");
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [happy, setHappy] = useState(false);
  const [unhappy, setUnhappy] = useState(false);
  const [address, setAddress] = useState("");
  const [publicPost, setPublicPost] = useState(true);

  const navigate = useNavigate();

  // writing data into our database
  const writeData = (url) => {
    // insert date into our post
    const postDate = new Date().toLocaleString();
    // record our encounter in string status
    const encounter = happy ? "happy" : "unhappy";

    // ref to direct posts into database
    const postsListRef = databaseRef(database, POSTS_DATABASE_KEY);
    const newPostRef = push(postsListRef);
    set(newPostRef, {
      animal: userSelectedAnimal,
      authorEmail: user.email,
      content: userMessage,
      date: postDate,
      encounter: encounter,
      location: { lat: lat, lng: lng },
      reactions: { love: [""], funny: [""], shook: [""], sad: [""] },
      url: url,
      public: publicPost,
    });
  };

  // reset the post form
  const resetPostForm = () => {
    setUserInputFile(null);
    setUserFileInputValue("");
    setUserMessage("");
  };

  //submit will store the images and execute write data
  const handleSubmit = (e) => {
    e.preventDefault();
    let userHasSelectedEncounter = happy || unhappy;
    if (
      userSelectedAnimal &&
      userHasSelectedEncounter &&
      userMessage &&
      lat &&
      lng
    ) {
      uploadFile()
        .then((url) => writeData(url))
        .then(resetPostForm)
        .catch((error) => {
          console.log(error);
        });
      navigate("/");
    } else {
      alert("Please complete the post!");
    }
  };

  const uploadFile = () => {
    if (userInputFile) {
      const fileRef = storageRef(
        storage,
        `${POSTS_IMAGES_FOLDER_NAME}/${userInputFile.name}`
      );
      return uploadBytes(fileRef, userInputFile).then(() =>
        getDownloadURL(fileRef)
      );
    } else {
      return Promise.resolve("");
    }
  };

  const getLatLng = () =>
    Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        setLat(lat);
        setLng(lng);
      },
      (error) => {
        console.error(error);
        setLat(null);
        setLng(null);
      }
    );

  // type of encounter: :) or :(
  const goodEncounter = (
    <Button
      onClick={(e) => {
        e.preventDefault();
        setHappy(true);
        setUnhappy(false);
      }}
      variant={happy ? "success" : "light"}
      // style={{ backgroundColor: happy ? "green" : null }}
    >{`🙂`}</Button>
  );
  const badEncounter = (
    <Button
      onClick={(e) => {
        e.preventDefault();
        setUnhappy(true);
        setHappy(false);
      }}
      variant={unhappy ? "danger" : "light"}
      // style={{ backgroundColor: unhappy ? "red" : null }}
    >{`🙁`}</Button>
  );

  const handleSelectAnimal = (e) => {
    setUserSelectedAnimal(e.target.value);
  };

  const handleSelectPrivacy = (e) => {
    setPublicPost(e.target.value);
  };

  // [If implemented] public or friends-only
  return (
    <Modal show={true} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Submit a post</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group
            className="form-group flex-form"
            controlId="animal-type-input"
            onChange={handleSelectAnimal}
          >
            <Form.Label>What animal did you see?</Form.Label>
            <Form.Select id="select-animal" size="sm">
              <option></option>
              <option value="cat">Cat</option>
              <option value="otter">Otter</option>
            </Form.Select>
          </Form.Group>
          <Form.Group
            className="form-group flex-form"
            controlId="encounter-input"
          >
            <Form.Label>How was the encounter?</Form.Label>
            <div id="encounter-btns">
              {goodEncounter} {badEncounter}
            </div>
          </Form.Group>
          <Form.Group className="form-group" controlId="message-input">
            <Form.Label>Tell us more about the encounter</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>Where was the encounter?</Form.Label>

            {lat && lng ? (
              <div className="coordinates-display green">
                {lat}, {lng}
              </div>
            ) : (
              <div className="coordinates-display red">Address not found</div>
            )}
            <div id="address-look-up">
              <Form.Control
                type="text"
                size="sm"
                value={address}
                placeholder="Enter address or click on the map"
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                id="look-up-btn"
                onClick={getLatLng}
              >
                Look up
              </Button>
            </div>
            <div id="loc-option-2">
              <GoogleMap
                onClick={(e) => {
                  setLat(e.latLng.lat());
                  setLng(e.latLng.lng());
                }}
                mapContainerStyle={{
                  width: "100%",
                  height: "20vh",
                }}
                center={
                  lat && lng
                    ? { lat: lat, lng: lng }
                    : {
                        lat: 1.365,
                        lng: 103.815,
                      }
                }
                zoom={11}
              >
                <Marker position={{ lat: lat, lng: lng }} />
              </GoogleMap>
            </div>
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              Upload a photo
              <span className="grey-italics">{" (optional)"}</span>
            </Form.Label>
            <Form.Control
              type="file"
              size="sm"
              name="userFileInputValue"
              value={userFileInputValue}
              onChange={(e) => {
                setUserInputFile(e.target.files[0]);
                setUserFileInputValue(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group
            className="form-group flex-form"
            controlId="privacy-input"
            onChange={handleSelectPrivacy}
          >
            <Form.Label>Who can see this post?</Form.Label>
            <Form.Select id="select-privacy" size="sm">
              <option value={true}>Everyone</option>
              <option value={false}>Only my friends</option>
            </Form.Select>
            <div id="help" className="grey-smaller prevent-select">
              ?
            </div>
          </Form.Group>
          <Button type="submit">Submit ⏎</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
