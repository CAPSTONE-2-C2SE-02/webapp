import { Marker, MarkerEvent, useMap } from "react-map-gl/mapbox"
import MapContainer from "../map-container"
import { MarkerData } from "../type";
import { Tour } from "@/lib/types";
import { useMemo } from "react";

const MapTour = ({ tourData }: { tourData: Tour }) => {
  const { tour } = useMap();

  const tourCoordinates = useMemo(() => {
    return {
      longitude: Number(tourData.destinationLon || 106.6),
      latitude: Number(tourData.destinationLat || 16.678),
    }
  }, [tourData])

  const handleMarkerClick = (
    e: MarkerEvent<MouseEvent>,
    marker: MarkerData
  ) => {
    e.originalEvent.stopPropagation();
    if (tour) {
      tour.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: 13,
        duration: 1000,
        essential: true,
        offset: [0, -30],
      });
    }
  };

  return (
    <div className="p-2 rounded-lg bg-white border border-primary  mr-1 shadow-[4px_4px_oklch(0.392_0.0844_240.76)]">
      <MapContainer
        mapType="tour"
        initialViewState={{
          longitude: tourCoordinates.longitude,
          latitude: tourCoordinates.latitude,
          zoom: 8,
        }}
        navControl={false}
      >
        <Marker
          longitude={tourCoordinates.longitude}
          latitude={tourCoordinates.latitude}
          color="#0c4a6e"
          onClick={(e) => handleMarkerClick(e, tourCoordinates)}
        />
      </MapContainer>
    </div>
  )
}

export default MapTour