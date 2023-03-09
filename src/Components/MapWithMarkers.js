import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import catIcon from "../Icons/cat-50.png";
import otterIcon from "../Icons/otter-60.png";

const containerStyle = {
  width: "100vw",
  height: "90%",
};

const center = {
  lat: 1.365,
  lng: 103.815,
};

const positions = [
  {
    lat: 1.2815487770095195,
    lng: 103.79192417577524,
  },
  {
    lat: 1.342987,
    lng: 103.83072,
  },
];

const onLoad = (marker) => {
  console.log("marker: ", marker);
};

export default function MapWithMarkers() {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        <Marker onLoad={onLoad} position={positions[0]} icon={catIcon} />
        <Marker onLoad={onLoad} position={positions[1]} icon={otterIcon} />
      </GoogleMap>
    </LoadScript>
  );
}
