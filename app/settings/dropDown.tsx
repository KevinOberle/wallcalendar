"use client";

import { ChangeEventHandler, useState } from "react";

export default function DropDown(props: {
  Options: undefined | { id: string; value: string }[];
  DefaultValue: null | string;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState(
    props.DefaultValue === null ? "" : props.DefaultValue
  );

  return (
    <select
      className="select select-bordered"
      onChange={(event) => {
        setSelected(event.currentTarget.value);
        if (props.onChange !== undefined)
          props.onChange(event.currentTarget.value);
      }}
      value={selected}
    >
      <option disabled value="">
        Pick one
      </option>
      {props.Options !== undefined
        ? props.Options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.value}
            </option>
          ))
        : ""}
    </select>
  );
}
