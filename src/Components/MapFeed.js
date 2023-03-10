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

//After enabling user posting, the below data should come from either the realtime database, or the internal state/props.
const PLACEHOLDER_DATA = [
  {
    id: "0test",
    animal: "cat",
    // icon: catIcon,
    location: {
      lat: 1.2815487770095195,
      lng: 103.79192417577524,
    },
    content: "Here's a cat!",
    url: "xxx",
  },
  {
    id: "1test",
    animal: "otter",
    // icon: otterIcon,
    location: {
      lat: 1.342987,
      lng: 103.83072,
    },
    content: "I just saw an otter.",
    url: "yyy",
  },
];

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
