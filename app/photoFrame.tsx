import { getPhotosforFrame } from "@/lib/google/photos";
import PhotoFrameClient from "./photoFrameClient";
import { Suspense } from "react";

export default async function PhotoFrame() {
  const photos = await getPhotosforFrame();
  return (
    <Suspense>
      <PhotoFrameClient initPhotos={photos} />
    </Suspense>
  );
}
