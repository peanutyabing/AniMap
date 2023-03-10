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
import { useNavigate } from "react-router-dom";
import Geocode from "react-geocode";
import { UserContext } from "../App";

// This function allows user to post sightings with the input description, upload photo and the type of encounter.
const POSTS_DATABASE_KEY = "posts";
const POSTS_IMAGES_FOLDER_NAME = "images";
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
Geocode.setRegion("sgp");

export default function PostForm(props) {
  const user = useContext(UserContext);
  const [userMessage, setUserMessage] = useState("");
  const [userInputFile, setUserInputFile] = useState("");
  const [userFileInputValue, setUserFileInputValue] = useState("");
  // const [lng, setLng] = useState(0);
  // const [lat, setLat] = useState(0);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  // writing data into our database
  const writeData = (url, location) => {
    // insert date into our post
    const postDate = new Date().toLocaleString();
    // ref to direct posts into database
    const postsListRef = databaseRef(database, POSTS_DATABASE_KEY);
    const newPostRef = push(postsListRef);
    set(newPostRef, {
      authorEmail: user.email,
      content: userMessage,
      date: postDate,
      location: location,
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
    let location = await getlatlng();

    uploadFile()
      .then((url) => writeData(url, location))
      .then(resetPostForm)
      .catch((error) => {
        console.log(error);
      });
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

  // every map pin will call this function to send lon and lat to the postform
  // const getLocationFromMap = (lat, lng) => {
  //   setLng(lng);
  //   setLat(lat);
  //   console.log(lng, lat);
  // };

  const getlatlng = () =>
    Geocode.fromAddress(address).then(
      (response) =>
        // console.log(response);
        // const { lat, lng } =
        {
          console.log(response.results[0].geometry.location);
          return response.results[0].geometry.location;
        },

      // getLocationFromMap(lat, lng);

      (error) => {
        console.error(error);
      }
    );
  // type of encounter: :) or :(
  // need to implement how to capture this data and render out green or red pin
  const goodEncounter = <button>{`🙂`}</button>;
  const badEncounter = <button>{`🙁`}</button>;

  // [If implemented] public or friends-only
  return (
    <Modal {...props} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Submit a post</Modal.Title>
        <CloseButton onClick={() => navigate("/")} />
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userMessage}
            placeholder="Description: e.g. I saw a cat!"
            onChange={(e) => setUserMessage(e.target.value)}
          ></input>
          <br />
          <div>
            {goodEncounter} {badEncounter}
          </div>
          <br />
          <div>
            <input
              type="text"
              value={address}
              placeholder="Location"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <br />
          <input
            type="file"
            name="userFileInputValue"
            value={userFileInputValue}
            onChange={(e) => {
              setUserInputFile(e.target.files[0]);
              setUserFileInputValue(e.target.value);
            }}
          />
          <input type="submit" value="submit" name="submit" />
        </form>
      </Modal.Body>
    </Modal>
  );
}
