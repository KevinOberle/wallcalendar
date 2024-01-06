"use client";
import { getPhotosforFrame, Photo } from "@/lib/google/photos";
import { useEffect, useRef, useState } from "react";

const width = 1920;
const height = 1080;
const transitionTime = 5000;

const Preload = (imageURLs: string[]) => {
  imageURLs.forEach((url) => {
    const photo = new Image();
    photo.src = url;
  });
};

const isLandscape = (photo: Photo) => {
  return photo.height && photo.width && photo.height > photo.width;
};

export default function PhotoFrameClient(props: { initPhotos: Photo[] }) {
  const [activePhotos, setActivePhotos] = useState<string[]>([]);
  const nextPhotos = useRef<string[]>([]);
  const photosQueue = useRef(props.initPhotos);

  const CyclePhotos = () => {
    if (nextPhotos.current.length > 0) setActivePhotos([...nextPhotos.current]);

    if (
      !photosQueue.current[0].width ||
      !photosQueue.current[0].height ||
      !photosQueue.current[0].baseURL
    )
      return; //this should not happen

    if (!isLandscape(photosQueue.current[0])) {
      //portait photo

      const url =
        photosQueue.current[0].baseURL + "=w" + width + "-h" + height + "-c";
      nextPhotos.current = [url];

      //remove photo from queue
      photosQueue.current.shift();
    } else {
      //landscape photo
      const url1 =
        photosQueue.current[0].baseURL +
        "=w" +
        width / 2 +
        "-h" +
        height +
        "-c";

      //remove photo from queue
      photosQueue.current.shift();

      //find another landscape photo in the queue
      const nextLandscapePhoto = photosQueue.current.findIndex(isLandscape);

      if (nextLandscapePhoto == -1) console.log("oh shit"); //Did not find a match - what do we do now???

      const url2 =
        photosQueue.current[nextLandscapePhoto].baseURL +
        "=w" +
        width / 2 +
        "-h" +
        height +
        "-c";

      //remove photo from queue
      photosQueue.current.splice(nextLandscapePhoto, 1);

      nextPhotos.current = [url1, url2];
    }

    Preload(nextPhotos.current);

    console.log(
      photosQueue.current.length +
        " photos remaining in queue of which " +
        photosQueue.current.filter(isLandscape).length +
        " are landscape"
    );

    if (
      photosQueue.current.length < 20 ||
      photosQueue.current.filter(isLandscape).length < 4
    )
      getNextBatchofPhotos();
  };

  const getNextBatchofPhotos = async () => {
    const photos = await getPhotosforFrame();
    photosQueue.current = [...photosQueue.current, ...photos];
  };

  useEffect(() => {
    CyclePhotos(); //Get the first set of photos
    CyclePhotos(); //Push the first set of photos to the view and grab the next set of photos

    const timer = setInterval(() => CyclePhotos(), transitionTime);

    return () => clearInterval(timer);
  }, []);

  switch (activePhotos.length) {
    case 0:
      return null;

    case 1:
      return (
        <img
          className="inline"
          key={activePhotos[0]}
          src={activePhotos[0]}
          width={width}
          height={height}
        />
      );

    case 2:
      return (
        <>
          <img
            className="inline"
            key={activePhotos[0]}
            src={activePhotos[0]}
            width={width / 2}
            height={height}
          />
          <img
            className="inline"
            key={activePhotos[1]}
            src={activePhotos[1]}
            width={width / 2}
            height={height}
          />
        </>
      );
  }
}
