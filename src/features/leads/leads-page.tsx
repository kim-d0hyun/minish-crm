import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	CalendarDays,
	ChevronRight,
	MessageSquare,
	Phone,
	Plus,
	Search,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Lead {
	id: string;
	name: string;
	phone: string;
	source: string;
	status: "유입" | "상담" | "예약" | "방문";
	interest: string;
	date: string;
	counselor: string;
	note?: string;
}

const initialLeads: Lead[] = [
	{ id: "1", name: "강민서", phone: "010-1111-2222", source: "앱", status: "유입", interest: "피부 관리", date: "2026-03-30", counselor: "-" },
	{ id: "2", name: "윤지호", phone: "010-2222-3333", source: "인스타그램", status: "상담", interest: "전신 마사지", date: "2026-03-29", counselor: "이상담", note: "가격 문의 완료" },
	{ id: "3", name: "임수진", phone: "010-3333-4444", source: "제휴사", status: "예약", interest: "치아 미백", date: "2026-03-28", counselor: "김상담", note: "4/2 13:00 예약 확정" },
	{ id: "4", name: "배성준", phone: "010-4444-5555", source: "검색", status: "상담", interest: "교정 상담", date: "2026-03-28", counselor: "박상담" },
	{ id: "5", name: "조예린", phone: "010-5555-6666", source: "소개", status: "유입", interest: "네일 케어", date: "2026-03-30", counselor: "-" },
	{ id: "6", name: "신동현", phone: "010-6666-7777", source: "앱", status: "방문", interest: "스케일링", date: "2026-03-27", counselor: "이상담", note: "첫 방문 완료, 재예약 의향 있음" },
	{ id: "7", name: "문채원", phone: "010-7777-8888", source: "네이버 블로그", status: "유입", interest: "프리미엄 케어", date: "2026-03-30", counselor: "-" },
	{ id: "8", name: "하정우", phone: "010-8888-9999", source: "검색", status: "상담", interest: "피부 관리", date: "2026-03-29", counselor: "이상담", note: "VIP 전환 가능성 높음" },
	{ id: "9", name: "공효진", phone: "010-9999-0001", source: "소개", status: "예약", interest: "전신 마사지", date: "2026-03-27", counselor: "박상담", note: "4/5 10:00 예약" },
	{ id: "10", name: "류준열", phone: "010-0001-1111", source: "인스타그램", status: "방문", interest: "교정 상담", date: "2026-03-25", counselor: "김상담", note: "3회 방문 완료" },
	{ id: "11", name: "박신혜", phone: "010-1122-3344", source: "앱", status: "유입", interest: "치아 미백", date: "2026-03-30", counselor: "-" },
	{ id: "12", name: "이동욱", phone: "010-2233-4455", source: "제휴사", status: "상담", interest: "전신 마사지", date: "2026-03-28", counselor: "박상담" },
];

