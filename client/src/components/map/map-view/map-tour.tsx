import { Marker, MarkerEvent, Popup, useMap } from "react-map-gl/mapbox"
import MapContainer from "../map-container"
import { MarkerData } from "../type";
import { useState } from "react";

const MapTour = () => {
  const { tour } = useMap();
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const handleMarkerClick = (
    e: MarkerEvent<MouseEvent>,
    marker: MarkerData
  ) => {
    e.originalEvent.stopPropagation();
    setSelectedMarker(marker);
    if (tour) {
      tour.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: 13,
        duration: 1000,
        essential: true,
        offset: [0, -30], // Adjust the offset to position the marker better
      });
    }
  };

  return (
    <div className="p-2 rounded-lg bg-white border border-primary  mr-1 shadow-[4px_4px_oklch(0.392_0.0844_240.76)]">
      <MapContainer
        mapType="tour"
        initialViewState={{
          longitude: 105.0125700,
          latitude: 22.8372564,
          zoom: 8,
        }}
        navControl={false}
      >
        <Marker
          longitude={105.0125700}
          latitude={22.8372564}
          color="#0c4a6e"
          onClick={(e) => handleMarkerClick(e, { longitude: 105.0125700, latitude: 22.8372564 })}
        />
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
            anchor="top"
          >
            <div className="w-full h-full">
              <h1>Hello</h1>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}

export default MapTour