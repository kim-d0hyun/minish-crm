import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, ChevronRight, Download, Phone, Plus, Search, Star, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Customer {
	id: string;
	name: string;
	phone: string;
	grade: "VIP" | "일반" | "신규" | "휴면";
	visits: number;
	lastVisit: string;
	totalSpent: number;
	interests: string[];
	counselor: string;
}

type SortKey = "name" | "visits" | "totalSpent" | "lastVisit";
type SortDir = "asc" | "desc";

const initialCustomers: Customer[] = [
	{ id: "1", name: "김서연", phone: "010-1234-5678", grade: "VIP", visits: 24, lastVisit: "2026-03-28", totalSpent: 4800000, interests: ["피부 관리", "전신 마사지"], counselor: "이상담" },
	{ id: "2", name: "이준호", phone: "010-2345-6789", grade: "일반", visits: 8, lastVisit: "2026-03-25", totalSpent: 1200000, interests: ["치아 미백"], counselor: "박상담" },
	{ id: "3", name: "박민지", phone: "010-3456-7890", grade: "VIP", visits: 31, lastVisit: "2026-03-29", totalSpent: 7200000, interests: ["프리미엄 케어", "네일"], counselor: "이상담" },
	{ id: "4", name: "정하은", phone: "010-4567-8901", grade: "신규", visits: 1, lastVisit: "2026-03-30", totalSpent: 150000, interests: ["교정 상담"], counselor: "김상담" },
	{ id: "5", name: "최윤서", phone: "010-5678-9012", grade: "일반", visits: 5, lastVisit: "2026-03-22", totalSpent: 680000, interests: ["피부 관리"], counselor: "박상담" },
	{ id: "6", name: "한지수", phone: "010-6789-0123", grade: "휴면", visits: 12, lastVisit: "2025-12-15", totalSpent: 2100000, interests: ["전신 마사지"], counselor: "이상담" },
	{ id: "7", name: "오세진", phone: "010-7890-1234", grade: "일반", visits: 3, lastVisit: "2026-03-18", totalSpent: 420000, interests: ["스케일링", "치아 미백"], counselor: "김상담" },
	{ id: "8", name: "김태희", phone: "010-1111-2222", grade: "VIP", visits: 28, lastVisit: "2026-03-27", totalSpent: 6500000, interests: ["프리미엄 케어"], counselor: "이상담" },
	{ id: "9", name: "이승우", phone: "010-2222-3333", grade: "일반", visits: 6, lastVisit: "2026-03-20", totalSpent: 890000, interests: ["스케일링"], counselor: "박상담" },
	{ id: "10", name: "홍길동", phone: "010-3333-4444", grade: "VIP", visits: 45, lastVisit: "2026-03-15", totalSpent: 12000000, interests: ["전신 마사지", "프리미엄 케어"], counselor: "이상담" },
	{ id: "11", name: "유재석", phone: "010-4444-5555", grade: "신규", visits: 2, lastVisit: "2026-03-29", totalSpent: 200000, interests: ["피부 관리"], counselor: "김상담" },
	{ id: "12", name: "송혜교", phone: "010-5555-6666", grade: "VIP", visits: 19, lastVisit: "2026-03-26", totalSpent: 5300000, interests: ["네일", "피부 관리"], counselor: "박상담" },
	{ id: "13", name: "강민수", phone: "010-6666-7777", grade: "휴면", visits: 7, lastVisit: "2025-11-10", totalSpent: 950000, interests: ["치아 미백"], counselor: "김상담" },
	{ id: "14", name: "윤지호", phone: "010-7777-8888", grade: "일반", visits: 4, lastVisit: "2026-03-21", totalSpent: 520000, interests: ["교정 상담"], counselor: "박상담" },
	{ id: "15", name: "임소연", phone: "010-8888-9999", grade: "신규", visits: 1, lastVisit: "2026-03-30", totalSpent: 80000, interests: ["네일"], counselor: "이상담" },
	{ id: "16", name: "배준혁", phone: "010-9999-0000", grade: "일반", visits: 9, lastVisit: "2026-03-24", totalSpent: 1350000, interests: ["전신 마사지", "스케일링"], counselor: "박상담" },
];

const PAGE_SIZE = 50;

