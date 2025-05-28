"use client";

import { useState } from "react";
import Image from "next/image";
import type { TicketButtonProps } from "./types/TicketButton.types";

export default function TicketButton({
  children,
  ticketType,
  price,
  onCountChange,
}: TicketButtonProps) {
  const [count, setCount] = useState<number>(0);

  function handleIncrement() {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange(ticketType, newCount);
  }

  function handleDecrement() {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      onCountChange(ticketType, newCount);
    }
  }

  return (
    <div className="flex items-center justify-between w-full max-w-sm p-4 mb-3 border border-kino-grey bg-kino-black rounded-lg">
      <div className="flex flex-col">
        <div className="text-lg font-medium">{children}</div>
        <div className="text-sm italic">{price} SEK</div>
      </div>
      <div className="flex items-center">
        <button
          onClick={handleDecrement}
          className="flex items-center justify-center w-8 h-8 bg-kino-darkred rounded-md cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Image src="/minus-icon.svg" alt="Decrease" width={14} height={14} />
        </button>
        <div className="w-10 h-8 mx-2 flex items-center justify-center border">
          {count}
        </div>
        <button
          onClick={handleIncrement}
          className="flex items-center justify-center w-8 h-8 bg-kino-darkred rounded-md cursor-pointer"
          aria-label="Increase quantity"
        >
          <Image src="/plus-icon.svg" alt="Increase" width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
