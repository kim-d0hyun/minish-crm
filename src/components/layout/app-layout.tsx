import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

export function AppLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const toggleSidebar = useCallback(() => setCollapsed((v) => !v), []);
	const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Desktop sidebar */}
			<div className="hidden lg:flex">
				<Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
			</div>

			{/* Mobile sidebar */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent side="left" className="p-0 w-[240px]">
					<Sidebar collapsed={false} onToggle={toggleMobile} />
				</SheetContent>
			</Sheet>

			<div className="flex-1 flex flex-col min-w-0">
				<Header onMenuClick={toggleMobile} />
				<div className="flex-1 overflow-y-auto">
					<main className="p-6">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
}
