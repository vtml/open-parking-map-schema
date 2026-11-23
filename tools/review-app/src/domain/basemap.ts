export function basemapOffered(openAir: boolean): boolean {
  return openAir;
}

export function osmTileUrl(lat: number, lon: number, zoom = 16): string {
  const size = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * size);
  const radians = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2 * size);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
