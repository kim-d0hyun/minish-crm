import { ArrowDown, ArrowUp, Download, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
	{ label: "동의율 (치료 권유 환자 기준)", value: "88.4%", change: "+1.3%", positive: true },
	{ label: "휴면율", value: "12.8%", change: "-1.3%", positive: true },
	{ label: "노쇼율", value: "4.2%", change: "-0.5%", positive: true },
];

const revenueMetrics: KpiMetric[] = [
	{ label: "방문 평균 단가", value: "₩185,000", change: "+₩12,000", positive: true },
	{ label: "이번 달 총 매출", value: "₩32.5M", change: "+8.4%", positive: true },
	{ label: "고액 결제자 비율", value: "18.3%", change: "+2.1%", positive: true },
	{ label: "인당 평균 LTV", value: "₩1.2M", change: "+₩80,000", positive: true },
];

const counselorPerformance = [
	{ name: "이상담", consultations: 87, conversions: 62, rate: "71.3%", revenue: "₩12.8M", confirmedAmount: 9200000, consentCount: 55, consentRate: 88.7, trend: true },
	{ name: "박상담", consultations: 72, conversions: 48, rate: "66.7%", revenue: "₩10.2M", confirmedAmount: 7100000, consentCount: 42, consentRate: 87.5, trend: false },
	{ name: "김상담", consultations: 65, conversions: 41, rate: "63.1%", revenue: "₩9.5M",  confirmedAmount: 6300000, consentCount: 35, consentRate: 85.4, trend: true },
];

const monthlyRetention = [
	{ month: "10월", reVisit: 61.2, dormant: 15.2, noShow: 5.1, consent: 82.3 },
	{ month: "11월", reVisit: 63.4, dormant: 14.1, noShow: 4.8, consent: 83.7 },
	{ month: "12월", reVisit: 64.1, dormant: 14.5, noShow: 4.5, consent: 84.2 },
	{ month: "1월",  reVisit: 65.8, dormant: 13.7, noShow: 4.4, consent: 85.8 },
	{ month: "2월",  reVisit: 66.2, dormant: 13.2, noShow: 4.3, consent: 87.1 },
	{ month: "3월",  reVisit: 67.3, dormant: 12.8, noShow: 4.2, consent: 88.4 },
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

const consentAnalysis = {
	consented: {
		total: 187,
		byOccupation: [
			{ label: "직장인", pct: 38.5 }, { label: "전문직", pct: 24.1 },
			{ label: "자영업", pct: 18.7 }, { label: "주부", pct: 12.3 },
			{ label: "학생", pct: 4.3 },   { label: "기타", pct: 2.1 },
		],
		byRegion: [
			{ label: "서울", pct: 51.3 }, { label: "경기", pct: 36.4 },
			{ label: "인천", pct: 7.5 },  { label: "기타", pct: 4.8 },
		],
		byAge: [
			{ label: "20대", pct: 12.8 }, { label: "30대", pct: 38.5 },
			{ label: "40대", pct: 31.6 }, { label: "50대", pct: 12.3 },
			{ label: "기타", pct: 4.8 },
		],
		maleRatio: 32.1,
	},
	nonConsented: {
		total: 55,
		byOccupation: [
			{ label: "직장인", pct: 29.1 }, { label: "학생", pct: 21.8 },
			{ label: "주부", pct: 18.2 },  { label: "자영업", pct: 16.4 },
			{ label: "전문직", pct: 10.9 }, { label: "기타", pct: 3.6 },
		],
		byRegion: [
			{ label: "서울", pct: 40.0 }, { label: "경기", pct: 41.8 },
			{ label: "인천", pct: 10.9 }, { label: "기타", pct: 7.3 },
		],
		byAge: [
			{ label: "20대", pct: 29.1 }, { label: "30대", pct: 25.5 },
			{ label: "40대", pct: 21.8 }, { label: "50대", pct: 16.4 },
			{ label: "기타", pct: 7.3 },
		],
		maleRatio: 52.7,
	},
};

const formatCurrency = (n: number) => `₩${(n / 1000000).toFixed(1)}M`;

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
								<ArrowUp className="h-3 w-3 text-emerald-500" />
							) : (
								<ArrowDown className="h-3 w-3 text-red-400" />
							)}
							<span className={cn("text-xs font-medium", m.positive ? "text-emerald-600" : "text-red-500")}>{m.change}</span>
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
		<div className="space-y-2.5">
			{data.map((row) => {
				const val = row[valueKey] as number;
				const label = row[labelKey] as string;
				const pct = Math.min((val / maxValue) * 100, 100);
				return (
					<div key={label} className="flex items-center gap-2.5">
						<span className="text-xs text-muted-foreground w-12 shrink-0 text-right">{label}</span>
						<div className="flex-1 h-5 bg-muted/60 rounded-full overflow-hidden">
							<div
								className={cn("h-full rounded-full transition-all duration-500", colorClass)}
								style={{ width: `${Math.max(pct, 2)}%` }}
							/>
						</div>
						<span className="text-xs font-semibold text-foreground w-10 shrink-0">{formatValue(val)}</span>
					</div>
				);
			})}
		</div>
	);
}

