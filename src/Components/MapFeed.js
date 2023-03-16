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

  const setMarkerParams = (animal, encounter) => {
    const icons = {
      happycat: { url: catIconG },
      unhappycat: { url: catIconR },
      happyotter: { url: otterIconG },
      unhappyotter: { url: otterIconR },
    };
    Object.keys(icons).forEach(
      (key) => (icons[key].scaledSize = new window.google.maps.Size(40, 55))
    );
    return icons[`${encounter}${animal}`];
  };

  const displayAfterFilter = (filterVal) => {
    console.log("this is running");
    const userFilterVal = filterVal;
    // [cat,happy]
    const filterParam = ["animal", "encounter"];
    for (let i = 0; i < filterParam.length; i++) {
      for (let j = 0; j < userFilterVal.length; j++) {
        posts.filter((item) => item[filterParam[i]] === userFilterVal[j]);
        console.log(posts);
      }
    }
    return posts;
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
          location={item.location}
          icon={setMarkerParams(item.animal, item.encounter)}
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
