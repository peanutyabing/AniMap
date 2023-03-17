import React, { useEffect, useState, useContext } from "react";
import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { database } from "../Firebase.js";
import { USERS_DATABASE_KEY } from "../App.js";
import { UserContext } from "../App.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import catIconG from "../Icons/cat-pin-green.png";
import catIconR from "../Icons/cat-pin-red.png";
import otterIconG from "../Icons/otter-pin-green.png";
import otterIconR from "../Icons/otter-pin-red.png";
// import birdIconG from "../Icons/bird-pin-green.png";
// import birdIconR from "../Icons/bird-pin-red.png";
// import dogIconG from "../Icons/dog-pin-green.png";
// import dogIconR from "../Icons/dog-pin-red.png";
import { AnimalMarker } from "./AnimalMarker.js";
import { Outlet } from "react-router-dom";

const containerStyle = {
  width: "100vw",
  height: "100%",
};

const center = {
  lat: 1.365,
  lng: 103.815,
};

const POSTS_DATABASE_KEY = "posts";

export default function MapFeed(props) {
  const user = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState({});
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    const postsRef = ref(database, POSTS_DATABASE_KEY);
    onChildAdded(postsRef, (data) => {
      if (!posts.map((post) => post.id).includes(data.key)) {
        setPosts((posts) => [
          ...posts,
          {
            id: data.key,
            date: data.val().date,
            location: data.val().location,
            authorEmail: data.val().authorEmail,
            animal: data.val().animal,
            encounter: data.val().encounter,
            publicPost: data.val().public === "true",
            maskedLocation: maskLocation(data.val().location),
          },
        ]);
      }
    });
  }, []);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildAdded(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  useEffect(() => {
    const usersRef = ref(database, USERS_DATABASE_KEY);
    onChildChanged(usersRef, (userData) => {
      if (userData.val().email === user.email) {
        setFriends(userData.val().friends);
      }
    });
  }, [user.email]);

  const handleLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleZoomChanged = () => {
    if (map) {
      setZoom(map.getZoom());
    }
  };

  const setMarkerParams = (animal, encounter) => {
    const icons = {
      happycat: { url: catIconG },
      unhappycat: { url: catIconR },
      happyotter: { url: otterIconG },
      unhappyotter: { url: otterIconR },
      // happybird: { url: birdIconG },
      // unhappybird: { url: birdIconR },
      // happydog: { url: dogIconG },
      // unhappydog: { url: dogIconR },
    };
    Object.keys(icons).forEach(
      (key) =>
        (icons[key].scaledSize = new window.google.maps.Size(
          Math.pow(zoom / 15, 2) * 40,
          Math.pow(zoom / 15, 2) * 55
        ))
    );
    return icons[`${encounter}${animal}`];
  };

  const filterFeature = (data, userFilterVal) => {
    if (userFilterVal.length <= 2) {
      let filteredData = data.filter(
        (item) =>
          (item["animal"] === userFilterVal[0] &&
            item["date"] >= userFilterVal[1]) ||
          (item["encounter"] === userFilterVal[0] &&
            item["date"] >= userFilterVal[1]) ||
          item["date"] >= userFilterVal[0]
      );
      return filteredData;
    }
    let filteredData = data.filter(
      (item) =>
        item["animal"] === userFilterVal[0] &&
        item["encounter"] === userFilterVal[1] &&
        item["date"] >= userFilterVal[2]
    );
    return filteredData;
  };

  const renderMarkers = (data) => {
    const userFilterVal = props.userFilterVal;

    if (props.filterStatus === false) {
      let markers = data.map((item) => (
        <AnimalMarker
          key={item.id}
          id={item.id}
          location={
            item.publicPost ||
            Object.values(friends)
              .map((friend) => friend.email)
              .includes(item.authorEmail) ||
            user.email === item.authorEmail
              ? item.location
              : item.maskedLocation
          }
          icon={setMarkerParams(item.animal, item.encounter)}
        />
      ));
      return markers;
    } else {
      let filteredMarkers = filterFeature(data, userFilterVal).map((item) => (
        <AnimalMarker
          key={item.id}
          id={item.id}
          location={item.location}
          icon={setMarkerParams(item.animal, item.encounter)}
        />
      ));
      return filteredMarkers;
    }
  };

  const maskLocation = (coordinates) => {
    let maskedLat = coordinates.lat + getRandom();
    let maskedLng = coordinates.lng + getRandom();
    return { lat: maskedLat, lng: maskedLng };
  };

  const getRandom = () => {
    let randomDecimal = Math.random() * 0.002;
    return Math.random() > 0.5 ? randomDecimal : randomDecimal * -1;
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={handleLoad}
        onZoomChanged={handleZoomChanged}
      >
        {renderMarkers(posts)}
        <Outlet />
      </GoogleMap>
    </LoadScript>
  );
}
