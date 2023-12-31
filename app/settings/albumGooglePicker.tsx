import {
  getAlbums,
  getSelectedAlbum,
  setSelectedAlbum,
  listAndStoreMediaFromAlbum,
} from "@/lib/google/photos";
import DropDown from "./dropDown";

export default async function AlbumGooglePicker() {
  const Albums = await getAlbums();
  const getDefaultValue = await getSelectedAlbum();
  const DefaultValue = await getSelectedAlbum();
  const onChange = async (value: string) => {
    "use server";
    await setSelectedAlbum(value);
    listAndStoreMediaFromAlbum();
  };

  const Options = Albums?.map((item) => ({
    id: item["id"],
    value: item["title"],
  }));

  return (
    <DropDown
      Options={Options}
      onChange={onChange}
      DefaultValue={DefaultValue}
    />
  );
}
