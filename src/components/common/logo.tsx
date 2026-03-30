import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	showText?: boolean;
}

const sizeMap = {
	sm: "h-7 w-7",
	md: "h-9 w-9",
	lg: "h-14 w-14",
};

const textSizeMap = {
	sm: "text-base",
	md: "text-lg",
	lg: "text-2xl",
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<div
				className={cn(
					"rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold",
					sizeMap[size],
				)}
			>
				<span className={size === "lg" ? "text-lg" : "text-xs"}>M</span>
			</div>
			{showText && (
				<span
					className={cn(
						"font-semibold tracking-tight text-foreground",
						textSizeMap[size],
					)}
				>
					MINISH CRM
				</span>
			)}
		</div>
	);
}
