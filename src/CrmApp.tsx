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
import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const CRM_BASE = "https://minish-crm.vercel.app";
const STYLE_ID = "crm-remote-styles";
const STYLE_HREF = `${CRM_BASE}/assets/crm-styles.css`;

function loadCrmStyles(): Promise<void> {
	return new Promise((resolve) => {
		// 이미 로드된 경우 즉시 resolve
		const existing = document.getElementById(STYLE_ID) as HTMLLinkElement | null;
		if (existing) {
			if (existing.sheet) resolve();
			else existing.addEventListener("load", () => resolve(), { once: true });
			return;
		}
		const link = document.createElement("link");
		link.id = STYLE_ID;
		link.rel = "stylesheet";
		link.href = STYLE_HREF;
		link.addEventListener("load", () => resolve(), { once: true });
		link.addEventListener("error", () => resolve(), { once: true }); // 실패해도 진행
		document.head.appendChild(link);
	});
}

export function CrmApp() {
	const [ready, setReady] = useState(() => {
		// 이미 로드되어 있으면 바로 ready
		const el = document.getElementById(STYLE_ID) as HTMLLinkElement | null;
		return !!(el?.sheet);
	});

	useEffect(() => {
		if (ready) return;
		loadCrmStyles().then(() => setReady(true));
	}, [ready]);

	if (!ready) return null;

	return (
		<MemoryRouter initialEntries={["/"]} initialIndex={0}>
			<TooltipProvider>
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
				<Toaster position="top-right" richColors />
			</TooltipProvider>
		</MemoryRouter>
	);
}
