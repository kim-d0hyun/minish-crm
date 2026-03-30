import { Logo } from "@/components/common/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	BarChart3,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	GitBranch,
	LayoutDashboard,
	type LucideIcon,
	MessageSquare,
	Settings,
	UserPlus,
	Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
	label: string;
	icon: LucideIcon;
	path: string;
}

const mainNav: NavItem[] = [
	{ label: "대시보드", icon: LayoutDashboard, path: "/" },
	{ label: "고객 관리", icon: Users, path: "/customers" },
	{ label: "예약 관리", icon: CalendarDays, path: "/reservations" },
	{ label: "메시지", icon: MessageSquare, path: "/messages" },
	{ label: "리드 관리", icon: UserPlus, path: "/leads" },
	{ label: "워크플로우", icon: GitBranch, path: "/workflows" },
	{ label: "리포트", icon: BarChart3, path: "/reports" },
];

const bottomNav: NavItem[] = [
	{ label: "설정", icon: Settings, path: "/settings" },
];

interface SidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

function SidebarNavItem({
	item,
	collapsed,
}: { item: NavItem; collapsed: boolean }) {
	const location = useLocation();
	const isActive =
		item.path === "/"
			? location.pathname === "/"
			: location.pathname.startsWith(item.path);

	const link = (
		<NavLink
			to={item.path}
			className={cn(
				"relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
				collapsed && "justify-center px-2",
				isActive
					? "bg-primary/10 text-primary font-semibold"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			)}
		>
			{isActive && (
				<motion.div
					layoutId="sidebar-active"
					className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
					transition={{ type: "spring", stiffness: 350, damping: 30 }}
				/>
			)}
			<item.icon
				className={cn(
					"h-[18px] w-[18px] shrink-0 transition-colors",
					isActive ? "text-primary" : "text-muted-foreground", "transition-colors duration-200",
				)}
			/>
			<AnimatePresence mode="wait">
				{!collapsed && (
					<motion.span
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: "auto" }}
						exit={{ opacity: 0, width: 0 }}
						transition={{ duration: 0.15 }}
						className="overflow-hidden whitespace-nowrap"
					>
						{item.label}
					</motion.span>
				)}
			</AnimatePresence>
		</NavLink>
	);

	if (collapsed) {
		return (
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>{link}</TooltipTrigger>
				<TooltipContent side="right" sideOffset={10}>
					{item.label}
				</TooltipContent>
			</Tooltip>
		);
	}

	return link;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
	return (
		<motion.aside
			animate={{ width: collapsed ? 68 : 240 }}
			transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
			className="flex flex-col h-screen bg-sidebar-background border-r border-sidebar-border overflow-hidden"
		>
			<div
				className={cn(
					"flex items-center h-14 px-4 shrink-0",
					collapsed ? "justify-center" : "justify-between",
				)}
			>
				<AnimatePresence mode="wait">
					{collapsed ? (
						<motion.div
							key="collapsed-logo"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-lg"
								onClick={onToggle}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</motion.div>
					) : (
						<motion.div
							key="expanded-logo"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="flex items-center justify-between w-full"
						>
							<Logo size="sm" />
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-lg hover:bg-muted"
								onClick={onToggle}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<Separator />

			<ScrollArea className="flex-1 px-3 py-3">
				<nav className="space-y-0.5">
					{mainNav.map((item) => (
						<SidebarNavItem
							key={item.path}
							item={item}
							collapsed={collapsed}
						/>
					))}
				</nav>
			</ScrollArea>

			<div className="px-3 pb-2">
				<nav className="space-y-0.5">
					{bottomNav.map((item) => (
						<SidebarNavItem
							key={item.path}
							item={item}
							collapsed={collapsed}
						/>
					))}
				</nav>
			</div>

			<Separator />

			<div
				className={cn(
					"flex items-center gap-3 p-3 shrink-0",
					collapsed && "justify-center",
				)}
			>
				<Avatar className="h-8 w-8 shrink-0">
					<AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
						관
					</AvatarFallback>
				</Avatar>
				<AnimatePresence>
					{!collapsed && (
						<motion.div
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: "auto" }}
							exit={{ opacity: 0, width: 0 }}
							transition={{ duration: 0.15 }}
							className="flex-1 min-w-0 overflow-hidden"
						>
							<p className="text-sm font-medium truncate">관리자</p>
							<p className="text-xs text-muted-foreground truncate">
								admin@minish.com
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.aside>
	);
}
