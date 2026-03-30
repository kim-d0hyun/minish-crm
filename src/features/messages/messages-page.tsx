import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
	CheckCircle2,
	Clock,
	FileText,
	MessageSquare,
	Plus,
	Search,
	Send,
	User,
	XCircle,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface MessageTemplate {
	id: string;
	name: string;
	category: string;
	preview: string;
	variables: string[];
}

interface AutoTrigger {
	id: string;
	name: string;
	trigger: string;
	message: string;
	active: boolean;
	sent: number;
	lastRun?: string;
}

interface SendHistory {
	id: string;
	templateName: string;
	recipient: string;
	sentAt: string;
	trigger: string;
	status: "성공" | "실패";
}

const templates: MessageTemplate[] = [
	{
		id: "1",
		name: "방문 완료 감사",
		category: "사후관리",
		preview: "{{고객명}}님, 오늘 방문해 주셔서 감사합니다. {{시술명}} 후 궁금한 점이 있으시면 언제든 연락주세요.",
		variables: ["고객명", "시술명"],
	},
	{
		id: "2",
		name: "재방문 유도",
		category: "마케팅",
		preview: "{{고객명}}님, 마지막 방문 후 {{경과일}}일이 지났습니다. 특별 할인 혜택으로 다시 뵙고 싶습니다.",
		variables: ["고객명", "경과일"],
	},
	{
		id: "3",
		name: "예약 확인",
		category: "예약",
		preview: "{{고객명}}님, {{날짜}} {{시간}}에 {{시술명}} 예약이 확정되었습니다.",
		variables: ["고객명", "날짜", "시간", "시술명"],
	},
	{
		id: "4",
		name: "시술 경과 확인",
		category: "사후관리",
		preview: "{{고객명}}님, {{시술명}} 후 {{경과일}}일이 되었습니다. 경과가 어떠신가요?",
		variables: ["고객명", "시술명", "경과일"],
	},
	{
		id: "5",
		name: "생일 축하",
		category: "관계관리",
		preview: "{{고객명}}님, 생일을 진심으로 축하드립니다! 특별한 혜택을 준비했습니다.",
		variables: ["고객명"],
	},
	{
		id: "6",
		name: "VIP 감사 메시지",
		category: "관계관리",
		preview: "{{고객명}}님, 저희 클럽미니쉬의 소중한 VIP 고객으로서 특별 혜택을 안내드립니다.",
		variables: ["고객명"],
	},
];

const initialTriggers: AutoTrigger[] = [
	{ id: "1", name: "방문 완료 후 감사 메시지", trigger: "방문 완료 처리 직후", message: "방문 완료 감사 템플릿", active: true, sent: 234, lastRun: "2026-03-30 14:22" },
	{ id: "2", name: "시술 3일 후 경과 확인", trigger: "시술 완료 3일 후", message: "시술 경과 확인 템플릿", active: true, sent: 187, lastRun: "2026-03-28 10:05" },
	{ id: "3", name: "90일 미방문 재방문 유도", trigger: "마지막 방문 후 90일 경과", message: "재방문 유도 템플릿", active: true, sent: 56, lastRun: "2026-03-25 09:00" },
	{ id: "4", name: "예약 전일 리마인더", trigger: "예약 1일 전 오전 10시", message: "예약 확인 템플릿", active: false, sent: 412, lastRun: "2026-03-29 10:00" },
	{ id: "5", name: "생일 축하 메시지", trigger: "생일 당일 오전 9시", message: "생일 축하 템플릿", active: true, sent: 89, lastRun: "2026-03-30 09:02" },
];

