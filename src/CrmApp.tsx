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
import { MemoryRouter, Route, Routes } from "react-router-dom";

// react-router-dom은 shell과 공유하지 않으므로 자체 MemoryRouter를 사용.
// shell의 BrowserRouter와 완전히 독립된 라우팅 컨텍스트를 가짐.
export function CrmApp() {
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
