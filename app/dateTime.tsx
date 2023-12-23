"use client";

import { useEffect, useState } from "react";

export default function DateTime() {
  var [date, setDate] = useState(new Date());
  useEffect(() => {
    var timer = setInterval(() => setDate(new Date()), 1000);

    return function cleanup() {
      clearInterval(timer);
    };
  });

  const displayTime =
    String(date.getHours()) + ":" + String(date.getMinutes()).padStart(2, "0");

  const displayDate = date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="text-6xl">{displayTime}</div>
      <div className="text-3xl">{displayDate}</div>
    </div>
  );
}
