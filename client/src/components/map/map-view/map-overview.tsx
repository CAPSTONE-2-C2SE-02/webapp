import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MapContainer from "../map-container";
import { Marker, MarkerEvent, Popup, useMap } from "react-map-gl/mapbox";
import { useState } from "react";
import { MarkerData } from "../type";

interface MapOverviewProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
}

const MapOverview = ({ isOpen, onChange }: MapOverviewProps) => {
  const { overview } = useMap();
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const handleMarkerClick = (
    e: MarkerEvent<MouseEvent>,
    marker: MarkerData
  ) => {
    e.originalEvent.stopPropagation();
    setSelectedMarker(marker);
    if (overview) {
      overview.flyTo({
        center: [marker.longitude, marker.latitude],
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
            <Marker
              longitude={106.6}
              latitude={16.678}
              color="#0c4a6e"
              onClick={(e) => handleMarkerClick(e, { longitude: 106.6, latitude: 16.678 })}
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
                  hello guy
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