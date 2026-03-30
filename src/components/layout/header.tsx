import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search } from "lucide-react";

interface HeaderProps {
	onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
	return (
		<header className="flex items-center justify-between h-14 px-6 border-b bg-background shrink-0">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 lg:hidden"
					onClick={onMenuClick}
				>
					<Menu className="h-4 w-4" />
				</Button>
				<div className="relative" style={{ position: "relative" }}>
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
					<Input
						placeholder="검색..."
						className="pl-9 w-64 h-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
						style={{ paddingLeft: 36 }}
					/>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" className="h-8 w-8 relative">
					<Bell className="h-4 w-4" />
					<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
				</Button>
			</div>
		</header>
	);
}
