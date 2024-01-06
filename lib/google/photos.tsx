"use server";

import { isAuthenticated, getAccessToken } from "./auth";
import { KeyStore, MediaItem, Op } from "@/lib/db";

const KeyNameSelectedAlbum = "Service.Google.AlbumID";

export type Album = {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
  mediaItemsCount: number;
};
export type Photo = {
  id: string;
  baseURL?: string;
  width?: number;
  height?: number;
};

export async function getPhotosforFrame() {
  const PhotoIDs: { id: string }[] = await MediaItem.findAll({
    attributes: ["id"],
    where: {
      albumId: await getSelectedAlbum(),
      photo: true,
      mimeType: { [Op.notLike]: "%gif" },
    },
    order: MediaItem.sequelize.random(),
    limit: 50,
    raw: true,
  });

  const url = new URL(
    "https://photoslibrary.googleapis.com/v1/mediaItems:batchGet"
  );
  PhotoIDs.forEach((item) => url.searchParams.append("mediaItemIds", item.id));

  console.log("Got " + PhotoIDs.length + " Random Photo IDs");

  let Photos: Photo[];

  await APIGet(
    url,
    async (Res) => {
      const ResBody = await Res.json();
      const mediaItemResults = ResBody.mediaItemResults;
      console.log("Got " + mediaItemResults.length + " mediaItemResults");

      //TODO: Finish this function::
      Photos = mediaItemResults.map((item) => {
        //console.log(item);

        if (item.mediaItem) {
          //https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
          return {
            id: item.mediaItem.id,
            baseURL: item.mediaItem.baseUrl,
            width: item.mediaItem.mediaMetadata.width,
            height: item.mediaItem.mediaMetadata.height,
          };
        }
      });
    },
    {
      headers: {
        Authorization: "Bearer " + (await getAccessToken()),
        "Content-Type": "application/json",
      },
    }
  );

  return Photos;
}

export async function listAndStoreMediaFromAlbum() {
  const Token = await getAccessToken();
  const AlbumID = await getSelectedAlbum();

  if (!isAuthenticated() || !Token || !AlbumID) return null;

  console.log("Fetching photos list");

  await MediaItem.drop();
  await MediaItem.sync();

  const url = new URL(
    "https://photoslibrary.googleapis.com/v1/mediaItems:search"
  );

  await APIGet(
    url,
    async (Res) => {
      const ResBody = await Res.json();
      const ResMediaItems = ResBody.mediaItems;
      console.log("Got " + ResMediaItems.length + " mediaItems");

      ResMediaItems.forEach((item) => {
        console.log(item);
        MediaItem.upsert({
          id: item.id,
          albumId: AlbumID,
          productUrl: item.productUrl,
          baseUrl: item.baseUrl,
          mimeType: item.mimeType,
          filename: item.filename,
          creationTime: item.mediaMetadata.creationTime,
          width: item.mediaMetadata.width,
          height: item.mediaMetadata.height,
          photo: item.mediaMetadata.photo != undefined,
          video: item.mediaMetadata.video != undefined,
        });
      });
    },
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + Token,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
      body: JSON.stringify({ pageSize: "100", albumId: AlbumID }),
    }
  );
}

export async function getSelectedAlbum(): Promise<string | null> {
  const Key = await KeyStore.findOne({ where: { Key: KeyNameSelectedAlbum } });
  if (Key === null) return null;
  return Key.Value;
}

export async function setSelectedAlbum(value: string) {
  KeyStore.upsert({
    Key: KeyNameSelectedAlbum,
    Value: value,
  });
}

export async function getAlbums(): Promise<Album[] | null> {
  let Albums: Album[] = new Array();
  const Token = await getAccessToken();

  if (!isAuthenticated() || !Token) return null;

  console.log("Fetching albums list");

  const url = new URL("https://photoslibrary.googleapis.com/v1/albums");

  url.searchParams.append("pageSize", "50");

  await APIGet(
    url,
    async (Res) => {
      const ResBody = await Res.json();
      const ResAlbums: Album[] = ResBody.albums;
      console.log("Got " + ResAlbums.length + " Albums");
      Albums = Albums.concat(ResAlbums);
      console.log("Total " + Albums.length + " Albums so far");
    },
    {
      headers: {
        Authorization: "Bearer " + Token,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    }
  );

  console.log("Recieved albums list " + Albums.length);

  return Albums.length == 0 ? null : Albums;
}

async function APIGet(
  url: URL,
  SuccessfulResHandler: (res: Response) => any,
  init: RequestInit,
  maxRetries = 5,
  maxQuotaRetries = 5,
  tryCount = 0
) {
  const res = await fetch(url, init);

  if (res.status == 200) {
    //console.log(await res.text());

    //success
    await SuccessfulResHandler(res.clone());

    //handle additional pages
    const ResBody = await res.json();

    //temporary to stop following pagination during debugging
    //return;

    if (ResBody.nextPageToken) {
      const newURL = new URL(url);

      if (!init.body) {
        newURL.searchParams.append("pageToken", ResBody.nextPageToken);
      } else {
        init.body = JSON.stringify({
          ...JSON.parse(init.body.toString()),
          pageToken: ResBody.nextPageToken,
        });
      }

      await APIGet(
        newURL,
        SuccessfulResHandler,
        init,
        maxRetries,
        maxQuotaRetries
      );
    }
  } else if (res.status == 429) {
    //API quota issue - delay and try again

    console.log(
      "Error " +
        res.status +
        ". Try " +
        tryCount +
        " of " +
        maxQuotaRetries +
        ". " +
        res.statusText
    );

    if (tryCount >= maxQuotaRetries)
      throw new Error("Maximum API retries reached");
    await new Promise((resolve) =>
      setTimeout(resolve, (0.5 + 0.5 * Math.random()) * (3000 * (2 ^ tryCount)))
    );
    await APIGet(
      url,
      SuccessfulResHandler,
      init,
      maxRetries,
      maxQuotaRetries,
      tryCount + 1
    );
  } else if (res.status >= 400 && res.status <= 599) {
    //some error- delay and try again

    console.log(
      "Error " +
        res.status +
        ". Try " +
        tryCount +
        " of " +
        maxRetries +
        ". " +
        res.statusText
    );

    if (tryCount >= maxRetries) throw new Error("Maximum API retries reached");
    await new Promise((resolve) =>
      setTimeout(resolve, (0.5 + 0.5 * Math.random()) * (1500 * (2 ^ tryCount)))
    );
    await APIGet(
      url,
      SuccessfulResHandler,
      init,
      maxRetries,
      maxQuotaRetries,
      tryCount + 1
    );
  }
}
