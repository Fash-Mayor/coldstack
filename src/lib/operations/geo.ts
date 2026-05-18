type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

export function geographyFromUnknown(value: unknown): GeoPoint | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null && "coordinates" in value) {
    const record = value as { coordinates?: number[] };
    const coords = record.coordinates;
    if (coords && coords.length >= 2) {
      return { type: "Point", coordinates: [coords[0], coords[1]] };
    }
  }

  if (typeof value === "string") {
    const match = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      return {
        type: "Point",
        coordinates: [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      };
    }
  }

  return null;
}
