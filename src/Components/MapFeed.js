import React, { useEffect, useState } from "react";
import { onChildAdded, ref } from "firebase/database";
import { database } from "../Firebase.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import catIconG from "../Icons/cat-pin-green.png";
import catIconR from "../Icons/cat-pin-red.png";
import otterIconG from "../Icons/otter-pin-green.png";
import otterIconR from "../Icons/otter-pin-red.png";
import { AnimalMarker } from "./AnimalMarker";
import { Outlet, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
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
          },
        ]);
      }
    });
  }, []);

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

  const filterFeature = (
    data,
    userFilterAnimalVal,
    userFilterEncounterVal,
    userFilterDateVal
  ) => {
    if (props.filterStatus === true) {
      let filteredData = data.filter(
        (item) => item["date"] >= userFilterDateVal[0]
      );
      if (userFilterEncounterVal.length >= 0) {
        let updatedFilteredData = filteredData.filter(
          (item) =>
            item["encounter"] === userFilterEncounterVal[0] ||
            item["encounter"] === userFilterEncounterVal[1]
        );
        if (userFilterAnimalVal.length >= 0) {
          let finalFilteredData = updatedFilteredData.filter(
            (item) =>
              item["animal"] === userFilterAnimalVal[0] ||
              item["animal"] === userFilterAnimalVal[1] ||
              item["animal"] === userFilterAnimalVal[2] ||
              item["animal"] === userFilterAnimalVal[3]
          );
          return finalFilteredData;
        }
      }
    }
  };

  const renderMarkers = (data) => {
    const userFilterAnimalVal = props.userFilterAnimalVal;
    const userFilterEncounterVal = props.userFilterEncounterVal;
    const userFilterDateVal = props.userFilterDateVal;

    if (props.filterStatus === false) {
      let markers = data.map((item) => (
        <AnimalMarker
          key={item.id}
          id={item.id}
          location={item.location}
          icon={setMarkerParams(item.animal, item.encounter)}
        />
      ));
      return markers;
    } else {
      let filteredMarkers = filterFeature(
        data,
        userFilterAnimalVal,
        userFilterEncounterVal,
        userFilterDateVal
      ).map((item) => (
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
