import dynamic from "next/dynamic";

//Dynamic import to disable server side rendering as this component initally renders the server time and then flickers to client time
const DateTime = dynamic(() => import("./dateTime"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 text-3xl">
      <div className="min-w-full">
        <DateTime />
      </div>
    </main>
  );
}
