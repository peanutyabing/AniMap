import { Marker } from "@react-google-maps/api";

export function AnimalMarker(props) {
  const onLoad = (marker) => {
    console.log("marker: ", marker);
  };
  return <Marker onLoad={onLoad} position={props.position} icon={props.icon} />;
}
