"use client";

import { useEffect } from "react";
import {
  Map,
  MapMarker,
  MapRoute,
  MapControls,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";

type ReportRouteMapProps = {
  reportLat: number;
  reportLng: number;
  myLat?: number | null;
  myLng?: number | null;
};

function FitBounds({
  reportLat,
  reportLng,
  myLat,
  myLng,
}: {
  reportLat: number;
  reportLng: number;
  myLat: number | null | undefined;
  myLng: number | null | undefined;
}) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!isLoaded || !map || myLat == null || myLng == null) return;
    const minLng = Math.min(reportLng, myLng);
    const maxLng = Math.max(reportLng, myLng);
    const minLat = Math.min(reportLat, myLat);
    const maxLat = Math.max(reportLat, myLat);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 60, maxZoom: 15, duration: 500 }
    );
  }, [isLoaded, map, reportLat, reportLng, myLat, myLng]);
  return null;
}

export function ReportRouteMap({
  reportLat,
  reportLng,
  myLat,
  myLng,
}: ReportRouteMapProps) {
  const hasMy = myLat != null && myLng != null;

  return (
    <div className="h-full w-full">
      <Map center={[reportLng, reportLat]} zoom={15} theme="light">
        <FitBounds reportLat={reportLat} reportLng={reportLng} myLat={myLat} myLng={myLng} />
        <MapMarker latitude={reportLat} longitude={reportLng}>
          <MarkerContent>
            <div
              className="size-4 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: "var(--color-primary, #ff3131)" }}
            />
          </MarkerContent>
          <MarkerPopup>
            <div className="min-w-36 text-sm">
              <p className="font-medium text-primary">রিপোর্টের অবস্থান</p>
              <p className="text-muted-foreground text-xs">{reportLat.toFixed(5)}, {reportLng.toFixed(5)}</p>
            </div>
          </MarkerPopup>
        </MapMarker>
        {hasMy && (
          <MapMarker latitude={myLat!} longitude={myLng!}>
            <MarkerContent>
              <div className="size-4 rounded-full border-2 border-white bg-blue-500 shadow" />
            </MarkerContent>
            <MarkerPopup>
              <div className="min-w-36 text-sm">
                <p className="font-medium text-blue-600">আমার অবস্থান</p>
                <p className="text-muted-foreground text-xs">{myLat!.toFixed(5)}, {myLng!.toFixed(5)}</p>
              </div>
            </MarkerPopup>
          </MapMarker>
        )}
        {hasMy && (
          <MapRoute
            coordinates={[
              [myLng!, myLat!],
              [reportLng, reportLat],
            ]}
            color="#3b82f6"
            width={4}
            opacity={0.9}
          />
        )}
        <MapControls position="bottom-right" showZoom showLocate />
      </Map>
    </div>
  );
}
