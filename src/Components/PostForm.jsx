import React, { useState, useContext } from "react";
import { database, storage } from "../Firebase";
import { ref as databaseRef, push, set } from "firebase/database";
import {
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import CloseButton from "react-bootstrap/CloseButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import Geocode from "react-geocode";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { UserContext } from "../App";

// This function allows user to post sightings with the input description, upload photo and the type of encounter.
const POSTS_DATABASE_KEY = "posts";
const POSTS_IMAGES_FOLDER_NAME = "images";
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
Geocode.setRegion("sgp");

export default function PostForm(props) {
  const user = useContext(UserContext);
  const [userSelectedAnimal, setUserSelectedAnimal] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [userInputFile, setUserInputFile] = useState("");
  const [userFileInputValue, setUserFileInputValue] = useState("");
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [happy, setHappy] = useState(false);
  const [unhappy, setUnhappy] = useState(false);
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  // writing data into our database
  const writeData = (url, location) => {
    // insert date into our post
    const postDate = new Date().toLocaleString();
    // record our encounter in string status
    const encounter = happy ? "happy" : "unhappy";
    console.log("encounter", encounter);
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
      url: url,
    });
  };

  // reset the post form
  const resetPostForm = () => {
    setUserInputFile(null);
    setUserFileInputValue("");
    setUserMessage("");
  };

  //submit will store the images and execute write data
  const handleSubmit = async (e) => {
    e.preventDefault();
    // let location = await getlatlng();

    uploadFile()
      .then((url) => writeData(url))
      .then(resetPostForm)
      .catch((error) => {
        console.log(error);
      });
    navigate("/");
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
    <button
      onClick={(e) => {
        e.preventDefault();
        setHappy(true);
        setUnhappy(false);
      }}
      style={{ backgroundColor: happy ? "green" : null }}
    >{`🙂`}</button>
  );
  const badEncounter = (
    <button
      onClick={(e) => {
        e.preventDefault();
        setUnhappy(true);
        setHappy(false);
      }}
      style={{ backgroundColor: unhappy ? "red" : null }}
    >{`🙁`}</button>
  );

  const handleSelectAnimal = (e) => {
    console.log(e.target.value);
    setUserSelectedAnimal(e.target.value);
  };

  // [If implemented] public or friends-only
  return (
    <Modal {...props} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Submit a post</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group
            className="form-group"
            controlId="animal-type-input"
            onChange={handleSelectAnimal}
          >
            <Form.Label>What animal did you see?</Form.Label>
            <div className="radioButtons">
              <Form.Check
                inline
                label="Cat"
                value="cat"
                name="animal"
                type="radio"
                id="radio-cat"
              />
              <Form.Check
                inline
                label="Otter"
                value="otter"
                name="animal"
                type="radio"
                id="radio-otter"
              />
            </div>
          </Form.Group>
          <Form.Group className="form-group" controlId="encounter-input">
            <Form.Label>How was the encounter?</Form.Label>
            <div>
              {goodEncounter} {badEncounter}
            </div>
          </Form.Group>
          <Form.Group className="form-group" controlId="message-input">
            <Form.Label>Tell us more about the encounter:</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={userMessage}
              placeholder="Description: e.g. I saw a cat!"
              onChange={(e) => setUserMessage(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Where was the encounter?</Form.Label>
            <div id="loc-option-1">
              <Form.Control
                type="text"
                value={address}
                placeholder="Enter the address"
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button variant="secondary" onClick={getLatLng}>
                Look up coordinates
              </Button>
              {lat && lng ? (
                <div>
                  {lat}, {lng}
                </div>
              ) : (
                <div>Address not found</div>
              )}
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
            <Form.Label>Upload a photo:</Form.Label>
            <Form.Control
              type="file"
              name="userFileInputValue"
              value={userFileInputValue}
              onChange={(e) => {
                setUserInputFile(e.target.files[0]);
                setUserFileInputValue(e.target.value);
              }}
            />
          </Form.Group>
          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
