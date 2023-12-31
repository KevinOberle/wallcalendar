import dynamic from "next/dynamic";
import PhotoFrame from "./photoFrame";

//Dynamic import to disable server side rendering as this component initally renders the server time and then flickers to client time
const DateTime = dynamic(() => import("./dateTime"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="absolute min-h-screen min-w-full">
        <PhotoFrame />
      </div>
      <div className="min-w-full p-12 text-3xl">
        <DateTime />
      </div>
    </main>
  );
}
