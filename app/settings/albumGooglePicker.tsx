"use client";
import { getAlbums } from "@/lib/google/photos";

export default async function AlbumGooglePicker() {
  return (
    <select className="select select-bordered" defaultValue="Pick one">
      <option disabled>Pick one</option>
      {props.albums === null ? (
        <></>
      ) : (
        props.albums.map((album) => (
          <option key={album.id}>{album.title}</option>
        ))
      )}
    </select>
  );
}
