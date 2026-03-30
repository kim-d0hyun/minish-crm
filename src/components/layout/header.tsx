import { Button } from "@/components/ui/button";
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
				<div style={{ display: "flex", alignItems: "center", width: 256, height: 36, background: "var(--color-muted, #f1f5f9)", borderRadius: 6, padding: "0 12px", gap: 8 }}>
					<Search style={{ width: 16, height: 16, color: "#94a3b8", flexShrink: 0 }} />
					<input
						placeholder="검색..."
						style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "inherit", width: "100%", lineHeight: 1 }}
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
