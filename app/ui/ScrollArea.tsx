"use client";

import * as React from "react";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area"
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 h-full w-full overflow-y-auto overflow-x-hidden rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
      >
        {children}
      </div>
      <ScrollBar />
      <div data-slot="scroll-area-corner" className="absolute size-2" />
    </div>
  );
}

function ScrollBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area-scrollbar"
      className={`flex touch-none p-px transition-colors select-none h-full w-2.5 border-l border-l-transparent ${className}`}
        {...props}
    />
  );
}

export { ScrollArea, ScrollBar };