const pipelineStages: { label: Lead["status"]; icon: typeof UserPlus; color: string; bg: string }[] = [
	{ label: "유입", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-500" },
	{ label: "상담", icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-500" },
	{ label: "예약", icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-500" },
	{ label: "방문", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500" },
];

const statusStyle: Record<Lead["status"], string> = {
	유입: "bg-blue-100 text-blue-700 border-blue-200",
	상담: "bg-amber-100 text-amber-700 border-amber-200",
	예약: "bg-purple-100 text-purple-700 border-purple-200",
	방문: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const nextStatus: Record<Lead["status"], Lead["status"] | null> = {
	유입: "상담",
	상담: "예약",
	예약: "방문",
	방문: null,
};

const counselors = ["전체", "이상담", "박상담", "김상담"];

export function LeadsPage() {
	const [leads, setLeads] = useState(initialLeads);
	const [search, setSearch] = useState("");
	const [counselorFilter, setCounselorFilter] = useState("전체");
	const [sourceFilter, setSourceFilter] = useState("전체");

	const allSources = ["전체", ...new Set(initialLeads.map((l) => l.source))];

	const filteredLeads = useMemo(() => {
		let data = leads;
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			data = data.filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.interest.toLowerCase().includes(q));
		}
		if (counselorFilter !== "전체") data = data.filter((l) => l.counselor === counselorFilter);
		if (sourceFilter !== "전체") data = data.filter((l) => l.source === sourceFilter);
		return data;
	}, [leads, search, counselorFilter, sourceFilter]);

	const moveToNextStage = (id: string) => {
		setLeads((prev) =>
			prev.map((l) => {
				if (l.id !== id || !nextStatus[l.status]) return l;
				const next = nextStatus[l.status] as Lead["status"];
				toast.success(`${l.name} → ${next} 단계로 이동했습니다.`);
				return { ...l, status: next };
			}),
		);
	};

	const registerLead = () => {
		toast.info("리드 등록 기능은 준비 중입니다.");
	};

	const stageCounts = pipelineStages.reduce(
		(acc, s) => { acc[s.label] = leads.filter((l) => l.status === s.label).length; return acc; },
		{} as Record<Lead["status"], number>,
	);

	// 전환율 계산
	const conversionRate = leads.length > 0
		? Math.round((leads.filter((l) => l.status === "방문").length / leads.length) * 100)
		: 0;

	return (
		<div className="space-y-6">
			<PageHeader
				title="리드 관리"
				description="잠재 고객 파이프라인을 관리합니다"
				actions={
					<Button size="sm" onClick={registerLead}>
						<Plus className="h-4 w-4 mr-2" />
						리드 등록
					</Button>
				}
			/>

			{/* 파이프라인 요약 */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{pipelineStages.map((stage, i) => (
					<Card key={stage.label}>
						<CardContent className="pt-4 pb-4">
							<div className="flex items-center gap-3">
								<div className={cn("rounded-lg p-2", stage.bg)}>
									<stage.icon className="h-4 w-4 text-white" />
								</div>
								<div>
									<p className="text-xl font-bold">{stageCounts[stage.label]}</p>
									<p className="text-xs text-muted-foreground">{stage.label}</p>
								</div>
							</div>
							{i < pipelineStages.length - 1 && (
								<div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
									<ArrowRight className="h-3 w-3" />
									전환률 {stageCounts[stage.label] > 0 ? Math.round((stageCounts[pipelineStages[i + 1].label] / stageCounts[stage.label]) * 100) : 0}%
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* 검색 / 필터 */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative flex-1 max-w-xs">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="이름, 전화번호, 관심 시술..."
						className="pl-9 h-9 text-sm"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<Select value={counselorFilter} onValueChange={setCounselorFilter}>
					<SelectTrigger className="h-9 w-[120px] text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{counselors.map((c) => <SelectItem key={c} value={c} className="text-xs">{c === "전체" ? "전체 담당" : c}</SelectItem>)}
					</SelectContent>
				</Select>
				<Select value={sourceFilter} onValueChange={setSourceFilter}>
					<SelectTrigger className="h-9 w-[130px] text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{allSources.map((s) => <SelectItem key={s} value={s} className="text-xs">{s === "전체" ? "전체 유입" : s}</SelectItem>)}
					</SelectContent>
				</Select>
				<span className="text-xs text-muted-foreground ml-auto">
					{filteredLeads.length}건 · 최종 전환율 {conversionRate}%
				</span>
			</div>

			{/* 칸반 뷰 */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{pipelineStages.map((stage) => {
					const stageLeads = filteredLeads.filter((l) => l.status === stage.label);
					return (
						<div key={stage.label}>
							<div className="flex items-center gap-2 mb-3">
								<div className={cn("h-2.5 w-2.5 rounded-full", stage.bg)} />
								<h3 className="text-sm font-semibold">{stage.label}</h3>
								<Badge variant="secondary" className="text-xs ml-auto">
									{stageLeads.length}
								</Badge>
							</div>
							<div className="space-y-2">
								{stageLeads.map((lead) => (
									<Card key={lead.id} className="cursor-pointer hover:shadow-sm transition-all duration-200">
										<CardContent className="p-3">
											<div className="flex items-center justify-between mb-2">
												<p className="text-sm font-semibold">{lead.name}</p>
												<Badge variant="outline" className={cn("text-xs px-1.5 py-0", statusStyle[lead.status])}>
													{lead.source}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground mb-1.5 font-medium">{lead.interest}</p>
											{lead.note && (
												<p className="text-xs text-muted-foreground bg-muted/60 rounded px-2 py-1 mb-2 line-clamp-2">
													{lead.note}
												</p>
											)}
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<div className="flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{lead.phone}
												</div>
												<span>{lead.date.slice(5)}</span>
											</div>
											{lead.counselor !== "-" && (
												<div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
													<Users className="h-3 w-3" />
													{lead.counselor}
												</div>
											)}
											{nextStatus[lead.status] && (
												<Button
													variant="outline"
													size="sm"
													className="w-full mt-2 h-7 text-xs"
													onClick={() => moveToNextStage(lead.id)}
												>
													<ChevronRight className="h-3 w-3 mr-1" />
													{nextStatus[lead.status]}으로 진행
												</Button>
											)}
										</CardContent>
									</Card>
								))}
								{stageLeads.length === 0 && (
									<div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
										{search || counselorFilter !== "전체" || sourceFilter !== "전체" ? "해당 리드 없음" : "리드 없음"}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
