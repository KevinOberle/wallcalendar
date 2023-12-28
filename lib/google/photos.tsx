import { json } from "stream/consumers";
import { isAuthenticated, getAccessToken } from "./auth";
import { error } from "console";

export type Album = {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
  mediaItemsCount: number;
};

export async function getAlbums(): Promise<Album[] | null> {
  let Albums: Album[] = new Array();
  const Token = await getAccessToken();

  console.log(Token);

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
    console.log("Got Albums response");
    //console.log(await res.text());

    //success
    await SuccessfulResHandler(res.clone());

    //handle additional pages
    const ResBody = await res.json();

    if (ResBody.nextPageToken) {
      const newURL = new URL(url);
      newURL.searchParams.append("pageToken", ResBody.nextPageToken);
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
      "Error. Try " +
        tryCount +
        " of " +
        maxQuotaRetries +
        ". " +
        res.statusText
    );

    if (tryCount >= maxQuotaRetries)
      throw new Error("Maximum API requests reached");
    await new Promise((resolve) =>
      setTimeout(resolve, (0.5 + 0.5 * Math.random()) * ((3000 * 2) ^ tryCount))
    );
    await APIGet(
      url,
      SuccessfulResHandler,
      init,
      maxRetries,
      maxQuotaRetries,
      tryCount++
    );
  } else if (res.status >= 400 && res.status <= 599) {
    //some error- delay and try again

    console.log(
      "Error. Try " + tryCount + " of " + maxRetries + ". " + res.statusText
    );

    if (tryCount >= maxRetries) throw new Error("Maximum API requests reached");
    await new Promise((resolve) =>
      setTimeout(resolve, (0.5 + 0.5 * Math.random()) * ((300 * 2) ^ tryCount))
    );
    await APIGet(
      url,
      SuccessfulResHandler,
      init,
      maxRetries,
      maxQuotaRetries,
      tryCount++
    );
  }
}
