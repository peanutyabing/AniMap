import React, { useEffect, useState } from "react";
import { onChildAdded, ref } from "firebase/database";
import { database } from "../Firebase.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import catIcon from "../Icons/cat-50.png";
import otterIcon from "../Icons/otter-60.png";
import { AnimalMarker } from "./AnimalMarker";
import { Outlet } from "react-router-dom";

const containerStyle = {
  width: "100vw",
  height: "100%",
};

const center = {
  lat: 1.365,
  lng: 103.815,
};

const icons = {
  cat: catIcon,
  otter: otterIcon,
};

const POSTS_DATABASE_KEY = "posts";

export default function MapFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = ref(database, POSTS_DATABASE_KEY);
    onChildAdded(postsRef, (data) => {
      setPosts((posts) => [
        ...posts,
        {
          id: data.key,
          content: data.val().content,
          date: data.val().date,
          location: data.val().location,
          authorEmail: data.val().authorEmail,
          animal: data.val().animal,
          // likedBy: data.val().likedBy,
        },
      ]);
    });
  }, []);

  //The filterParam and filterVal parameters are optional. Nothing will be filtered if these arguments are left out. Otherwise, it will can filter data by any attribute (e.g. show me markers with type=cat only)
  const renderMarkers = (
    data,
    filterParam = undefined,
    filterVal = undefined
  ) => {
    let markers = data
      .filter((item) => item[filterParam] === filterVal)
      .map((item) => (
        <AnimalMarker
          key={item.id}
          id={item.id}
          location={item.location}
          icon={icons[item.animal]}
        />
      ));
    return markers;
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {renderMarkers(posts)}
        <Outlet />
      </GoogleMap>
    </LoadScript>
  );
}
