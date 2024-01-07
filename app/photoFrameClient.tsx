"use client";
import { getPhotosforFrame, Photo } from "@/lib/google/photos";
import { useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./photoFrameClient.style.css";

const width = 1920;
const height = 1080;
const transitionTime = 10000;

type photoFrameElement = {
  url: string;
  width: number;
  height: number;
};

const Preload = (images: photoFrameElement[]) => {
  images.forEach((image) => {
    const photo = new Image();
    photo.src = image.url;
  });
};

const isLandscape = (photo: Photo) => {
  return photo.height && photo.width && photo.height > photo.width;
};

export default function PhotoFrameClient(props: { initPhotos: Photo[] }) {
  const [activePhotos, setActivePhotos] = useState<photoFrameElement[]>([]);
  const nextPhotos = useRef<photoFrameElement[]>([]);
  const photosQueue = useRef(props.initPhotos);
  const nodeRef = useRef();

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
      nextPhotos.current = [{ url: url, width: width, height: height }];

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

      nextPhotos.current = [
        { url: url1, width: width / 2, height: height },
        { url: url2, width: width / 2, height: height },
      ];
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

  return (
    <TransitionGroup className="photoFrame">
      {activePhotos[0] ? (
        <CSSTransition
          key={activePhotos[0].url}
          nodeRef={nodeRef}
          timeout={2000}
          classNames="photo"
        >
          <div className="absolute" key={activePhotos[0].url}>
            {activePhotos.map((photo) => (
              <img
                className="inline"
                key={photo.url}
                src={photo.url}
                width={photo.width}
                height={photo.height}
              />
            ))}
          </div>
        </CSSTransition>
      ) : null}
    </TransitionGroup>
  );
}
