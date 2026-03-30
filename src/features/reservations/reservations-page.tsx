import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Phone, Plus, User } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface Reservation {
	id: string;
	date: string; // YYYY-MM-DD
	customerName: string;
	treatment: string;
	time: string;
	durationMin: number;
	counselor: string;
	status: "확정" | "대기" | "완료" | "취소" | "노쇼";
	phone?: string;
}

const allReservations: Reservation[] = [
	{ id: "1",  date: "2026-03-30", customerName: "김서연",  treatment: "전신 마사지",   time: "09:00", durationMin: 60,  counselor: "이상담", status: "완료", phone: "010-1234-5678" },
	{ id: "2",  date: "2026-03-30", customerName: "이준호",  treatment: "피부 관리",     time: "10:00", durationMin: 45,  counselor: "박상담", status: "완료", phone: "010-2345-6789" },
	{ id: "3",  date: "2026-03-30", customerName: "정하은",  treatment: "치아 미백",     time: "11:00", durationMin: 30,  counselor: "김상담", status: "완료", phone: "010-4567-8901" },
	{ id: "4",  date: "2026-03-30", customerName: "박민지",  treatment: "프리미엄 케어", time: "13:00", durationMin: 90,  counselor: "이상담", status: "확정", phone: "010-3456-7890" },
	{ id: "5",  date: "2026-03-30", customerName: "한지민",  treatment: "네일 케어",     time: "14:00", durationMin: 60,  counselor: "박상담", status: "확정", phone: "010-6789-0123" },
	{ id: "6",  date: "2026-03-30", customerName: "오세훈",  treatment: "교정 상담",     time: "15:00", durationMin: 30,  counselor: "김상담", status: "대기", phone: "010-7890-1234" },
	{ id: "7",  date: "2026-03-30", customerName: "최윤서",  treatment: "스케일링",      time: "15:30", durationMin: 30,  counselor: "이상담", status: "대기", phone: "010-5678-9012" },
	{ id: "8",  date: "2026-03-30", customerName: "강민수",  treatment: "피부 관리",     time: "16:00", durationMin: 45,  counselor: "박상담", status: "취소", phone: "010-6666-7777" },
	{ id: "9",  date: "2026-03-29", customerName: "홍길동",  treatment: "프리미엄 케어", time: "10:30", durationMin: 90,  counselor: "이상담", status: "완료", phone: "010-3333-4444" },
	{ id: "10", date: "2026-03-29", customerName: "송혜교",  treatment: "전신 마사지",   time: "13:00", durationMin: 60,  counselor: "박상담", status: "완료", phone: "010-5555-6666" },
	{ id: "11", date: "2026-03-29", customerName: "유재석",  treatment: "스케일링",      time: "11:30", durationMin: 30,  counselor: "김상담", status: "완료", phone: "010-4444-5555" },
	{ id: "12", date: "2026-03-29", customerName: "김태희",  treatment: "피부 관리",     time: "16:30", durationMin: 45,  counselor: "이상담", status: "노쇼",  phone: "010-1111-2222" },
	{ id: "13", date: "2026-03-31", customerName: "강예린",  treatment: "전신 마사지",   time: "10:00", durationMin: 60,  counselor: "박상담", status: "확정", phone: "010-2222-1111" },
	{ id: "14", date: "2026-03-31", customerName: "최민준",  treatment: "프리미엄 케어", time: "14:00", durationMin: 90,  counselor: "이상담", status: "확정", phone: "010-3333-2222" },
	{ id: "15", date: "2026-03-31", customerName: "박소희",  treatment: "피부 관리",     time: "11:00", durationMin: 45,  counselor: "김상담", status: "대기", phone: "010-4444-3333" },
];

const statusConfig: Record<Reservation["status"], { label: string; className: string; timelineBg: string }> = {
	확정: { label: "확정", className: "bg-emerald-100 text-emerald-700 border-emerald-200", timelineBg: "bg-emerald-500" },
	대기: { label: "대기", className: "bg-amber-100 text-amber-700 border-amber-200",   timelineBg: "bg-amber-400"  },
	완료: { label: "완료", className: "bg-blue-100 text-blue-700 border-blue-200",       timelineBg: "bg-blue-400"   },
	취소: { label: "취소", className: "bg-red-100 text-red-700 border-red-200",          timelineBg: "bg-red-300"    },
	노쇼: { label: "노쇼", className: "bg-neutral-100 text-neutral-600 border-neutral-200", timelineBg: "bg-neutral-300" },
};

