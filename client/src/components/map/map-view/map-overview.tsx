import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MapContainer from "../map-container";
import { Marker, MarkerEvent, Popup, useMap } from "react-map-gl/mapbox";
import { useState } from "react";
import { useGetAllToursMarkers } from "@/hooks/useGetAllToursMarkers";
import { TourMarker } from "@/lib/types";
import { formatCurrency, generateRatingText, getAbsoluteAddress } from "@/components/utils/convert";
import { Star } from "lucide-react";
import { Link } from "react-router";

interface MapOverviewProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
}

const MapOverview = ({ isOpen, onChange }: MapOverviewProps) => {
  const { overview } = useMap();
  const [selectedMarker, setSelectedMarker] = useState<TourMarker | null>(null);
  const { data: toursMarkers } = useGetAllToursMarkers();

  const handleMarkerClick = (
    e: MarkerEvent<MouseEvent>,
    longitude: number,
    latitude: number
  ) => {
    e.originalEvent.stopPropagation();
    if (overview) {
      overview.flyTo({
        center: [longitude, latitude],
        zoom: 13,
        duration: 1000,
        essential: true,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="md:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full h-[90vh] flex flex-col gap-3" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-primary font-semibold drop-shadow-[1px_1px_oklch(0.777_0.152_181.912)]">Map Overview</DialogTitle>
        </DialogHeader>
        <div className="w-full h-full rounded-sm overflow-hidden">
          <MapContainer
            mapType="overview"
            initialViewState={{
              longitude: 106.6,
              latitude: 16.678,
              zoom: 5,
            }}
          >
            {toursMarkers?.result?.map((marker) => {
              const latRandom = Math.random() * (23.37 - 8.5) + 8.5;
              const lngRandom = Math.random() * (109.45 - 102.13) + 102.13;
              return (
                <Marker
                  key={marker._id}
                  longitude={Number(marker.destinationLon || lngRandom)}
                  latitude={Number(marker.destinationLat || latRandom)}
                  color="#0c4a6e"
                  onClick={(e) => {
                    setSelectedMarker({
                      ...marker,
                      destinationLon: marker.destinationLon || lngRandom.toString(),
                      destinationLat: marker.destinationLat || latRandom.toString()
                    });
                    handleMarkerClick(e, Number(marker.destinationLon || lngRandom), Number(marker.destinationLat || latRandom))
                  }}
                />
              )
            })}
            {selectedMarker && (
              <Popup
                longitude={Number(selectedMarker.destinationLon)}
                latitude={Number(selectedMarker.destinationLat)}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setSelectedMarker(null)}
                anchor="top"
              >
                <div className="w-full h-full flex items-center gap-2">
                  <div className="h-24 w-28 flex-shrink-0 overflow-hidden rounded-sm">
                    <img src={selectedMarker.imageUrls[0]} alt={selectedMarker.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Link to={`/tours/${selectedMarker._id}`} className="text-primary font-semibold line-clamp-2 text-xs">{selectedMarker.title}</Link>
                    <span className="text-[10px] text-teal-700 font-semibold line-clamp-1">{getAbsoluteAddress(selectedMarker.destination, selectedMarker.departureLocation)}</span>
                    <span className="text-primary text-xs font-semibold">
                      {formatCurrency(selectedMarker.priceForAdult)}
                    </span>
                    {selectedMarker?.rating > 0 && (
                      <div className="flex items-center text-primary gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold leading-none">
                          {selectedMarker?.rating > 0 && selectedMarker.rating}
                        </span>
                        <span className="leading-3">&bull;{" "}</span>
                        <span className="text-xs font-semibold">
                          {generateRatingText(selectedMarker.rating)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MapOverview