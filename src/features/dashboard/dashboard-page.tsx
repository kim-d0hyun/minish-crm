import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	CheckCircle2,
	Crown,
	Gift,
	Search,
	Settings2,
	Star,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── 타입 ────────────────────────────────────────────────

interface Customer {
	chartNo: string;
	name: string;
	gender: "M" | "F";
	birth: string;
	visitType: string;
	firstVisit: string;
	lastVisit: string;
	ownRevenue: number;
	referralRevenue: number;
	referralCount: number;
	segment: string;
	vip?: boolean;
	vipSince?: string;
	vipTier?: "Gold" | "Platinum" | "Diamond";
	totalVisits?: number;
	/** 치료를 권유받은 환자인지 (동의율 분모 기준) */
	recommended: boolean;
	/** recommended=true인 경우에만 의미 있음 */
	consent: boolean;
	confirmedAmount: number;
}

type SortKey = keyof Customer;
type SortDir = "asc" | "desc";

// ── 데이터 ──────────────────────────────────────────────

const segmentMatrix = [
	[
		{ group: "A", color: "bg-rose-50 border-rose-200 text-rose-700", count: 2, revenue: "2,989,400" },
		{ group: "B", color: "bg-orange-50 border-orange-200 text-orange-700", count: 1, revenue: "8,392,300" },
		{ group: "C", color: "bg-amber-50 border-amber-200 text-amber-700", count: 0, revenue: "0" },
	],
	[
		{ group: "D", color: "bg-sky-50 border-sky-200 text-sky-700", count: 23, revenue: "27,686,000" },
		{ group: "E", color: "bg-indigo-50 border-indigo-200 text-indigo-700", count: 1, revenue: "6,020,800" },
		{ group: "F", color: "bg-violet-50 border-violet-200 text-violet-700", count: 3, revenue: "36,794,000" },
	],
	[
		{ group: "G", color: "bg-neutral-50 border-neutral-200 text-neutral-700", count: 179, revenue: "78,619,210" },
		{ group: "H", color: "bg-slate-50 border-slate-200 text-slate-700", count: 6, revenue: "43,488,200" },
		{ group: "I", color: "bg-zinc-50 border-zinc-200 text-zinc-700", count: 4, revenue: "56,835,300" },
	],
];

const segmentRowLabels = ["2회 이상", "1회", "0회"];
const segmentColLabels = ["600만원 미만", "600만원~1,199만원", "1,200만원 이상"];

