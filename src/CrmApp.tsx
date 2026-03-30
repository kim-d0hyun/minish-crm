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
import { Route, Routes } from "react-router-dom";

// Router를 포함하지 않음 — shell의 BrowserRouter를 그대로 사용.
// shell의 Route path="*" 아래에 마운트되므로 Routes만 있으면 됨.
export function CrmApp() {
	return (
		<TooltipProvider>
			<SplashScreen>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index element={<DashboardPage />} />
						<Route path="customers" element={<CustomersPage />} />
						<Route path="reservations" element={<ReservationsPage />} />
						<Route path="messages" element={<MessagesPage />} />
						<Route path="leads" element={<LeadsPage />} />
						<Route path="workflows" element={<WorkflowsPage />} />
						<Route path="workflows/new" element={<WorkflowCanvasPage />} />
						<Route path="workflows/:id" element={<WorkflowCanvasPage />} />
						<Route path="reports" element={<ReportsPage />} />
						<Route path="settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</SplashScreen>
			<Toaster position="top-right" richColors />
		</TooltipProvider>
	);
}
