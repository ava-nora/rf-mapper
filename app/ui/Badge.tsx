import * as React from "react";

const badgeVariants = (variant: string) => {
    return `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden ${variant}`;
};

function Badge({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<"span"> &
    { variant: string }) {
    return (
        <span
            data-slot="badge"
            className={`${badgeVariants(variant)} ${className}`}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
