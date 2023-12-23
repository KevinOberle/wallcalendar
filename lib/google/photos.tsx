"use server";

import { isAuthenticated, getAccessToken } from "./auth";

type Album = {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
  isWriteable: boolean;
  mediaItemsCount: number;
};

export async function getAlbums(): Promise<Album[] | null> {
  if (!isAuthenticated()) return null;

  console.log("Fetching albums list");

  const res = await fetch("https://photoslibrary.googleapis.com/v1/albums", {
    headers: {
      Authorization: "Bearer " + (await getAccessToken()),
      "Content-Type": "application/json",
    },
  });

  //TODO: loop to collect all albums
  if (!res.ok) return null;

  console.log("Albums recieved");

  const ResponseBody = await res.json();

  return ResponseBody.albums;
}