const allCustomers: Customer[] = [
	// recommended: 치료를 권유받은 환자 여부 (동의율 분모)
	// C006(한지민, ₩1,000 단순검진), C011(배성준, ₩0 컨설팅만)은 치료 권유 없음
	{ chartNo: "C001", name: "김서연", gender: "F", birth: "1988-05-12", visitType: "106 순수소개(지인)", firstVisit: "2023-06-17", lastVisit: "2026-02-27", ownRevenue: 780700,   referralRevenue: 0,       referralCount: 0, segment: "D", totalVisits: 12, recommended: true,  consent: true,  confirmedAmount: 780700   },
	{ chartNo: "C002", name: "이준호", gender: "M", birth: "1975-03-22", visitType: "106 순수소개(지인)", firstVisit: "2022-05-20", lastVisit: "2026-02-20", ownRevenue: 4415100,  referralRevenue: 0,       referralCount: 0, segment: "D", vip: true, vipSince: "2024-01-15", vipTier: "Gold",     totalVisits: 18, recommended: true,  consent: true,  confirmedAmount: 4415100  },
	{ chartNo: "C003", name: "박민지", gender: "F", birth: "1992-11-08", visitType: "106 순수소개(지인)", firstVisit: "2019-09-20", lastVisit: "2026-01-08", ownRevenue: 39600,    referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 3,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C004", name: "정하은", gender: "F", birth: "1985-07-15", visitType: "106 순수소개(지인)", firstVisit: "2024-10-08", lastVisit: "2026-01-31", ownRevenue: 403850,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 5,  recommended: true,  consent: true,  confirmedAmount: 403850   },
	{ chartNo: "C005", name: "최윤서", gender: "F", birth: "1990-01-30", visitType: "215 In온라인",       firstVisit: "2017-04-26", lastVisit: "2026-01-30", ownRevenue: 31700,    referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 2,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C006", name: "한지민", gender: "F", birth: "1983-06-25", visitType: "212 네이버예약",     firstVisit: "2025-01-25", lastVisit: "2026-01-23", ownRevenue: 1000,     referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 1,  recommended: false, consent: false, confirmedAmount: 0        },
	{ chartNo: "C007", name: "오세훈", gender: "M", birth: "1978-09-14", visitType: "215 In온라인",       firstVisit: "2021-12-17", lastVisit: "2026-02-06", ownRevenue: 417800,   referralRevenue: 0,       referralCount: 0, segment: "D", totalVisits: 7,  recommended: true,  consent: true,  confirmedAmount: 417800   },
	{ chartNo: "C008", name: "강민수", gender: "M", birth: "1995-02-28", visitType: "215 In온라인",       firstVisit: "2022-05-30", lastVisit: "2026-02-14", ownRevenue: 73800,    referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 4,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C009", name: "윤지호", gender: "M", birth: "1987-12-03", visitType: "107 순수소개(가족)", firstVisit: "2025-07-10", lastVisit: "2026-01-23", ownRevenue: 26140,    referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 2,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C010", name: "임수진", gender: "F", birth: "1991-04-19", visitType: "208 Out(기타)",       firstVisit: "2021-06-24", lastVisit: "2026-01-14", ownRevenue: 111000,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 6,  recommended: true,  consent: true,  confirmedAmount: 111000   },
	{ chartNo: "C011", name: "배성준", gender: "M", birth: "1980-08-07", visitType: "317 고객컨설팅",     firstVisit: "2025-12-18", lastVisit: "2026-02-27", ownRevenue: 0,        referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 1,  recommended: false, consent: false, confirmedAmount: 0        },
	{ chartNo: "C012", name: "조예린", gender: "F", birth: "1993-10-11", visitType: "106 순수소개(지인)", firstVisit: "2024-10-08", lastVisit: "2026-01-02", ownRevenue: 107200,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 3,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C013", name: "신동현", gender: "M", birth: "1976-05-22", visitType: "215 In온라인",       firstVisit: "2019-05-10", lastVisit: "2026-01-24", ownRevenue: 73200,    referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 4,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C014", name: "장유진", gender: "F", birth: "1989-03-16", visitType: "106 순수소개(지인)", firstVisit: "2022-02-17", lastVisit: "2026-02-07", ownRevenue: 0,        referralRevenue: 3444200, referralCount: 1, segment: "A", vip: true, vipSince: "2023-06-01", vipTier: "Gold",     totalVisits: 22, recommended: true,  consent: true,  confirmedAmount: 3444200  },
	{ chartNo: "C015", name: "김태희", gender: "F", birth: "1986-11-29", visitType: "107 순수소개(가족)", firstVisit: "2020-03-15", lastVisit: "2026-03-10", ownRevenue: 1250000,  referralRevenue: 520000,  referralCount: 2, segment: "A", vip: true, vipSince: "2022-09-20", vipTier: "Platinum", totalVisits: 35, recommended: true,  consent: true,  confirmedAmount: 1770000  },
	{ chartNo: "C016", name: "이승우", gender: "M", birth: "1982-04-05", visitType: "105 원자소개",       firstVisit: "2021-08-22", lastVisit: "2026-02-28", ownRevenue: 890000,   referralRevenue: 0,       referralCount: 0, segment: "D", totalVisits: 8,  recommended: true,  consent: true,  confirmedAmount: 890000   },
	{ chartNo: "C017", name: "박소영", gender: "F", birth: "1994-07-18", visitType: "202 Out(검색)",       firstVisit: "2023-11-05", lastVisit: "2026-03-15", ownRevenue: 340000,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 5,  recommended: true,  consent: true,  confirmedAmount: 340000   },
	{ chartNo: "C018", name: "홍길동", gender: "M", birth: "1979-01-01", visitType: "102 강원장님 지인소개", firstVisit: "2018-06-12", lastVisit: "2026-01-20", ownRevenue: 5600000, referralRevenue: 1200000, referralCount: 3, segment: "B", vip: true, vipSince: "2019-12-01", vipTier: "Diamond", totalVisits: 52, recommended: true,  consent: true,  confirmedAmount: 6800000  },
	{ chartNo: "C019", name: "유재석", gender: "M", birth: "1972-08-14", visitType: "215 In온라인",       firstVisit: "2024-02-01", lastVisit: "2026-03-05", ownRevenue: 200000,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 3,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C020", name: "송혜교", gender: "F", birth: "1981-11-22", visitType: "106 순수소개(지인)", firstVisit: "2020-09-30", lastVisit: "2026-03-20", ownRevenue: 3200000,  referralRevenue: 800000,  referralCount: 2, segment: "F", vip: true, vipSince: "2022-03-15", vipTier: "Platinum", totalVisits: 28, recommended: true,  consent: true,  confirmedAmount: 4000000  },
	{ chartNo: "C021", name: "이민호", gender: "M", birth: "1987-06-22", visitType: "215 In온라인",       firstVisit: "2023-01-15", lastVisit: "2026-03-25", ownRevenue: 6200000,  referralRevenue: 0,       referralCount: 0, segment: "E", vip: true, vipSince: "2024-07-01", vipTier: "Gold",     totalVisits: 15, recommended: true,  consent: true,  confirmedAmount: 6200000  },
	{ chartNo: "C022", name: "전지현", gender: "F", birth: "1981-10-30", visitType: "106 순수소개(지인)", firstVisit: "2021-04-10", lastVisit: "2026-03-18", ownRevenue: 8900000,  referralRevenue: 1500000, referralCount: 2, segment: "F", vip: true, vipSince: "2022-11-10", vipTier: "Diamond", totalVisits: 41, recommended: true,  consent: true,  confirmedAmount: 10400000 },
	{ chartNo: "C023", name: "공유",   gender: "M", birth: "1979-07-10", visitType: "105 원자소개",       firstVisit: "2022-09-01", lastVisit: "2026-02-28", ownRevenue: 12500000, referralRevenue: 3200000, referralCount: 4, segment: "F", vip: true, vipSince: "2023-05-20", vipTier: "Diamond", totalVisits: 38, recommended: true,  consent: true,  confirmedAmount: 15700000 },
	{ chartNo: "C024", name: "김수현", gender: "M", birth: "1988-02-16", visitType: "107 순수소개(가족)", firstVisit: "2024-06-20", lastVisit: "2026-03-22", ownRevenue: 450000,   referralRevenue: 0,       referralCount: 0, segment: "D", totalVisits: 6,  recommended: true,  consent: true,  confirmedAmount: 450000   },
	{ chartNo: "C025", name: "수지",   gender: "F", birth: "1994-10-10", visitType: "212 네이버예약",     firstVisit: "2025-03-01", lastVisit: "2026-03-28", ownRevenue: 180000,   referralRevenue: 0,       referralCount: 0, segment: "G", totalVisits: 2,  recommended: true,  consent: false, confirmedAmount: 0        },
	{ chartNo: "C026", name: "박보검", gender: "M", birth: "1993-06-16", visitType: "202 Out(검색)",       firstVisit: "2024-11-05", lastVisit: "2026-03-12", ownRevenue: 7800000,  referralRevenue: 2100000, referralCount: 1, segment: "H", vip: true, vipSince: "2025-06-01", vipTier: "Gold",     totalVisits: 14, recommended: true,  consent: true,  confirmedAmount: 9900000  },
	{ chartNo: "C027", name: "아이유", gender: "F", birth: "1993-05-16", visitType: "106 순수소개(지인)", firstVisit: "2020-07-20", lastVisit: "2026-03-29", ownRevenue: 9500000,  referralRevenue: 4300000, referralCount: 3, segment: "H", vip: true, vipSince: "2021-12-01", vipTier: "Diamond", totalVisits: 45, recommended: true,  consent: true,  confirmedAmount: 13800000 },
	{ chartNo: "C028", name: "현빈",   gender: "M", birth: "1982-09-25", visitType: "102 강원장님 지인소개", firstVisit: "2019-02-14", lastVisit: "2026-03-20", ownRevenue: 15000000, referralRevenue: 5000000, referralCount: 5, segment: "I", vip: true, vipSince: "2020-01-15", vipTier: "Diamond", totalVisits: 58, recommended: true,  consent: true,  confirmedAmount: 20000000 },
	{ chartNo: "C029", name: "손예진", gender: "F", birth: "1982-01-11", visitType: "106 순수소개(지인)", firstVisit: "2019-05-30", lastVisit: "2026-03-15", ownRevenue: 13200000, referralRevenue: 3800000, referralCount: 2, segment: "I", vip: true, vipSince: "2020-08-01", vipTier: "Diamond", totalVisits: 49, recommended: true,  consent: true,  confirmedAmount: 17000000 },
];

const PAGE_SIZE = 50;
const counselors = ["전체", "이상담", "박상담", "김상담"];
const genderOptions = ["전체", "남", "여"];

function fmt(n: number) {
	return n.toLocaleString("ko-KR");
}

function getAge(birth: string) {
	const y = Number.parseInt(birth.slice(0, 4), 10);
	return 2026 - y;
}

function ageLabel(age: number) {
	if (age < 20) return "10대 이하";
	if (age < 30) return "20대";
	if (age < 40) return "30대";
	if (age < 50) return "40대";
	if (age < 60) return "50대";
	if (age < 70) return "60대";
	return "70대 이상";
}

const ageBuckets = ["10대 이하", "20대", "30대", "40대", "50대", "60대", "70대 이상"];

// ── 공통 서브 컴포넌트 ──────────────────────────────────

function DonutChart({ maleRatio }: { maleRatio: number }) {
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative h-36 w-36 rounded-full" style={{ background: `conic-gradient(#60a5fa ${maleRatio}%, #f9a8d4 ${maleRatio}% 100%)` }}>
				<div className="absolute inset-4 rounded-full bg-white" />
			</div>
			<div className="flex gap-4 text-xs">
				<div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400" />남성 {maleRatio.toFixed(1)}%</div>
				<div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-pink-300" />여성 {(100 - maleRatio).toFixed(1)}%</div>
			</div>
		</div>
	);
}

function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, className }: { label: string; sortKey: SortKey; currentKey: SortKey | null; currentDir: SortDir; onSort: (key: SortKey) => void; className?: string }) {
	const active = currentKey === sortKey;
	return (
		<th className={cn("py-2 px-2 font-medium text-muted-foreground whitespace-nowrap", className)}>
			<button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
				{label}
				{active ? (currentDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
			</button>
		</th>
	);
}

// ── 차트 데이터 계산 ────────────────────────────────────

function computeCharts(data: Customer[]) {
	if (data.length === 0) return { maleRatio: 0, ageDistribution: ageBuckets.map((l) => ({ label: l, value: 0 })), visitTypeRanking: [] as { type: string; ratio: number }[] };

	const males = data.filter((c) => c.gender === "M").length;
	const maleRatio = (males / data.length) * 100;

	const ageCounts: Record<string, number> = {};
	for (const b of ageBuckets) ageCounts[b] = 0;
	for (const c of data) ageCounts[ageLabel(getAge(c.birth))]++;
	const ageDistribution = ageBuckets.map((l) => ({ label: l, value: (ageCounts[l] / data.length) * 100 }));

	const vtCounts: Record<string, number> = {};
	for (const c of data) vtCounts[c.visitType] = (vtCounts[c.visitType] || 0) + 1;
	const visitTypeRanking = Object.entries(vtCounts)
		.map(([type, count]) => ({ type, ratio: (count / data.length) * 100 }))
		.sort((a, b) => b.ratio - a.ratio)
		.slice(0, 8);

	return { maleRatio, ageDistribution, visitTypeRanking };
}

// ── 메인 컴포넌트 ───────────────────────────────────────

export function DashboardPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "kpi";
	const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

	const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
	const [counselor, setCounselor] = useState("전체");
	const [genderFilter, setGenderFilter] = useState("전체");
	const [visitTypeFilter, setVisitTypeFilter] = useState("전체");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortKey, setSortKey] = useState<SortKey | null>(null);
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [page, setPage] = useState(1);

	// VIP 상태
	const [vipTierFilter, setVipTierFilter] = useState("전체");
	const [vipSearch, setVipSearch] = useState("");
	const [vipSortKey, setVipSortKey] = useState<SortKey | null>("ownRevenue");
	const [vipSortDir, setVipSortDir] = useState<SortDir>("desc");
	const [vipPage, setVipPage] = useState(1);

	const handleSort = (key: SortKey) => {
		if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else { setSortKey(key); setSortDir("asc"); }
		setPage(1);
	};

	const handleVipSort = (key: SortKey) => {
		if (vipSortKey === key) setVipSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else { setVipSortKey(key); setVipSortDir("asc"); }
		setVipPage(1);
	};

	// ── KPI 필터 ────────────────────────────────────────
	const filtered = useMemo(() => {
		let data = [...allCustomers];
		if (selectedSegment) data = data.filter((c) => c.segment === selectedSegment);
		if (genderFilter !== "전체") data = data.filter((c) => (genderFilter === "남" ? c.gender === "M" : c.gender === "F"));
		if (visitTypeFilter !== "전체") data = data.filter((c) => c.visitType.includes(visitTypeFilter));
		if (searchQuery.trim()) { const q = searchQuery.trim().toLowerCase(); data = data.filter((c) => c.name.toLowerCase().includes(q) || c.chartNo.toLowerCase().includes(q) || c.visitType.toLowerCase().includes(q)); }
		if (sortKey) data.sort((a, b) => { const av = a[sortKey]; const bv = b[sortKey]; if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av; return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); });
		return data;
	}, [selectedSegment, genderFilter, visitTypeFilter, searchQuery, sortKey, sortDir]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const charts = useMemo(() => computeCharts(filtered), [filtered]);
	const uniqueVisitTypes = ["전체", ...new Set(allCustomers.map((c) => c.visitType))];

	// ── VIP 필터 ────────────────────────────────────────
	const vipCustomers = useMemo(() => {
		let data = allCustomers.filter((c) => c.vip);
		if (vipTierFilter !== "전체") data = data.filter((c) => c.vipTier === vipTierFilter);
		if (vipSearch.trim()) { const q = vipSearch.trim().toLowerCase(); data = data.filter((c) => c.name.toLowerCase().includes(q) || c.chartNo.toLowerCase().includes(q)); }
		if (vipSortKey) data.sort((a, b) => { const av = a[vipSortKey]; const bv = b[vipSortKey]; if (typeof av === "number" && typeof bv === "number") return vipSortDir === "asc" ? av - bv : bv - av; return vipSortDir === "asc" ? String(av ?? "").localeCompare(String(bv ?? "")) : String(bv ?? "").localeCompare(String(av ?? "")); });
		return data;
	}, [vipTierFilter, vipSearch, vipSortKey, vipSortDir]);

	const vipTotalPages = Math.max(1, Math.ceil(vipCustomers.length / PAGE_SIZE));
	const vipPaged = vipCustomers.slice((vipPage - 1) * PAGE_SIZE, vipPage * PAGE_SIZE);
	const vipCharts = useMemo(() => computeCharts(vipCustomers), [vipCustomers]);
	const allVips = allCustomers.filter((c) => c.vip);
	const vipTotalRevenue = allVips.reduce((s, c) => s + c.ownRevenue + c.referralRevenue, 0);
	const vipAvgVisits = allVips.length > 0 ? Math.round(allVips.reduce((s, c) => s + (c.totalVisits ?? 0), 0) / allVips.length) : 0;

	// ── KPI 계산 ────────────────────────────────────────
	// 동의율 = 치료를 권유받은 환자 중 실제 동의한 수 / 치료를 권유받은 전체 수 × 100
	const totalRecommended = allCustomers.filter((c) => c.recommended);
	const totalConsentCount = totalRecommended.filter((c) => c.consent).length;
	const totalConsentRate = totalRecommended.length > 0
		? Math.round((totalConsentCount / totalRecommended.length) * 1000) / 10
		: 0;
	const diamondCount = allCustomers.filter((c) => c.vipTier === "Diamond").length;

	const filteredRecommended = filtered.filter((c) => c.recommended);
	const filteredConsentRate = filteredRecommended.length > 0
		? Math.round((filteredRecommended.filter((c) => c.consent).length / filteredRecommended.length) * 1000) / 10
		: 0;

	const tierColor: Record<string, string> = {
		Gold: "bg-amber-100 text-amber-700 border-amber-300",
		Platinum: "bg-slate-100 text-slate-700 border-slate-300",
		Diamond: "bg-violet-100 text-violet-700 border-violet-300",
	};

	return (
		<div className="space-y-5">
			<h1 className="text-xl font-semibold tracking-tight">고객 대시보드</h1>

			{/* ── 상단 KPI 스트립 ── */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{/* 카드 1: 이달 목표 달성률 */}
				<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
					<CardContent className="py-4">
						<p className="text-xs text-muted-foreground mb-1">이달 목표 달성률</p>
						<p className="text-2xl font-bold">85.5%</p>
						<p className="text-xs text-muted-foreground mb-2">₩32.5M / 목표 ₩38M</p>
						<div className="h-1.5 bg-primary/20 rounded-full">
							<div className="h-full bg-primary rounded-full" style={{ width: "85.5%" }} />
						</div>
						<p className="text-xs text-emerald-600 mt-1.5">+8.4% vs 전월</p>
					</CardContent>
				</Card>

				{/* 카드 2: 동의율 */}
				<Card>
					<CardContent className="py-4">
						<div className="flex items-center gap-2 mb-1">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							<p className="text-xs text-muted-foreground">동의율</p>
						</div>
						<p className="text-2xl font-bold">{totalConsentRate}%</p>
						<p className="text-xs text-muted-foreground mt-0.5">권유 {totalRecommended.length}명 중 {totalConsentCount}명 동의</p>
						<p className="text-xs text-emerald-600 mt-1">+1.3% vs 전월</p>
					</CardContent>
				</Card>

				{/* 카드 3: 이달 확정금액 */}
				<Card>
					<CardContent className="py-4">
						<div className="flex items-center gap-2 mb-1">
							<TrendingUp className="h-4 w-4 text-violet-500" />
							<p className="text-xs text-muted-foreground">이달 확정금액</p>
						</div>
						<p className="text-2xl font-bold">₩28.3M</p>
						<p className="text-xs text-muted-foreground mt-1">목표 ₩32M 대비 88.4%</p>
					</CardContent>
				</Card>

				{/* 카드 4: 앰버서더 */}
				<Card>
					<CardContent className="py-4">
						<div className="flex items-center gap-2 mb-1">
							<Crown className="h-4 w-4 text-amber-500" />
							<p className="text-xs text-muted-foreground">앰버서더</p>
						</div>
						<p className="text-2xl font-bold">{diamondCount}명</p>
						<p className="text-xs text-emerald-600 mt-1">+2명 이달</p>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setTab}>
				<TabsList>
					<TabsTrigger value="kpi">상담실장 KPI</TabsTrigger>
					<TabsTrigger value="vip">VIP</TabsTrigger>
				</TabsList>

				{/* ════════════ KPI 탭 ════════════ */}
				<TabsContent value="kpi" className="mt-4 space-y-5">
					{/* 필터 바 */}
					<div className="flex flex-wrap items-center gap-2">
						<Select value={counselor} onValueChange={setCounselor}><SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="상담실장" /></SelectTrigger><SelectContent>{counselors.map((c) => (<SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>))}</SelectContent></Select>
						<div className="flex items-center gap-1.5 text-xs"><span className="text-muted-foreground">시작일</span><Input type="date" defaultValue="2026-01-01" className="h-8 w-[130px] text-xs" /></div>
						<div className="flex items-center gap-1.5 text-xs"><span className="text-muted-foreground">종료일</span><Input type="date" defaultValue="2026-01-31" className="h-8 w-[130px] text-xs" /></div>
						<Select value={visitTypeFilter} onValueChange={(v) => { setVisitTypeFilter(v); setPage(1); }}><SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="내원유형" /></SelectTrigger><SelectContent>{uniqueVisitTypes.map((t) => (<SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>))}</SelectContent></Select>
						<Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setPage(1); }}><SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue placeholder="성별" /></SelectTrigger><SelectContent>{genderOptions.map((g) => (<SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>))}</SelectContent></Select>
					</div>

					{/* 요약 카드 */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Card><CardContent className="py-4"><p className="text-xs text-muted-foreground mb-1">담당 고객 수</p><p className="text-2xl font-bold">{filtered.length} 명</p></CardContent></Card>
						<Card><CardContent className="py-4"><p className="text-xs text-muted-foreground mb-1">매출액</p><p className="text-2xl font-bold">{fmt(filtered.reduce((s, c) => s + c.ownRevenue + c.referralRevenue, 0))} 원</p></CardContent></Card>
						<Card><CardContent className="py-4"><p className="text-xs text-muted-foreground mb-1">동의율</p><p className="text-2xl font-bold">{filteredConsentRate}%</p><p className="text-xs text-muted-foreground mt-0.5">권유 {filteredRecommended.length}명 기준</p></CardContent></Card>
					</div>

					{/* 세그먼트 + 차트 */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
						<Card>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm">고객 세그먼트</CardTitle>
									<Select defaultValue="기여매출"><SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="기여매출" className="text-xs">기여매출</SelectItem><SelectItem value="본인매출" className="text-xs">본인매출</SelectItem></SelectContent></Select>
								</div>
								<p className="text-xs text-muted-foreground">X축: 기여 매출 (본인지출+소개유입으로 인해 창출된 매출)</p>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 mb-1"><div />{segmentColLabels.map((l) => (<p key={l} className="text-xs text-muted-foreground text-center">{l}</p>))}</div>
								{segmentMatrix.map((row, ri) => (
									<div key={segmentRowLabels[ri]} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 mb-2">
										<div className="flex items-center"><p className="text-xs text-muted-foreground leading-tight">{segmentRowLabels[ri]}</p></div>
										{row.map((cell) => (<button type="button" key={cell.group} onClick={() => { setSelectedSegment(selectedSegment === cell.group ? null : cell.group); setPage(1); }} className={cn("rounded-lg border p-3 text-center transition-all duration-200 cursor-pointer", cell.color, selectedSegment === cell.group ? "ring-2 ring-primary shadow-sm scale-[1.02]" : "hover:shadow-sm")}><p className="text-base font-bold">{cell.group} 그룹</p><p className="text-xs mt-1">{cell.count} 명</p><p className="text-xs text-muted-foreground">{cell.revenue} 원</p></button>))}
									</div>
								))}
							</CardContent>
						</Card>

						{/* 오른쪽: 동적 차트 */}
						<div className="space-y-5">
							{selectedSegment && <div className="flex items-center gap-2"><Badge variant="secondary" className="text-xs">{selectedSegment} 그룹 필터 적용 중</Badge><Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setSelectedSegment(null)}>초기화</Button></div>}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<Card><CardHeader className="pb-2"><CardTitle className="text-sm">성별 분포</CardTitle></CardHeader><CardContent className="flex justify-center"><DonutChart maleRatio={charts.maleRatio} /></CardContent></Card>
								<Card>
									<CardHeader className="pb-2"><CardTitle className="text-sm">연령별 분포</CardTitle></CardHeader>
									<CardContent>
										<div className="space-y-2">
											{charts.ageDistribution.map((age) => (<div key={age.label} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-14 shrink-0 text-right">{age.label}</span><div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden"><div className="h-full rounded-sm bg-sky-400" style={{ width: `${Math.min((age.value / 40) * 100, 100)}%` }} /></div><span className="text-xs text-muted-foreground w-10 shrink-0">{age.value.toFixed(1)}%</span></div>))}
										</div>
									</CardContent>
								</Card>
							</div>
							<Card>
								<CardHeader className="pb-2"><CardTitle className="text-sm">내원 유형 비중</CardTitle></CardHeader>
								<CardContent>
									<table className="w-full text-xs"><thead><tr className="border-b"><th className="text-left py-1.5 px-2 text-muted-foreground font-medium w-8">NO</th><th className="text-left py-1.5 px-2 text-muted-foreground font-medium">내원유형</th><th className="text-right py-1.5 px-2 text-muted-foreground font-medium w-20">비중</th></tr></thead>
										<tbody>{charts.visitTypeRanking.map((v, i) => (<tr key={v.type} className="border-b last:border-0 hover:bg-muted/50"><td className="py-1.5 px-2">{i + 1}</td><td className="py-1.5 px-2">{v.type}</td><td className="py-1.5 px-2 text-right"><div className="flex items-center justify-end gap-2"><div className="w-16 h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((v.ratio / 30) * 100, 100)}%` }} /></div><span className="w-10 text-right font-medium">{v.ratio.toFixed(1)}%</span></div></td></tr>))}</tbody>
									</table>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* 고객 정보 테이블 */}
					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<CardTitle className="text-sm">고객 정보</CardTitle>
									<span className="text-xs text-muted-foreground">{filtered.length}명</span>
									{selectedSegment && <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setSelectedSegment(null)}>{selectedSegment} 그룹 ✕</Badge>}
								</div>
								<div className="flex items-center gap-2">
									<div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="이름, 차트번호 검색..." className="h-8 w-[180px] text-xs pl-8" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} /></div>
									<Button variant="ghost" size="icon" className="h-7 w-7"><Settings2 className="h-3.5 w-3.5" /></Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-xs">
									<thead><tr className="border-b bg-muted/40">
										<SortableHeader label="차트번호" sortKey="chartNo" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-left" />
										<SortableHeader label="고객명" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-left" />
										<SortableHeader label="성별" sortKey="gender" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center" />
										<SortableHeader label="생년월일" sortKey="birth" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center" />
										<SortableHeader label="내원유형" sortKey="visitType" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-left" />
										<SortableHeader label="최초내원일" sortKey="firstVisit" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center" />
										<SortableHeader label="최종내원일" sortKey="lastVisit" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center" />
										<SortableHeader label="본인매출" sortKey="ownRevenue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
										<SortableHeader label="소개매출" sortKey="referralRevenue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
										<SortableHeader label="총 소개자 수" sortKey="referralCount" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center" />
										<th className="py-2 px-2 font-medium text-muted-foreground whitespace-nowrap text-center">동의</th>
									</tr></thead>
									<tbody>
										{paged.map((c) => (<tr key={c.chartNo} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
											<td className="py-2 px-2 text-muted-foreground">{c.chartNo}</td>
											<td className="py-2 px-2 font-medium"><div className="flex items-center gap-1.5">{c.vip && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}{c.name}</div></td>
											<td className="py-2 px-2 text-center"><Badge variant="outline" className={cn("text-xs px-1.5 py-0", c.gender === "F" ? "bg-pink-50 text-pink-600 border-pink-200" : "bg-blue-50 text-blue-600 border-blue-200")}>{c.gender === "F" ? "여" : "남"}</Badge></td>
											<td className="py-2 px-2 text-center text-muted-foreground">{c.birth}</td>
											<td className="py-2 px-2">{c.visitType}</td>
											<td className="py-2 px-2 text-center text-muted-foreground">{c.firstVisit}</td>
											<td className="py-2 px-2 text-center text-muted-foreground">{c.lastVisit}</td>
											<td className="py-2 px-2 text-right font-mono">{fmt(c.ownRevenue)}</td>
											<td className="py-2 px-2 text-right font-mono">{fmt(c.referralRevenue)}</td>
											<td className="py-2 px-2 text-center">{c.referralCount}</td>
											<td className="py-2 px-2 text-center">
												{c.consent
													? <Badge variant="outline" className="text-xs px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">동의</Badge>
													: <Badge variant="outline" className="text-xs px-1.5 py-0 bg-red-50 text-red-600 border-red-200">미동의</Badge>}
											</td>
										</tr>))}
										{paged.length === 0 && <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">검색 결과가 없습니다.</td></tr>}
									</tbody>
								</table>
							</div>
							{totalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{filtered.length}건 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filtered.length)}</span><Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={cn(page === 1 && "pointer-events-none opacity-50")} /></PaginationItem>{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (<PaginationItem key={p}><PaginationLink isActive={p === page} onClick={() => setPage(p)}>{p}</PaginationLink></PaginationItem>))}<PaginationItem><PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={cn(page === totalPages && "pointer-events-none opacity-50")} /></PaginationItem></PaginationContent></Pagination></div>}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ════════════ VIP 탭 ════════════ */}
				<TabsContent value="vip" className="mt-4 space-y-5">
					{/* VIP 요약 카드 */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
							<CardContent className="py-4">
								<div className="flex items-center gap-2 mb-1"><Crown className="h-4 w-4 text-amber-600" /><p className="text-xs text-amber-700">VIP 고객 수</p></div>
								<p className="text-2xl font-bold text-amber-900">{allVips.length} 명</p>
								<p className="text-xs text-amber-600 mt-1">전체 고객의 {((allVips.length / allCustomers.length) * 100).toFixed(1)}%</p>
							</CardContent>
						</Card>
						<Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
							<CardContent className="py-4">
								<div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-violet-600" /><p className="text-xs text-violet-700">VIP 총 매출</p></div>
								<p className="text-2xl font-bold text-violet-900">{fmt(vipTotalRevenue)} 원</p>
								<p className="text-xs text-violet-600 mt-1">전체 매출의 {((vipTotalRevenue / allCustomers.reduce((s, c) => s + c.ownRevenue + c.referralRevenue, 0)) * 100).toFixed(1)}%</p>
							</CardContent>
						</Card>
						<Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
							<CardContent className="py-4">
								<div className="flex items-center gap-2 mb-1"><Gift className="h-4 w-4 text-emerald-600" /><p className="text-xs text-emerald-700">VIP 평균 방문</p></div>
								<p className="text-2xl font-bold text-emerald-900">{vipAvgVisits} 회</p>
								<p className="text-xs text-emerald-600 mt-1">일반 고객 대비 4.2배</p>
							</CardContent>
						</Card>
						<Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
							<CardContent className="py-4">
								<div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-sky-600" /><p className="text-xs text-sky-700">VIP 인당 매출</p></div>
								<p className="text-2xl font-bold text-sky-900">{allVips.length > 0 ? fmt(Math.round(vipTotalRevenue / allVips.length)) : 0} 원</p>
								<p className="text-xs text-sky-600 mt-1">일반 고객 대비 5.8배</p>
							</CardContent>
						</Card>
					</div>

					{/* VIP 등급 분포 */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{(["Diamond", "Platinum", "Gold"] as const).map((tier) => {
							const tierVips = allVips.filter((c) => c.vipTier === tier);
							const tierRevenue = tierVips.reduce((s, c) => s + c.ownRevenue + c.referralRevenue, 0);
							return (
								<Card key={tier} className={cn("cursor-pointer transition-all duration-200 hover:shadow-md", vipTierFilter === tier ? "ring-2 ring-primary" : "")} onClick={() => { setVipTierFilter(vipTierFilter === tier ? "전체" : tier); setVipPage(1); }}>
									<CardContent className="py-4">
										<div className="flex items-center justify-between">
											<div>
												<Badge variant="outline" className={cn("text-xs mb-2", tierColor[tier])}>{tier}</Badge>
												<p className="text-xl font-bold">{tierVips.length}명</p>
												<p className="text-xs text-muted-foreground">{fmt(tierRevenue)} 원</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-muted-foreground">평균 방문</p>
												<p className="text-lg font-bold">{tierVips.length > 0 ? Math.round(tierVips.reduce((s, c) => s + (c.totalVisits ?? 0), 0) / tierVips.length) : 0}회</p>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* VIP 차트 */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<Card><CardHeader className="pb-2"><CardTitle className="text-sm">VIP 성별 분포</CardTitle></CardHeader><CardContent className="flex justify-center"><DonutChart maleRatio={vipCharts.maleRatio} /></CardContent></Card>
						<Card>
							<CardHeader className="pb-2"><CardTitle className="text-sm">VIP 연령별 분포</CardTitle></CardHeader>
							<CardContent>
								<div className="space-y-2">
									{vipCharts.ageDistribution.map((age) => (<div key={age.label} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-14 shrink-0 text-right">{age.label}</span><div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden"><div className="h-full rounded-sm bg-amber-400" style={{ width: `${Math.min((age.value / 50) * 100, 100)}%` }} /></div><span className="text-xs text-muted-foreground w-10 shrink-0">{age.value.toFixed(1)}%</span></div>))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* VIP 고객 테이블 */}
					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<CardTitle className="text-sm">VIP 고객 목록</CardTitle>
									<span className="text-xs text-muted-foreground">{vipCustomers.length}명</span>
									{vipTierFilter !== "전체" && <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setVipTierFilter("전체")}>{vipTierFilter} ✕</Badge>}
								</div>
								<div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="이름, 차트번호 검색..." className="h-8 w-[180px] text-xs pl-8" value={vipSearch} onChange={(e) => { setVipSearch(e.target.value); setVipPage(1); }} /></div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-xs">
									<thead><tr className="border-b bg-muted/40">
										<SortableHeader label="차트번호" sortKey="chartNo" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-left" />
										<SortableHeader label="고객명" sortKey="name" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-left" />
										<th className="py-2 px-2 font-medium text-muted-foreground whitespace-nowrap text-center">등급</th>
										<SortableHeader label="VIP 시작일" sortKey="vipSince" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-center" />
										<SortableHeader label="총 방문" sortKey="totalVisits" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-center" />
										<SortableHeader label="본인매출" sortKey="ownRevenue" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-right" />
										<SortableHeader label="소개매출" sortKey="referralRevenue" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-right" />
										<SortableHeader label="소개자 수" sortKey="referralCount" currentKey={vipSortKey} currentDir={vipSortDir} onSort={handleVipSort} className="text-center" />
										<th className="py-2 px-2 font-medium text-muted-foreground whitespace-nowrap text-right">총 매출</th>
										<th className="py-2 px-2 font-medium text-muted-foreground whitespace-nowrap text-center">동의</th>
									</tr></thead>
									<tbody>
										{vipPaged.map((c) => (<tr key={c.chartNo} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
											<td className="py-2 px-2 text-muted-foreground">{c.chartNo}</td>
											<td className="py-2 px-2 font-medium"><div className="flex items-center gap-1.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />{c.name}</div></td>
											<td className="py-2 px-2 text-center"><Badge variant="outline" className={cn("text-xs px-1.5 py-0", tierColor[c.vipTier ?? "Gold"])}>{c.vipTier}</Badge></td>
											<td className="py-2 px-2 text-center text-muted-foreground">{c.vipSince}</td>
											<td className="py-2 px-2 text-center font-medium">{c.totalVisits}회</td>
											<td className="py-2 px-2 text-right font-mono">{fmt(c.ownRevenue)}</td>
											<td className="py-2 px-2 text-right font-mono">{fmt(c.referralRevenue)}</td>
											<td className="py-2 px-2 text-center">{c.referralCount}</td>
											<td className="py-2 px-2 text-right font-mono font-medium">{fmt(c.ownRevenue + c.referralRevenue)}</td>
											<td className="py-2 px-2 text-center">
												{c.consent
													? <Badge variant="outline" className="text-xs px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">동의</Badge>
													: <Badge variant="outline" className="text-xs px-1.5 py-0 bg-red-50 text-red-600 border-red-200">미동의</Badge>}
											</td>
										</tr>))}
										{vipPaged.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">검색 결과가 없습니다.</td></tr>}
									</tbody>
								</table>
							</div>
							{vipTotalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{vipCustomers.length}건 중 {(vipPage - 1) * PAGE_SIZE + 1}~{Math.min(vipPage * PAGE_SIZE, vipCustomers.length)}</span><Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={() => setVipPage((p) => Math.max(1, p - 1))} className={cn(vipPage === 1 && "pointer-events-none opacity-50")} /></PaginationItem>{Array.from({ length: vipTotalPages }, (_, i) => i + 1).map((p) => (<PaginationItem key={p}><PaginationLink isActive={p === vipPage} onClick={() => setVipPage(p)}>{p}</PaginationLink></PaginationItem>))}<PaginationItem><PaginationNext onClick={() => setVipPage((p) => Math.min(vipTotalPages, p + 1))} className={cn(vipPage === vipTotalPages && "pointer-events-none opacity-50")} /></PaginationItem></PaginationContent></Pagination></div>}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