const gradeColor = (grade: Customer["grade"]) => {
	switch (grade) {
		case "VIP":
			return "bg-amber-100 text-amber-800 border-amber-200";
		case "신규":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "휴면":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-neutral-100 text-neutral-700 border-neutral-200";
	}
};

function formatCurrency(n: number) {
	return `₩${n.toLocaleString("ko-KR")}`;
}

function SortableHeader({
	label,
	sortKey: key,
	currentKey,
	currentDir,
	onSort,
	className,
}: {
	label: string;
	sortKey: SortKey;
	currentKey: SortKey | null;
	currentDir: SortDir;
	onSort: (k: SortKey) => void;
	className?: string;
}) {
	const active = currentKey === key;
	return (
		<button
			type="button"
			onClick={() => onSort(key)}
			className={cn("inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium text-muted-foreground", className)}
		>
			{label}
			{active ? (
				currentDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
			) : (
				<ArrowUpDown className="h-3 w-3 opacity-40" />
			)}
		</button>
	);
}

function CustomerRow({ customer, onClick }: { customer: Customer; onClick: () => void }) {
	return (
		<button type="button" className="flex w-full items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg transition-all duration-150 cursor-pointer group text-left" onClick={onClick}>
			<div className="flex items-center gap-4 min-w-0">
				<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0 text-primary">
					{customer.grade === "VIP" ? (
						<Star className="h-4 w-4 text-amber-500 fill-amber-500" />
					) : (
						customer.name.charAt(0)
					)}
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<p className="text-sm font-medium">{customer.name}</p>
						<Badge
							variant="outline"
							className={cn("text-xs px-1.5 py-0", gradeColor(customer.grade))}
						>
							{customer.grade}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground">{customer.phone}</p>
				</div>
			</div>
			<div className="hidden md:flex items-center gap-8 text-sm">
				<div className="text-center w-16">
					<p className="font-medium">{customer.visits}회</p>
					<p className="text-xs text-muted-foreground">방문</p>
				</div>
				<div className="text-center w-24">
					<p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
					<p className="text-xs text-muted-foreground">총 결제</p>
				</div>
				<div className="text-center w-20">
					<p className="text-xs text-muted-foreground">{customer.lastVisit}</p>
					<p className="text-xs text-muted-foreground">마지막 방문</p>
				</div>
				<div className="w-16 text-center">
					<p className="text-xs text-muted-foreground">{customer.counselor}</p>
				</div>
			</div>
			<ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
		</button>
	);
}

