import dynamic from "next/dynamic";
import PhotoFrame from "./photoFrame";

//Dynamic import to disable server side rendering as this component initally renders the server time and then flickers to client time
const DateTime = dynamic(() => import("./dateTime"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="absolute min-h-screen min-w-full bg-neutral">
        <PhotoFrame />
      </div>
      <div className="absolute min-w-full p-12">
        <DateTime />
      </div>
    </main>
  );
}