const sendHistory: SendHistory[] = [
	{ id: "1", templateName: "방문 완료 감사", recipient: "김서연", sentAt: "2026-03-30 14:22", trigger: "방문 완료", status: "성공" },
	{ id: "2", templateName: "방문 완료 감사", recipient: "정하은", sentAt: "2026-03-30 11:45", trigger: "방문 완료", status: "성공" },
	{ id: "3", templateName: "생일 축하", recipient: "이준호", sentAt: "2026-03-30 09:02", trigger: "생일", status: "성공" },
	{ id: "4", templateName: "시술 경과 확인", recipient: "박민지", sentAt: "2026-03-28 10:05", trigger: "3일 경과", status: "성공" },
	{ id: "5", templateName: "시술 경과 확인", recipient: "한지수", sentAt: "2026-03-28 10:05", trigger: "3일 경과", status: "실패" },
	{ id: "6", templateName: "재방문 유도", recipient: "강민수", sentAt: "2026-03-25 09:00", trigger: "90일 미방문", status: "성공" },
	{ id: "7", templateName: "예약 확인", recipient: "최윤서", sentAt: "2026-03-29 10:00", trigger: "예약 전일", status: "성공" },
	{ id: "8", templateName: "방문 완료 감사", recipient: "오세훈", sentAt: "2026-03-27 16:30", trigger: "방문 완료", status: "성공" },
	{ id: "9", templateName: "재방문 유도", recipient: "한지수", sentAt: "2026-03-20 09:00", trigger: "90일 미방문", status: "성공" },
	{ id: "10", templateName: "시술 경과 확인", recipient: "김태희", sentAt: "2026-03-22 10:05", trigger: "3일 경과", status: "성공" },
];

const categoryColors: Record<string, string> = {
	"사후관리": "bg-blue-50 text-blue-700 border-blue-200",
	"마케팅": "bg-orange-50 text-orange-700 border-orange-200",
	"예약": "bg-emerald-50 text-emerald-700 border-emerald-200",
	"관계관리": "bg-violet-50 text-violet-700 border-violet-200",
};