const counselors = ["이상담", "박상담", "김상담"];
const counselorColors = [
	"bg-violet-100 text-violet-700 border-violet-200",
	"bg-sky-100 text-sky-700 border-sky-200",
	"bg-teal-100 text-teal-700 border-teal-200",
];

function timeToMin(t: string) {
	const [h, m] = t.split(":").map(Number);
	return h * 60 + m;
}

function toDateStr(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

const START_HOUR = 9;
const END_HOUR = 19;
const SLOT_HEIGHT = 48;

function formatDate(date: Date) {
	const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
	return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

function ReservationListItem({ reservation, onStatusChange }: {
	reservation: Reservation;
	onStatusChange: (id: string, s: Reservation["status"]) => void;
}) {
	const config = statusConfig[reservation.status];
	return (
		<div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
			<div className="text-center w-14 shrink-0">
				<p className="text-sm font-mono font-medium">{reservation.time}</p>
				<p className="text-xs text-muted-foreground">{reservation.durationMin}분</p>
			</div>
			<div className="h-10 w-0.5 bg-border rounded-full shrink-0" />
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="text-sm font-medium">{reservation.customerName}</p>
					<Badge variant="outline" className={cn("text-xs px-1.5 py-0", config.className)}>
						{config.label}
					</Badge>
				</div>
				<p className="text-xs text-muted-foreground">{reservation.treatment}</p>
			</div>
			<div className="hidden sm:flex items-center gap-3 shrink-0">
				{reservation.phone && (
					<a
						href={`tel:${reservation.phone}`}
						className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
						onClick={(e) => e.stopPropagation()}
					>
						<Phone className="h-3 w-3" />
						{reservation.phone}
					</a>
				)}
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<User className="h-3 w-3" />
					{reservation.counselor}
				</div>
			</div>
			<Select value={reservation.status} onValueChange={(v) => onStatusChange(reservation.id, v as Reservation["status"])}>
				<SelectTrigger className="h-7 w-[80px] text-xs shrink-0">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{(["확정", "대기", "완료", "취소", "노쇼"] as Reservation["status"][]).map((s) => (
						<SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function TimelineView({ reservations }: { reservations: Reservation[] }) {
	const totalSlots = (END_HOUR - START_HOUR) * 2;

	return (
		<div className="overflow-x-auto">
			<div className="min-w-[600px]">
				<div className="grid gap-0" style={{ gridTemplateColumns: "56px repeat(3, 1fr)" }}>
					<div className="h-10 border-b" />
					{counselors.map((c, ci) => (
						<div key={c} className={cn("h-10 border-b border-l flex items-center justify-center text-xs font-semibold", counselorColors[ci])}>
							{c}
						</div>
					))}
				</div>

				<div className="relative" style={{ height: totalSlots * SLOT_HEIGHT }}>
					{Array.from({ length: totalSlots + 1 }, (_, i) => {
						const totalMin = START_HOUR * 60 + i * 30;
						const h = Math.floor(totalMin / 60);
						const m = totalMin % 60;
						const label = m === 0 ? `${String(h).padStart(2, "0")}:00` : "";
						return (
							<div key={totalMin} className="absolute w-full flex" style={{ top: i * SLOT_HEIGHT }}>
								<div className="w-14 shrink-0 -translate-y-2.5 text-right pr-2">
									{label && <span className="text-xs text-muted-foreground font-mono">{label}</span>}
								</div>
								<div className="flex-1 border-t border-dashed border-border/60" />
							</div>
						);
					})}

					{counselors.map((c, ci) => (
						<div
							key={c}
							className="absolute top-0 bottom-0 border-l border-border/40"
							style={{ left: `calc(56px + ${ci} * (100% - 56px) / 3)` }}
						/>
					))}

					{reservations.map((r) => {
						const ci = counselors.indexOf(r.counselor);
						if (ci === -1) return null;
						const startMin = timeToMin(r.time) - START_HOUR * 60;
						const top = (startMin / 30) * SLOT_HEIGHT;
						const height = Math.max((r.durationMin / 30) * SLOT_HEIGHT - 4, 28);
						return (
							<div
								key={r.id}
								className={cn(
									"absolute rounded-md px-2 py-1 text-white text-xs font-medium overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm",
									statusConfig[r.status].timelineBg,
									r.status === "취소" && "opacity-40",
									r.status === "노쇼" && "opacity-50",
								)}
								style={{
									top: top + 2,
									height,
									left: `calc(56px + ${ci} * (100% - 56px) / 3 + 4px)`,
									width: `calc((100% - 56px) / 3 - 8px)`,
								}}
								title={`${r.customerName} · ${r.treatment} · ${r.durationMin}분`}
							>
								<p className="truncate font-semibold">{r.customerName}</p>
								{height > 36 && <p className="truncate opacity-90">{r.treatment}</p>}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export function ReservationsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = searchParams.get("tab") ?? "list";
	const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 30));
	const [statusFilter, setStatusFilter] = useState("전체");
	const [counselorFilter, setCounselorFilter] = useState("전체");
	const [reservations, setReservations] = useState(allReservations);
	const [newReservationOpen, setNewReservationOpen] = useState(false);
	const [newForm, setNewForm] = useState({ customerName: "", treatment: "", time: "09:00", counselor: "이상담" });

	const goDay = (delta: number) => {
		setSelectedDate((prev) => {
			const next = new Date(prev);
			next.setDate(next.getDate() + delta);
			return next;
		});
	};

	const handleStatusChange = (id: string, status: Reservation["status"]) => {
		setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
		toast.success("예약 상태가 변경되었습니다.");
	};

	const handleNewReservation = () => {
		if (!newForm.customerName.trim()) {
			toast.error("고객명을 입력해주세요.");
			return;
		}
		const newR: Reservation = {
			id: String(Date.now()),
			date: toDateStr(selectedDate),
			customerName: newForm.customerName.trim(),
			treatment: newForm.treatment.trim() || "상담",
			time: newForm.time,
			durationMin: 60,
			counselor: newForm.counselor,
			status: "대기",
		};
		setReservations((prev) => [...prev, newR].sort((a, b) => a.time.localeCompare(b.time)));
		toast.success("예약이 등록되었습니다.");
		setNewReservationOpen(false);
		setNewForm({ customerName: "", treatment: "", time: "09:00", counselor: "이상담" });
	};

	const dateStr = toDateStr(selectedDate);

	// 선택된 날짜의 예약만
	const dayReservations = reservations.filter((r) => r.date === dateStr);

	const filtered = dayReservations.filter((r) => {
		if (statusFilter !== "전체" && r.status !== statusFilter) return false;
		if (counselorFilter !== "전체" && r.counselor !== counselorFilter) return false;
		return true;
	});

	const counts = {
		전체: dayReservations.length,
		확정: dayReservations.filter((r) => r.status === "확정").length,
		대기: dayReservations.filter((r) => r.status === "대기").length,
		완료: dayReservations.filter((r) => r.status === "완료").length,
		취소: dayReservations.filter((r) => r.status === "취소").length,
		노쇼: dayReservations.filter((r) => r.status === "노쇼").length,
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="예약 관리"
				description="예약 현황을 조회하고 관리합니다"
				actions={
					<Button size="sm" onClick={() => setNewReservationOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						예약 등록
					</Button>
				}
			/>

			<Dialog open={newReservationOpen} onOpenChange={setNewReservationOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>예약 등록</DialogTitle>
						<DialogDescription>{formatDate(selectedDate)} 예약을 등록합니다.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>고객명 *</Label>
							<Input placeholder="고객 이름" value={newForm.customerName} onChange={(e) => setNewForm((f) => ({ ...f, customerName: e.target.value }))} />
						</div>
						<div className="grid gap-2">
							<Label>시술명</Label>
							<Input placeholder="피부 관리, 전신 마사지..." value={newForm.treatment} onChange={(e) => setNewForm((f) => ({ ...f, treatment: e.target.value }))} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>예약 시간</Label>
								<Input type="time" value={newForm.time} onChange={(e) => setNewForm((f) => ({ ...f, time: e.target.value }))} />
							</div>
							<div className="grid gap-2">
								<Label>담당 상담실장</Label>
								<Select value={newForm.counselor} onValueChange={(v) => setNewForm((f) => ({ ...f, counselor: v }))}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										{counselors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setNewReservationOpen(false)}>취소</Button>
						<Button onClick={handleNewReservation}>등록</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* 날짜 네비게이션 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goDay(-1)}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2 text-base font-semibold">
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
						{formatDate(selectedDate)}
					</div>
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goDay(1)}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setSelectedDate(new Date(2026, 2, 30))}>
					오늘
				</Button>
			</div>

			{/* 요약 카드 */}
			<div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
				{([
					{ label: "전체",  value: counts.전체, color: "text-foreground" },
					{ label: "확정",  value: counts.확정, color: "text-emerald-600" },
					{ label: "대기",  value: counts.대기, color: "text-amber-600" },
					{ label: "완료",  value: counts.완료, color: "text-blue-600" },
					{ label: "취소",  value: counts.취소, color: "text-red-500" },
					{ label: "노쇼",  value: counts.노쇼, color: "text-neutral-500" },
				] as const).map((stat) => (
					<Card
						key={stat.label}
						className={cn("cursor-pointer transition-all duration-200 hover:shadow-sm", statusFilter === stat.label ? "ring-2 ring-primary" : "")}
						onClick={() => setStatusFilter(statusFilter === stat.label ? "전체" : stat.label)}
					>
						<CardContent className="pt-3 pb-3 text-center">
							<p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
							<p className="text-xs text-muted-foreground">{stat.label}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Tabs value={tab} onValueChange={(v: string) => { const n = new URLSearchParams(searchParams); if (v === "list") { n.delete("tab"); } else { n.set("tab", v); } setSearchParams(n); }}>
				<div className="flex items-center justify-between flex-wrap gap-2">
					<TabsList>
						<TabsTrigger value="list">목록</TabsTrigger>
						<TabsTrigger value="timeline">타임라인</TabsTrigger>
					</TabsList>
					<Select value={counselorFilter} onValueChange={setCounselorFilter}>
						<SelectTrigger className="h-8 w-[110px] text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="전체" className="text-xs">전체 실장</SelectItem>
							{counselors.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>

				<TabsContent value="list" className="mt-4">
					<Card>
						<CardContent className="pt-4">
							{filtered.length === 0 ? (
								<div className="py-12 text-center text-sm text-muted-foreground">
									{dayReservations.length === 0 ? "이 날 예약이 없습니다." : "조건에 맞는 예약이 없습니다."}
								</div>
							) : (
								<div className="divide-y">
									{filtered.map((r) => (
										<ReservationListItem key={r.id} reservation={r} onStatusChange={handleStatusChange} />
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="timeline" className="mt-4">
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between flex-wrap gap-2">
								<CardTitle className="text-base">타임라인</CardTitle>
								<div className="flex items-center gap-3 text-xs">
									{(["확정", "대기", "완료", "취소", "노쇼"] as Reservation["status"][]).map((s) => (
										<div key={s} className="flex items-center gap-1.5">
											<span className={cn("h-2.5 w-2.5 rounded-sm", statusConfig[s].timelineBg)} />
											<span className="text-muted-foreground">{s}</span>
										</div>
									))}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<TimelineView reservations={filtered} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* 상담실장별 현황 */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{counselors.map((c, ci) => {
					const cRes = dayReservations.filter((r) => r.counselor === c);
					const confirmed = cRes.filter((r) => r.status === "확정").length;
					const completed = cRes.filter((r) => r.status === "완료").length;
					const noshow = cRes.filter((r) => r.status === "노쇼").length;
					const totalMin = cRes.filter((r) => !["취소", "노쇼"].includes(r.status)).reduce((s, r) => s + r.durationMin, 0);
					return (
						<Card key={c}>
							<CardContent className="pt-4">
								<div className="flex items-center gap-2 mb-3">
									<Badge variant="outline" className={cn("text-xs", counselorColors[ci])}>{c}</Badge>
									<span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
										<Clock className="h-3 w-3" />{Math.floor(totalMin / 60)}h {totalMin % 60}m
									</span>
								</div>
								<div className="grid grid-cols-4 gap-2 text-center">
									<div>
										<p className="text-lg font-bold">{cRes.length}</p>
										<p className="text-xs text-muted-foreground">전체</p>
									</div>
									<div>
										<p className="text-lg font-bold text-emerald-600">{confirmed}</p>
										<p className="text-xs text-muted-foreground">확정</p>
									</div>
									<div>
										<p className="text-lg font-bold text-blue-600">{completed}</p>
										<p className="text-xs text-muted-foreground">완료</p>
									</div>
									<div>
										<p className="text-lg font-bold text-neutral-500">{noshow}</p>
										<p className="text-xs text-muted-foreground">노쇼</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
