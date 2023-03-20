import { useNavigate } from "react-router-dom";
import { Marker } from "@react-google-maps/api";

export function AnimalMarker(props) {
  const navigate = useNavigate();

  const handleClick = (id) => {
    return () => {
      navigate(`posts/${id}`);
    };
  };

  return (
    <Marker
      key={props.id}
      className="animal-marker"
      position={props.location}
      icon={props.icon}
      // onLoad={onLoad}
      onClick={handleClick(props.id)}
    />
  );
}
