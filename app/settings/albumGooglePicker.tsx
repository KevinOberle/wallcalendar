import { getAlbums } from "@/lib/google/photos";
import DropDown from "./dropDown";
import { KeyStore } from "@/lib/db";

const KeyName = "Service.Google.AlbumID";

export default async function AlbumGooglePicker() {
  const Albums = await getAlbums();
  const getDefaultValue = async (): Promise<string | null> => {
    const Key = await KeyStore.findOne({ where: { Key: KeyName } });
    if (Key === null) return null;
    return Key.value;
  };
  const DefaultValue = await getDefaultValue();

  const Options = Albums?.map((item) => ({
    id: item["id"],
    value: item["title"],
  }));

  return (
    <DropDown
      Options={Options}
      onChange={async (value: string) => {
        "use server";
        KeyStore.upsert({
          Key: KeyName,
          Value: value,
        });
      }}
      DefaultValue={DefaultValue}
    />
  );
}
