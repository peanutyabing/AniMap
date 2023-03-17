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
import { AnimalMarker } from "./AnimalMarker.js";
import { Outlet, useNavigate } from "react-router-dom";
import Filter from "./Filter";

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
  const navigate = useNavigate();
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

  //The filterParam and filterVal parameters are optional. Nothing will be filtered if these arguments are left out. Otherwise, it will can filter data by any attribute (e.g. show me markers with type=cat only)
  const renderMarkers = (
    data,
    filterParam = props.filterParam ? props.filterParam : undefined,
    filterVal = props.filterVal ? props.filterVal : undefined
  ) => {
    let markers = data
      .filter((item) => item[filterParam] === filterVal)
      .map((item) => (
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
