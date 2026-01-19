"use client";

import { Map, MapMarker, MapControls } from "@/components/ui/map";

type Props = { lat: number; lng: number };

export function LiveLocationMap({ lat, lng }: Props) {
  return (
    <div className="h-full w-full">
      <Map center={[lng, lat]} zoom={15} theme="light">
        <MapMarker latitude={lat} longitude={lng}>
          <div className="size-3 rounded-full bg-primary" />
        </MapMarker>
        <MapControls position="bottom-right" showZoom />
      </Map>
    </div>
  );
}
