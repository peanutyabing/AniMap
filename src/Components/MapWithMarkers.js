import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "90%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const position = {
  lat: -3.745,
  lng: -38.523,
};

const onLoad = (marker) => {
  console.log("marker: ", marker);
};

export default function MapWithMarkers() {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        {/* Child components, such as markers, info windows, etc. */}

        <Marker onLoad={onLoad} position={position} />
      </GoogleMap>
    </LoadScript>
  );
}
