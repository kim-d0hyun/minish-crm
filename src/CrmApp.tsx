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

// Federation용 진입점 — shell이 이 컴포넌트를 lazy import해서 마운트함.
// BrowserRouter 대신 MemoryRouter를 사용해 shell의 라우터와 충돌하지 않음.
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