export function CustomersPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	// 모든 필터 상태를 URL searchParams에서 파생
	const search = searchParams.get("q") || "";
	const gradeFilter = searchParams.get("grade") || "all";
	const counselorFilter = searchParams.get("counselor") || "전체";
	const sortKey = (searchParams.get("sort") as SortKey | null) || null;
	const sortDir = (searchParams.get("dir") as SortDir) || "asc";
	const page = Number(searchParams.get("page") || "1");

	const [customers, setCustomers] = useState(initialCustomers);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [form, setForm] = useState({ name: "", phone: "", interests: "", counselor: "이상담" });

	const setParam = (updates: Record<string, string>) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			for (const [k, v] of Object.entries(updates)) {
				if (v === "" || v === "all" || v === "전체" || v === "asc") {
					next.delete(k);
				} else {
					next.set(k, v);
				}
			}
			return next;
		});
	};

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setParam({ sort: key, dir: sortDir === "asc" ? "desc" : "asc", page: "1" });
		} else {
			setParam({ sort: key, dir: "asc", page: "1" });
		}
	};

	const filtered = useMemo(() => {
		let data = [...customers];
		if (gradeFilter !== "all") data = data.filter((c) => c.grade === gradeFilter);
		if (counselorFilter !== "전체") data = data.filter((c) => c.counselor === counselorFilter);
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			data = data.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
		}
		if (sortKey) {
			data.sort((a, b) => {
				const av = a[sortKey];
				const bv = b[sortKey];
				if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
				return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
			});
		}
		return data;
	}, [customers, search, gradeFilter, counselorFilter, sortKey, sortDir]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleRegister = () => {
		if (!form.name.trim() || !form.phone.trim()) {
			toast.error("이름과 전화번호를 입력해주세요.");
			return;
		}
		const newCustomer: Customer = {
			id: String(Date.now()),
			name: form.name.trim(),
			phone: form.phone.trim(),
			grade: "신규",
			visits: 0,
			lastVisit: "2026-03-30",
			totalSpent: 0,
			interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
			counselor: form.counselor,
		};
		setCustomers((prev) => [newCustomer, ...prev]);
		toast.success(`${newCustomer.name} 고객이 등록되었습니다.`);
		setDialogOpen(false);
		setForm({ name: "", phone: "", interests: "", counselor: "이상담" });
	};

	// 등급 카운트 (전체 customers 기준)
	const gradeCounts = useMemo(() => ({
		all: customers.length,
		VIP: customers.filter((c) => c.grade === "VIP").length,
		일반: customers.filter((c) => c.grade === "일반").length,
		신규: customers.filter((c) => c.grade === "신규").length,
		휴면: customers.filter((c) => c.grade === "휴면").length,
	}), [customers]);

	return (
		<div className="space-y-6">
			<PageHeader
				title="고객 관리"
				description="고객 정보를 조회하고 관리합니다"
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => toast.success("고객 데이터를 내보냈습니다.")}
						>
							<Download className="h-4 w-4 mr-2" />
							내보내기
						</Button>
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogTrigger asChild>
								<Button size="sm">
									<Plus className="h-4 w-4 mr-2" />
									고객 등록
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>고객 등록</DialogTitle>
									<DialogDescription>
										새 고객 정보를 입력해주세요.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label>이름 *</Label>
										<Input
											placeholder="고객 이름"
											value={form.name}
											onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
										/>
									</div>
									<div className="grid gap-2">
										<Label>전화번호 *</Label>
										<Input
											placeholder="010-0000-0000"
											value={form.phone}
											onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
										/>
									</div>
									<div className="grid gap-2">
										<Label>관심 시술</Label>
										<Input
											placeholder="피부 관리, 전신 마사지..."
											value={form.interests}
											onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
										/>
									</div>
									<div className="grid gap-2">
										<Label>담당 상담실장</Label>
										<Select value={form.counselor} onValueChange={(v) => setForm((f) => ({ ...f, counselor: v }))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="이상담">이상담</SelectItem>
												<SelectItem value="박상담">박상담</SelectItem>
												<SelectItem value="김상담">김상담</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
									<Button onClick={handleRegister}>등록</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				}
			/>

			{/* 필터 바 */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="이름, 전화번호로 검색..."
						className="pl-9 h-9"
						value={search}
						onChange={(e) => setParam({ q: e.target.value, page: "1" })}
					/>
				</div>
				<Select value={counselorFilter} onValueChange={(v) => setParam({ counselor: v, page: "1" })}>
					<SelectTrigger className="h-9 w-[120px] text-xs">
						<SelectValue placeholder="담당" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="전체">전체 담당</SelectItem>
						<SelectItem value="이상담">이상담</SelectItem>
						<SelectItem value="박상담">박상담</SelectItem>
						<SelectItem value="김상담">김상담</SelectItem>
					</SelectContent>
				</Select>

				{/* 정렬 */}
				<div className="hidden sm:flex items-center gap-2 ml-auto">
					<SortableHeader label="이름" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
					<SortableHeader label="방문" sortKey="visits" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
					<SortableHeader label="결제" sortKey="totalSpent" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
					<SortableHeader label="최근방문" sortKey="lastVisit" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
				</div>
			</div>

			<Tabs value={gradeFilter} onValueChange={(v) => setParam({ grade: v, page: "1" })}>
				<TabsList>
					<TabsTrigger value="all">전체 ({gradeCounts.all})</TabsTrigger>
					<TabsTrigger value="VIP">VIP ({gradeCounts.VIP})</TabsTrigger>
					<TabsTrigger value="일반">일반 ({gradeCounts.일반})</TabsTrigger>
					<TabsTrigger value="신규">신규 ({gradeCounts.신규})</TabsTrigger>
					<TabsTrigger value="휴면">휴면 ({gradeCounts.휴면})</TabsTrigger>
				</TabsList>

				{["all", "VIP", "일반", "신규", "휴면"].map((tab) => (
					<TabsContent key={tab} value={tab} className="mt-4">
						<Card>
							{tab === "휴면" && (
								<CardHeader>
									<CardTitle className="text-base">휴면 고객</CardTitle>
									<CardDescription>
										90일 이상 미방문 고객입니다. 리텐션 캠페인을 실행해보세요.
									</CardDescription>
								</CardHeader>
							)}
							<CardContent className={tab === "휴면" ? "" : "pt-6"}>
								{paged.length > 0 ? (
									<div className="divide-y">
										{paged.map((customer) => (
											<CustomerRow key={customer.id} customer={customer} onClick={() => setSelectedCustomer(customer)} />
										))}
									</div>
								) : (
									<div className="py-12 text-center text-sm text-muted-foreground">
										검색 결과가 없습니다.
									</div>
								)}

								{totalPages > 1 && (
									<div className="mt-4 flex items-center justify-between">
										<span className="text-xs text-muted-foreground">
											{filtered.length}건 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filtered.length)}
										</span>
										<Pagination>
											<PaginationContent>
												<PaginationItem>
													<PaginationPrevious
														onClick={() => setParam({ page: String(Math.max(1, page - 1)) })}
														className={cn(page === 1 && "pointer-events-none opacity-50")}
													/>
												</PaginationItem>
												{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
													<PaginationItem key={p}>
														<PaginationLink isActive={p === page} onClick={() => setParam({ page: String(p) })}>
															{p}
														</PaginationLink>
													</PaginationItem>
												))}
												<PaginationItem>
													<PaginationNext
														onClick={() => setParam({ page: String(Math.min(totalPages, page + 1)) })}
														className={cn(page === totalPages && "pointer-events-none opacity-50")}
													/>
												</PaginationItem>
											</PaginationContent>
										</Pagination>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				))}
			</Tabs>

			{/* 고객 상세 슬라이드 패널 */}
			<Sheet open={selectedCustomer !== null} onOpenChange={(open) => { if (!open) { setSelectedCustomer(null); } }}>
				<SheetContent className="w-full sm:max-w-md overflow-y-auto">
					{selectedCustomer && (
						<>
							<SheetHeader className="pb-4">
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
										{selectedCustomer.grade === "VIP" ? (
											<Star className="h-5 w-5 text-amber-500 fill-amber-500" />
										) : (
											<span className="text-lg font-semibold">{selectedCustomer.name.charAt(0)}</span>
										)}
									</div>
									<div>
										<SheetTitle className="flex items-center gap-2">
											{selectedCustomer.name}
											<Badge variant="outline" className={cn("text-xs px-1.5 py-0", gradeColor(selectedCustomer.grade))}>
												{selectedCustomer.grade}
											</Badge>
										</SheetTitle>
										<SheetDescription>{selectedCustomer.counselor} 담당</SheetDescription>
									</div>
								</div>
							</SheetHeader>

							<div className="space-y-5 px-4 pb-6">
								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-lg bg-muted/50 p-3">
										<p className="text-xs text-muted-foreground mb-1">총 방문</p>
										<p className="text-xl font-bold">{selectedCustomer.visits}회</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-3">
										<p className="text-xs text-muted-foreground mb-1">총 결제</p>
										<p className="text-xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</p>
									</div>
								</div>

								<div className="space-y-2.5">
									<div className="flex items-center gap-3 py-2 border-b">
										<Phone className="h-4 w-4 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">전화번호</p>
											<a href={`tel:${selectedCustomer.phone}`} className="text-sm font-medium hover:text-primary">{selectedCustomer.phone}</a>
										</div>
									</div>
									<div className="flex items-center gap-3 py-2 border-b">
										<CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">마지막 방문</p>
											<p className="text-sm font-medium">{selectedCustomer.lastVisit}</p>
										</div>
									</div>
									<div className="flex items-center gap-3 py-2 border-b">
										<User className="h-4 w-4 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">담당 상담실장</p>
											<p className="text-sm font-medium">{selectedCustomer.counselor}</p>
										</div>
									</div>
								</div>

								{selectedCustomer.interests.length > 0 && (
									<div>
										<p className="text-xs text-muted-foreground mb-2">관심 시술</p>
										<div className="flex flex-wrap gap-1.5">
											{selectedCustomer.interests.map((interest) => (
												<Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
