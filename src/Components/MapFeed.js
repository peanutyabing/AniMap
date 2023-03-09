import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import catIcon from "../Icons/cat-50.png";
import otterIcon from "../Icons/otter-60.png";
import { AnimalMarker } from "./AnimalMarker";
import { Outlet } from "react-router-dom";

const containerStyle = {
  width: "100vw",
  height: "90%",
};

const center = {
  lat: 1.365,
  lng: 103.815,
};

//After enabling user posting, the below data should come from either the realtime database, or the internal state/props.
const PLACEHOLDER_DATA = [
  {
    id: "0test",
    type: "cat",
    icon: catIcon,
    position: {
      lat: 1.2815487770095195,
      lng: 103.79192417577524,
    },
    message: "Here's a cat!",
    downloadURL: "xxx",
  },
  {
    id: "1test",
    type: "otter",
    icon: otterIcon,
    position: {
      lat: 1.342987,
      lng: 103.83072,
    },
    message: "I just saw an otter.",
    downloadURL: "yyy",
  },
];

export default function MapFeed() {
  //The filterParam and filterVal parameters are optional. Nothing will be filtered if these arguments are left out. Otherwise, it will can filter data by any attribute (e.g. show me markers with type=cat only)
  const renderMarkers = (
    data,
    filterParam = undefined,
    filterVal = undefined
  ) => {
    let markers = data
      .filter((item) => item[filterParam] === filterVal)
      .map((item) => (
        <AnimalMarker id={item.id} position={item.position} icon={item.icon} />
      ));
    return markers;
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {renderMarkers(PLACEHOLDER_DATA)}
        <Outlet />
      </GoogleMap>
    </LoadScript>
  );
}