export function MessagesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = searchParams.get("tab") ?? "triggers";
	const [triggers, setTriggers] = useState(initialTriggers);
	const [historySearch, setHistorySearch] = useState("");

	const toggleTrigger = (id: string) => {
		setTriggers((prev) =>
			prev.map((t) => {
				if (t.id !== id) return t;
				const next = { ...t, active: !t.active };
				toast.success(`"${t.name}" 트리거가 ${next.active ? "활성화" : "비활성화"}되었습니다.`);
				return next;
			}),
		);
	};

	const filteredHistory = historySearch.trim()
		? sendHistory.filter((h) => h.recipient.includes(historySearch.trim()) || h.templateName.includes(historySearch.trim()))
		: sendHistory;

	const totalSent = triggers.reduce((s, t) => s + t.sent, 0);
	const activeTriggerCount = triggers.filter((t) => t.active).length;
	const successRate = Math.round((sendHistory.filter((h) => h.status === "성공").length / sendHistory.length) * 100);

	return (
		<div className="space-y-6">
			<PageHeader
				title="메시지"
				description="자동 메시지 발송 및 템플릿을 관리합니다"
				actions={
					<Button size="sm" onClick={() => toast.info("새 템플릿 생성 기능은 준비 중입니다.")}>
						<Plus className="h-4 w-4 mr-2" />새 템플릿
					</Button>
				}
			/>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-4 pb-4 flex items-center gap-3">
						<div className="rounded-lg bg-blue-100 p-2.5">
							<Send className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<p className="text-xl font-bold">{totalSent.toLocaleString()}</p>
							<p className="text-xs text-muted-foreground">누적 발송</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-4 pb-4 flex items-center gap-3">
						<div className="rounded-lg bg-emerald-100 p-2.5">
							<Zap className="h-4 w-4 text-emerald-600" />
						</div>
						<div>
							<p className="text-xl font-bold">{activeTriggerCount}개</p>
							<p className="text-xs text-muted-foreground">활성 트리거</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-4 pb-4 flex items-center gap-3">
						<div className="rounded-lg bg-purple-100 p-2.5">
							<CheckCircle2 className="h-4 w-4 text-purple-600" />
						</div>
						<div>
							<p className="text-xl font-bold">{successRate}%</p>
							<p className="text-xs text-muted-foreground">발송 성공률</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs value={tab} onValueChange={(v: string) => { const n = new URLSearchParams(searchParams); if (v === "triggers") { n.delete("tab"); } else { n.set("tab", v); } setSearchParams(n); }}>
				<TabsList>
					<TabsTrigger value="triggers">자동 발송 트리거</TabsTrigger>
					<TabsTrigger value="templates">메시지 템플릿</TabsTrigger>
					<TabsTrigger value="history">발송 이력</TabsTrigger>
				</TabsList>

				{/* ── 트리거 ── */}
				<TabsContent value="triggers" className="mt-4">
					<Card>
						<CardContent className="pt-6">
							<div className="space-y-3">
								{triggers.map((trigger) => (
									<div
										key={trigger.id}
										className={cn(
											"flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
											trigger.active ? "hover:bg-muted/50" : "bg-muted/30 opacity-60",
										)}
									>
										<div className="flex items-center gap-4 min-w-0">
											<div className={cn("rounded-full p-2 shrink-0 transition-colors duration-300", trigger.active ? "bg-emerald-100" : "bg-neutral-100")}>
												<Zap className={cn("h-4 w-4 transition-colors duration-300", trigger.active ? "text-emerald-600" : "text-neutral-400")} />
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium">{trigger.name}</p>
												<div className="flex items-center gap-2 mt-0.5 flex-wrap">
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3 text-muted-foreground" />
														<span className="text-xs text-muted-foreground">{trigger.trigger}</span>
													</div>
													{trigger.lastRun && (
														<span className="text-xs text-muted-foreground">· 마지막 실행 {trigger.lastRun}</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-4 shrink-0">
											<span className="text-xs text-muted-foreground hidden sm:block">{trigger.sent.toLocaleString()}건</span>
											<Switch
												checked={trigger.active}
												onCheckedChange={() => toggleTrigger(trigger.id)}
											/>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 템플릿 ── */}
				<TabsContent value="templates" className="mt-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{templates.map((template) => (
							<Card key={template.id} className="hover:shadow-sm transition-shadow cursor-pointer">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											<CardTitle className="text-sm">{template.name}</CardTitle>
										</div>
										<Badge variant="outline" className={cn("text-xs", categoryColors[template.category] ?? "")}>
											{template.category}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-xs text-muted-foreground leading-relaxed">{template.preview}</p>
									<div className="flex items-center justify-between mt-3">
										<div className="flex gap-1.5 flex-wrap">
											{template.variables.map((v) => (
												<Badge key={v} variant="secondary" className="text-xs px-1.5 py-0">
													{`{{${v}}}`}
												</Badge>
											))}
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 text-xs shrink-0"
											onClick={() => toast.success(`"${template.name}" 템플릿을 테스트 발송했습니다.`)}
										>
											<Send className="h-3 w-3 mr-1" />
											테스트
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				{/* ── 발송 이력 ── */}
				<TabsContent value="history" className="mt-4">
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base">발송 이력</CardTitle>
								<div className="relative">
									<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
									<Input
										placeholder="수신자, 템플릿 검색..."
										className="h-8 w-[180px] text-xs pl-8"
										value={historySearch}
										onChange={(e) => setHistorySearch(e.target.value)}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">수신자</th>
											<th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">템플릿</th>
											<th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">트리거</th>
											<th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">발송 일시</th>
											<th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground">상태</th>
										</tr>
									</thead>
									<tbody>
										{filteredHistory.map((h) => (
											<tr key={h.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
												<td className="py-2.5 px-3">
													<div className="flex items-center gap-1.5">
														<User className="h-3.5 w-3.5 text-muted-foreground" />
														<span className="text-sm font-medium">{h.recipient}</span>
													</div>
												</td>
												<td className="py-2.5 px-3">
													<div className="flex items-center gap-1.5">
														<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
														<span className="text-xs">{h.templateName}</span>
													</div>
												</td>
												<td className="py-2.5 px-3 text-xs text-muted-foreground hidden sm:table-cell">{h.trigger}</td>
												<td className="py-2.5 px-3 text-xs text-muted-foreground hidden md:table-cell font-mono">{h.sentAt}</td>
												<td className="py-2.5 px-3 text-center">
													{h.status === "성공" ? (
														<div className="flex items-center justify-center gap-1 text-emerald-600">
															<CheckCircle2 className="h-3.5 w-3.5" />
															<span className="text-xs">성공</span>
														</div>
													) : (
														<div className="flex items-center justify-center gap-1 text-red-500">
															<XCircle className="h-3.5 w-3.5" />
															<span className="text-xs">실패</span>
														</div>
													)}
												</td>
											</tr>
										))}
										{filteredHistory.length === 0 && (
											<tr>
												<td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
													검색 결과가 없습니다.
												</td>
											</tr>
										)}
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
