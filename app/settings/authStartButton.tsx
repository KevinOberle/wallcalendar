"use client";

import { initiateGoogleAuth } from "@/lib/google/auth";
import { PropsWithChildren } from "react";

export default function AuthStartButton(props: PropsWithChildren) {
  return (
    <button className="btn" onClick={() => initiateGoogleAuth()}>
      {props.children}
    </button>
  );
}
