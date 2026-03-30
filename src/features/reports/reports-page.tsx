import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Download, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface KpiMetric {
	label: string;
	value: string;
	change: string;
	positive: boolean;
}

const funnelMetrics: KpiMetric[] = [
	{ label: "유입 → 상담 전환율", value: "59.8%", change: "+3.2%", positive: true },
	{ label: "상담 → 예약 전환율", value: "60.1%", change: "+1.5%", positive: true },
	{ label: "예약 → 방문 전환율", value: "89.4%", change: "-0.8%", positive: false },
	{ label: "전체 전환율", value: "32.2%", change: "+2.1%", positive: true },
];

const retentionMetrics: KpiMetric[] = [
	{ label: "재방문율", value: "67.3%", change: "+2.1%", positive: true },
	{ label: "휴면율", value: "12.8%", change: "-1.3%", positive: true },
	{ label: "노쇼율", value: "4.2%", change: "-0.5%", positive: true },
	{ label: "평균 방문 주기", value: "28일", change: "-3일", positive: true },
];

const revenueMetrics: KpiMetric[] = [
	{ label: "방문 평균 단가", value: "₩185,000", change: "+₩12,000", positive: true },
	{ label: "이번 달 총 매출", value: "₩32.5M", change: "+8.4%", positive: true },
	{ label: "고액 결제자 비율", value: "18.3%", change: "+2.1%", positive: true },
	{ label: "인당 평균 LTV", value: "₩1.2M", change: "+₩80,000", positive: true },
];

const counselorPerformance = [
	{ name: "이상담", consultations: 87, conversions: 62, rate: "71.3%", revenue: "₩12.8M", trend: true },
	{ name: "박상담", consultations: 72, conversions: 48, rate: "66.7%", revenue: "₩10.2M", trend: false },
	{ name: "김상담", consultations: 65, conversions: 41, rate: "63.1%", revenue: "₩9.5M", trend: true },
];

const monthlyRetention = [
	{ month: "10월", reVisit: 61.2, dormant: 15.2, noShow: 5.1 },
	{ month: "11월", reVisit: 63.4, dormant: 14.1, noShow: 4.8 },
	{ month: "12월", reVisit: 64.1, dormant: 14.5, noShow: 4.5 },
	{ month: "1월", reVisit: 65.8, dormant: 13.7, noShow: 4.4 },
	{ month: "2월", reVisit: 66.2, dormant: 13.2, noShow: 4.3 },
	{ month: "3월", reVisit: 67.3, dormant: 12.8, noShow: 4.2 },
];

const monthlyRevenue = [
	{ month: "10월", revenue: 24500000, visits: 142 },
	{ month: "11월", revenue: 27200000, visits: 158 },
	{ month: "12월", revenue: 29800000, visits: 171 },
	{ month: "1월", revenue: 28600000, visits: 164 },
	{ month: "2월", revenue: 30100000, visits: 172 },
	{ month: "3월", revenue: 32500000, visits: 183 },
];

const revenueByType = [
	{ type: "피부 관리", revenue: 9800000, pct: 30.2 },
	{ type: "전신 마사지", revenue: 7200000, pct: 22.2 },
	{ type: "프리미엄 케어", revenue: 6500000, pct: 20.0 },
	{ type: "치아 미백", revenue: 4200000, pct: 12.9 },
	{ type: "교정 상담", revenue: 2800000, pct: 8.6 },
	{ type: "기타", revenue: 2000000, pct: 6.2 },
];

