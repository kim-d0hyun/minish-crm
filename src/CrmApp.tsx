import { SplashScreen } from "@/components/common/splash-screen";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomersPage } from "@/features/customers/customers-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { LeadsPage } from "@/features/leads/leads-page";
import { MessagesPage } from "@/features/messages/messages-page";
import { ReportsPage } from "@/features/reports/reports-page";
import { ReservationsPage } from "@/features/reservations/reservations-page";
import { SettingsPage } from "@/features/settings/settings-page";
import { WorkflowCanvasPage } from "@/features/workflows/workflows-canvas-page";
import { WorkflowsPage } from "@/features/workflows/workflows-page";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const CRM_BASE = "https://minish-crm.vercel.app";

function useCrmStyles() {
	useEffect(() => {
		const id = "crm-remote-styles";
		if (document.getElementById(id)) return;
		const link = document.createElement("link");
		link.id = id;
		link.rel = "stylesheet";
		link.href = `${CRM_BASE}/assets/crm-styles.css`;
		document.head.appendChild(link);
		return () => {
			document.getElementById(id)?.remove();
		};
	}, []);
}

export function CrmApp() {
	useCrmStyles();
	return (
		<MemoryRouter initialEntries={["/"]} initialIndex={0}>
			<TooltipProvider>
				<SplashScreen>
					<Routes>
						<Route element={<AppLayout />}>
							<Route path="/" element={<DashboardPage />} />
							<Route path="/customers" element={<CustomersPage />} />
							<Route path="/reservations" element={<ReservationsPage />} />
							<Route path="/messages" element={<MessagesPage />} />
							<Route path="/leads" element={<LeadsPage />} />
							<Route path="/workflows" element={<WorkflowsPage />} />
							<Route path="/workflows/new" element={<WorkflowCanvasPage />} />
							<Route path="/workflows/:id" element={<WorkflowCanvasPage />} />
							<Route path="/reports" element={<ReportsPage />} />
							<Route path="/settings" element={<SettingsPage />} />
						</Route>
					</Routes>
				</SplashScreen>
				<Toaster position="top-right" richColors />
			</TooltipProvider>
		</MemoryRouter>
	);
}