function GenderBar({ maleRatio }: { maleRatio: number }) {
	const femaleRatio = 100 - maleRatio;
	return (
		<div className="space-y-1.5 border-t pt-3">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">성별 비율</span>
				<span className="text-foreground font-medium">남 {maleRatio}% · 여 {femaleRatio.toFixed(1)}%</span>
			</div>
			<div className="flex h-2 rounded-full overflow-hidden gap-px">
				<div className="bg-blue-400 rounded-l-full" style={{ width: `${maleRatio}%` }} />
				<div className="bg-pink-400 rounded-r-full" style={{ width: `${femaleRatio}%` }} />
			</div>
			<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
				<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />남성</span>
				<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-400 inline-block" />여성</span>
			</div>
		</div>
	);
}

const insightItems = [
	{
		tag: "핵심 기회",
		stat: "+19.3%p",
		headline: "서울 30-40대 여성 직장인·전문직",
		body: "동의율 72.5%로 전체 평균 대비 가장 높은 그룹입니다. 이 고객군을 집중 관리하면 소개 전환 효과가 큽니다.",
		tagCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
		statCls: "text-emerald-600 dark:text-emerald-400",
	},
	{
		tag: "전략 포인트",
		stat: "84.1%",
		headline: "초진 후 45일 이내 재방문이 핵심",
		body: "재방문 유도에 성공한 고객의 동의율은 84.1%. 팔로업 리마인더와 웰컴 콜이 동의 전환의 가장 강력한 레버입니다.",
		tagCls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
		statCls: "text-sky-600 dark:text-sky-400",
	},
	{
		tag: "개선 필요",
		stat: "5.1×",
		headline: "20대 학생 미동의율 집중 관리",
		body: "미동의 고객 중 20대 학생 비율이 동의 그룹 대비 5.1배 높습니다. 가격 플랜·할부 옵션 등 연령 맞춤 전략이 필요합니다.",
		tagCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
		statCls: "text-amber-600 dark:text-amber-400",
	},
];

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
					<TabsTrigger value="analysis">동의 분석</TabsTrigger>
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
									{ stage: "유입", count: 892, width: 100, color: "bg-slate-700" },
									{ stage: "상담", count: 534, width: 59.8, color: "bg-slate-500" },
									{ stage: "예약", count: 321, width: 36.0, color: "bg-slate-400" },
									{ stage: "방문", count: 287, width: 32.2, color: "bg-primary" },
								].map((s) => (
									<div key={s.stage} className="flex items-center gap-3">
										<span className="text-sm font-medium w-10 shrink-0 text-muted-foreground">{s.stage}</span>
										<div className="flex-1 h-8 bg-muted/60 rounded-full overflow-hidden">
											<div
												className={cn("h-full rounded-full flex items-center px-4 transition-all", s.color)}
												style={{ width: `${s.width}%` }}
											>
												<span className="text-sm text-white font-semibold">{s.count.toLocaleString()}</span>
											</div>
										</div>
										<span className="text-sm font-semibold text-foreground w-14 text-right">{s.width}%</span>
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
											<div className="flex items-center justify-between mb-1.5">
												<span className="text-xs font-medium">{m.month}</span>
												<span className="text-xs text-muted-foreground">노쇼 {m.noShow}% · 휴면 {m.dormant}%</span>
											</div>
											<div className="flex h-2.5 rounded-full overflow-hidden bg-muted/60">
												<div className="bg-red-400 rounded-l-full" style={{ width: `${m.noShow}%` }} />
												<div className="bg-amber-400" style={{ width: `${m.dormant}%` }} />
											</div>
										</div>
									))}
									<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
										<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />노쇼율</span>
										<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />휴면율</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">월별 동의율 추이</CardTitle>
							<p className="text-xs text-muted-foreground">치료를 권유받은 환자 중 실제 동의한 비율 (동의율 = 동의 수 / 권유받은 전체 수 × 100)</p>
						</CardHeader>
						<CardContent>
							<HBarChart
								data={monthlyRetention as unknown as Record<string, unknown>[]}
								valueKey="consent"
								labelKey="month"
								maxValue={100}
								colorClass="bg-emerald-500"
								formatValue={(v) => `${v}%`}
							/>
						</CardContent>
					</Card>
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
								<div className="space-y-2.5">
									{monthlyRevenue.map((m) => (
										<div key={m.month} className="flex items-center gap-2.5">
											<span className="text-xs text-muted-foreground w-10 shrink-0 text-right">{m.month}</span>
											<div className="flex-1 h-7 bg-muted/60 rounded-full overflow-hidden">
												<div
													className="h-full bg-primary rounded-full flex items-center px-3 transition-all"
													style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
												>
													<span className="text-xs text-white font-semibold whitespace-nowrap">
														{(m.revenue / 1000000).toFixed(1)}M
													</span>
												</div>
											</div>
											<span className="text-xs text-muted-foreground w-12 shrink-0 text-right">{m.visits}건</span>
										</div>
									))}
								</div>
								<div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
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
								<div className="space-y-3">
									{revenueByType.map((r) => (
										<div key={r.type}>
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-medium">{r.type}</span>
												<div className="flex items-center gap-2">
													<span className="text-xs text-muted-foreground">{(r.revenue / 1000000).toFixed(1)}M</span>
													<span className="text-xs font-bold text-foreground w-10 text-right">{r.pct}%</span>
												</div>
											</div>
											<div className="h-2 bg-muted/60 rounded-full overflow-hidden">
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
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{counselorPerformance.map((c) => (
							<Card key={c.name}>
								<CardContent className="pt-4">
									<div className="flex items-center justify-between mb-4">
										<p className="font-semibold">{c.name}</p>
										<div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", c.trend ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400")}>
											{c.trend ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
											{c.trend ? "상승" : "하락"}
										</div>
									</div>
									<div className="grid grid-cols-2 gap-x-4 gap-y-3">
										<div>
											<p className="text-xs text-muted-foreground mb-0.5">상담 건수</p>
											<p className="text-xl font-bold">{c.consultations}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-0.5">확정 금액</p>
											<p className="text-xl font-bold">{formatCurrency(c.confirmedAmount)}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-0.5">동의율</p>
											<p className={cn("text-xl font-bold", c.consentRate >= 88 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{c.consentRate}%</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-0.5">전환 건수</p>
											<p className="text-xl font-bold">{c.conversions}</p>
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
										<tr className="border-b">
											<th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">상담 실장</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">상담 건수</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">전환 건수</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">전환율</th>
											<th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">매출 기여</th>
											<th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">확정금액</th>
											<th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">동의율</th>
										</tr>
									</thead>
									<tbody>
										{counselorPerformance.map((c) => (
											<tr key={c.name} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
												<td className="py-3 px-4 font-semibold">{c.name}</td>
												<td className="py-3 px-4 text-center text-muted-foreground">{c.consultations}</td>
												<td className="py-3 px-4 text-center text-muted-foreground">{c.conversions}</td>
												<td className="py-3 px-4 text-center">
													<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{c.rate}</span>
												</td>
												<td className="py-3 px-4 text-right font-medium">{c.revenue}</td>
												<td className="py-3 px-4 text-right font-semibold">{formatCurrency(c.confirmedAmount)}</td>
												<td className="py-3 px-4 text-center">
													<span className={cn("font-semibold", c.consentRate >= 88 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{c.consentRate}%</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 동의 분석 ── */}
				<TabsContent value="analysis" className="mt-4 space-y-5">
					{/* 정의 배너 */}
					<div className="flex items-start gap-3.5 rounded-xl border bg-card p-4">
						<div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
							<span className="text-blue-600 dark:text-blue-400 text-sm font-bold leading-none">i</span>
						</div>
						<div className="space-y-0.5">
							<p className="text-sm font-semibold text-foreground">동의율 계산 기준</p>
							<p className="text-sm text-muted-foreground">
								동의율(%) ={" "}
								<span className="font-semibold text-foreground">치료 권유 후 실제 동의한 수</span>
								{" "}÷{" "}
								<span className="font-semibold text-foreground">치료 권유받은 전체 수</span>
								{" "}× 100
							</p>
							<p className="text-xs text-muted-foreground">단순 내원·검진 환자는 분모에서 제외됩니다.</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						{/* 동의 고객 프로필 */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">동의 고객 프로필</CardTitle>
									<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{consentAnalysis.consented.total}명</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="text-center py-2">
									<p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">88.4%</p>
									<p className="text-xs text-muted-foreground mt-1.5">치료 권유 환자 기준 동의율</p>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">직업군</p>
									<HBarChart
										data={consentAnalysis.consented.byOccupation as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-emerald-500"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">지역</p>
									<HBarChart
										data={consentAnalysis.consented.byRegion as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-emerald-500"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">연령대</p>
									<HBarChart
										data={consentAnalysis.consented.byAge as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-emerald-500"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<GenderBar maleRatio={consentAnalysis.consented.maleRatio} />
							</CardContent>
						</Card>

						{/* 미동의 고객 프로필 */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">미동의 고객 프로필</CardTitle>
									<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{consentAnalysis.nonConsented.total}명</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="text-center py-2">
									<p className="text-5xl font-bold text-rose-500 dark:text-rose-400 tabular-nums">11.6%</p>
									<p className="text-xs text-muted-foreground mt-1.5">미동의율</p>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">직업군</p>
									<HBarChart
										data={consentAnalysis.nonConsented.byOccupation as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-rose-400"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">지역</p>
									<HBarChart
										data={consentAnalysis.nonConsented.byRegion as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-rose-400"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">연령대</p>
									<HBarChart
										data={consentAnalysis.nonConsented.byAge as unknown as Record<string, unknown>[]}
										valueKey="pct"
										labelKey="label"
										maxValue={100}
										colorClass="bg-rose-400"
										formatValue={(v) => `${v}%`}
									/>
								</div>

								<GenderBar maleRatio={consentAnalysis.nonConsented.maleRatio} />
							</CardContent>
						</Card>
					</div>

					{/* 인사이트 */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-3">인사이트</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{insightItems.map((insight) => (
								<div key={insight.tag} className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-sm transition-shadow">
									<div className="flex items-start justify-between gap-2">
										<span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0", insight.tagCls)}>
											{insight.tag}
										</span>
										<span className={cn("text-2xl font-bold tabular-nums leading-none", insight.statCls)}>
											{insight.stat}
										</span>
									</div>
									<div>
										<p className="text-sm font-semibold text-foreground leading-snug">{insight.headline}</p>
										<p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{insight.body}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
