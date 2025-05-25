import "mapbox-gl/dist/mapbox-gl.css";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import { InitialViewState } from "./type";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapContainerProps {
  mapType: 'overview' | 'tour';
  initialViewState: InitialViewState;
  children: React.ReactNode;
  navControl?: boolean;
}

const MapContainer = ({ mapType, initialViewState, children, navControl = true }: MapContainerProps) => {
  return (
    <Map
      id={mapType}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      attributionControl={false}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      {navControl && <NavigationControl />}
    </Map>
  )
}

export default MapContainer