function MetricGrid({ metrics }: { metrics: KpiMetric[] }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{metrics.map((m) => (
				<Card key={m.label}>
					<CardContent className="pt-5 pb-5">
						<p className="text-xs text-muted-foreground mb-1">{m.label}</p>
						<p className="text-2xl font-bold">{m.value}</p>
						<div className="flex items-center gap-1 mt-1">
							{m.positive ? (
								<ArrowUp className="h-3 w-3 text-emerald-600" />
							) : (
								<ArrowDown className="h-3 w-3 text-red-500" />
							)}
							<span className={cn("text-xs", m.positive ? "text-emerald-600" : "text-red-500")}>{m.change}</span>
							<span className="text-xs text-muted-foreground">vs 전월</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function HBarChart({
	data,
	valueKey,
	labelKey,
	maxValue,
	colorClass,
	formatValue,
}: {
	data: Record<string, unknown>[];
	valueKey: string;
	labelKey: string;
	maxValue: number;
	colorClass: string;
	formatValue: (v: number) => string;
}) {
	return (
		<div className="space-y-3">
			{data.map((row) => {
				const val = row[valueKey] as number;
				const label = row[labelKey] as string;
				const pct = Math.min((val / maxValue) * 100, 100);
				return (
					<div key={label} className="flex items-center gap-3">
						<span className="text-xs text-muted-foreground w-12 shrink-0 text-right">{label}</span>
						<div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
							<div
								className={cn("h-full rounded-md flex items-center px-3 transition-all", colorClass)}
								style={{ width: `${pct}%` }}
							>
								<span className="text-xs text-white font-semibold whitespace-nowrap">{formatValue(val)}</span>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function ReportsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = searchParams.get("tab") ?? "funnel";
	const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));
	const maxRetention = 80;

	return (
		<div className="space-y-6">
			<PageHeader
				title="리포트"
				description="CRM 운영 성과를 분석합니다"
				actions={
					<Button variant="outline" size="sm" onClick={() => toast.success("리포트를 다운로드했습니다.")}>
						<Download className="h-4 w-4 mr-2" />
						리포트 다운로드
					</Button>
				}
			/>

			<Tabs value={tab} onValueChange={(v: string) => { const n = new URLSearchParams(searchParams); if (v === "funnel") { n.delete("tab"); } else { n.set("tab", v); } setSearchParams(n); }}>
				<TabsList>
					<TabsTrigger value="funnel">전환 분석</TabsTrigger>
					<TabsTrigger value="retention">리텐션</TabsTrigger>
					<TabsTrigger value="revenue">매출 분석</TabsTrigger>
					<TabsTrigger value="counselor">상담 실장 성과</TabsTrigger>
				</TabsList>

				{/* ── 전환 분석 ── */}
				<TabsContent value="funnel" className="mt-4 space-y-5">
					<MetricGrid metrics={funnelMetrics} />
					<Card>
						<CardHeader>
							<CardTitle className="text-base">전환 퍼널 (이번 달)</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{ stage: "유입", count: 892, width: "100%", color: "bg-slate-700" },
									{ stage: "상담", count: 534, width: "59.8%", color: "bg-slate-600" },
									{ stage: "예약", count: 321, width: "36.0%", color: "bg-slate-500" },
									{ stage: "방문", count: 287, width: "32.2%", color: "bg-primary" },
								].map((s) => (
									<div key={s.stage} className="flex items-center gap-4">
										<span className="text-sm font-medium w-12 shrink-0">{s.stage}</span>
										<div className="flex-1 h-9 bg-muted rounded-md overflow-hidden">
											<div
												className={cn("h-full rounded-md flex items-center px-4 transition-all", s.color)}
												style={{ width: s.width }}
											>
												<span className="text-sm text-white font-semibold">{s.count.toLocaleString()}</span>
											</div>
										</div>
										<span className="text-sm text-muted-foreground w-14 text-right font-medium">{s.width}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 리텐션 ── */}
				<TabsContent value="retention" className="mt-4 space-y-5">
					<MetricGrid metrics={retentionMetrics} />

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">월별 재방문율 추이</CardTitle>
							</CardHeader>
							<CardContent>
								<HBarChart
									data={monthlyRetention as unknown as Record<string, unknown>[]}
									valueKey="reVisit"
									labelKey="month"
									maxValue={maxRetention}
									colorClass="bg-primary"
									formatValue={(v) => `${v}%`}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">월별 노쇼율 · 휴면율</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{monthlyRetention.map((m) => (
										<div key={m.month}>
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-medium">{m.month}</span>
												<span className="text-xs text-muted-foreground">노쇼 {m.noShow}% · 휴면 {m.dormant}%</span>
											</div>
											<div className="flex h-3 rounded-full overflow-hidden bg-muted">
												<div className="bg-red-400" style={{ width: `${m.noShow}%` }} title={`노쇼 ${m.noShow}%`} />
												<div className="bg-amber-400 ml-0.5" style={{ width: `${m.dormant}%` }} title={`휴면 ${m.dormant}%`} />
											</div>
										</div>
									))}
									<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" />노쇼율</div>
										<div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />휴면율</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* ── 매출 분석 ── */}
				<TabsContent value="revenue" className="mt-4 space-y-5">
					<MetricGrid metrics={revenueMetrics} />

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">월별 매출 추이</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{monthlyRevenue.map((m) => (
										<div key={m.month} className="flex items-center gap-3">
											<span className="text-xs text-muted-foreground w-10 shrink-0 text-right">{m.month}</span>
											<div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
												<div
													className="h-full bg-primary rounded-md flex items-center px-3 transition-all"
													style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
												>
													<span className="text-xs text-white font-semibold whitespace-nowrap">
														{(m.revenue / 1000000).toFixed(1)}M
													</span>
												</div>
											</div>
											<span className="text-xs text-muted-foreground w-14 shrink-0 text-right">{m.visits}건</span>
										</div>
									))}
								</div>
								<div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
									최근 6개월 평균 {((monthlyRevenue.reduce((s, m) => s + m.revenue, 0) / 6) / 1000000).toFixed(1)}M 원
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">시술 유형별 매출 비중</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2.5">
									{revenueByType.map((r) => (
										<div key={r.type}>
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-medium">{r.type}</span>
												<div className="flex items-center gap-2">
													<span className="text-xs text-muted-foreground">{(r.revenue / 1000000).toFixed(1)}M</span>
													<span className="text-xs font-semibold w-10 text-right">{r.pct}%</span>
												</div>
											</div>
											<div className="h-2.5 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-primary/70 rounded-full"
													style={{ width: `${r.pct}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* ── 상담 실장 성과 ── */}
				<TabsContent value="counselor" className="mt-4 space-y-5">
					{/* 요약 카드 */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{counselorPerformance.map((c) => (
							<Card key={c.name}>
								<CardContent className="pt-4">
									<div className="flex items-center justify-between mb-3">
										<p className="font-semibold">{c.name}</p>
										<div className={cn("flex items-center gap-1 text-xs", c.trend ? "text-emerald-600" : "text-red-500")}>
											{c.trend ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
											{c.trend ? "상승" : "하락"}
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<p className="text-xs text-muted-foreground">상담 건수</p>
											<p className="text-lg font-bold">{c.consultations}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">전환율</p>
											<p className="text-lg font-bold text-emerald-600">{c.rate}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">전환 건수</p>
											<p className="text-lg font-bold">{c.conversions}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">매출 기여</p>
											<p className="text-lg font-bold">{c.revenue}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">상담 실장별 상세 KPI</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b bg-muted/40">
											<th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">상담 실장</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">상담 건수</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">전환 건수</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">전환율</th>
											<th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">매출 기여</th>
										</tr>
									</thead>
									<tbody>
										{counselorPerformance.map((c) => (
											<tr key={c.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
												<td className="py-3 px-4 font-medium">{c.name}</td>
												<td className="py-3 px-4 text-center">{c.consultations}</td>
												<td className="py-3 px-4 text-center">{c.conversions}</td>
												<td className="py-3 px-4 text-center">
													<span className="text-emerald-600 font-semibold">{c.rate}</span>
												</td>
												<td className="py-3 px-4 text-right font-semibold">{c.revenue}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
