import { isAuthenticated } from "@/lib/google/auth";
import AuthStartButton from "./authStartButton";
import { Suspense } from "react";
import AlbumGooglePicker from "./albumGooglePicker";

export default async function Settings() {
  const googleAuthenticated = await isAuthenticated();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="min-w-full prose">
        <h1>Settings</h1>
        <h2>Google Account</h2>
        <Suspense
          fallback={
            <span className="loading loading-spinner loading-lg"></span>
          }
        >
          {!googleAuthenticated ? (
            <AuthStartButton>Start</AuthStartButton>
          ) : (
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Select photo album to use</span>
              </div>
              <AlbumGooglePicker />
            </label>
          )}
        </Suspense>
      </div>
    </main>
  );
}
