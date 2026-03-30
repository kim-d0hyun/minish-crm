import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Bell,
	CalendarDays,
	CalendarX,
	CreditCard,
	Gift,
	MessageSquare,
	Tag,
	UserCheck,
	UserPlus,
	Users,
	Zap,
} from "lucide-react";

// ── 타입 ─────────────────────────────────────────────────

export type StepKind = "trigger" | "condition" | "action";

export interface BuilderStep {
	id: string;
	kind: StepKind;
	type: string;
	config: Record<string, string>;
}

export interface WorkflowRun {
	date: string;
	count: number;
	success: number;
}

export interface Workflow {
	id: string;
	name: string;
	steps: BuilderStep[];
	active: boolean;
	executions: number;
	successRate: number;
	lastRun?: string;
	recentRuns: WorkflowRun[];
}

export interface SelectOption {
	value: string;
	label: string;
}

export interface ConfigField {
	key: string;
	label: string;
	type: "text" | "number" | "select";
	placeholder?: string;
	options?: SelectOption[];
	defaultValue?: string;
}

export interface StepMeta {
	label: string;
	icon: LucideIcon;
	fields: ConfigField[];
	summary: (config: Record<string, string>) => string;
}

// ── 메타 정의 ─────────────────────────────────────────────

export const triggerMeta: Record<string, StepMeta> = {
	visit_complete: { label: "방문 완료", icon: UserCheck, fields: [], summary: () => "고객 방문이 완료되면 실행" },
	payment_complete: { label: "결제 완료", icon: CreditCard, fields: [], summary: () => "결제가 완료되면 실행" },
	no_visit_days: {
		label: "N일 미방문",
		icon: CalendarX,
		fields: [{ key: "days", label: "미방문 기준 일수", type: "number", placeholder: "90", defaultValue: "90" }],
		summary: (c) => `마지막 방문 후 ${c.days || "N"}일이 지나면 실행`,
	},
	birthday: { label: "생일 당일", icon: Gift, fields: [], summary: () => "고객 생일 당일 오전 9시에 실행" },
	reservation_before: {
		label: "예약 N일 전",
		icon: CalendarDays,
		fields: [{ key: "days", label: "예약 며칠 전", type: "number", placeholder: "1", defaultValue: "1" }],
		summary: (c) => `예약 ${c.days || "N"}일 전 오전 10시에 실행`,
	},
	lead_added: { label: "리드 유입", icon: UserPlus, fields: [], summary: () => "새 리드가 유입되면 실행" },
};

export const conditionMeta: Record<string, StepMeta> = {
	grade_is: {
		label: "고객 등급 조건",
		icon: Tag,
		fields: [
			{ key: "operator", label: "조건", type: "select", options: [{ value: "eq", label: "=" }, { value: "ne", label: "≠" }], defaultValue: "eq" },
			{ key: "value", label: "등급", type: "select", options: [{ value: "VIP", label: "VIP" }, { value: "일반", label: "일반" }, { value: "신규", label: "신규" }, { value: "휴면", label: "휴면" }], defaultValue: "VIP" },
		],
		summary: (c) => `고객 등급 ${c.operator === "ne" ? "≠" : "="} ${c.value || "?"}인 경우`,
	},
	payment_total: {
		label: "총 결제 금액 조건",
		icon: CreditCard,
		fields: [
			{ key: "operator", label: "조건", type: "select", options: [{ value: "gte", label: "이상" }, { value: "lte", label: "이하" }], defaultValue: "gte" },
			{ key: "value", label: "금액 (원)", type: "number", placeholder: "3000000" },
		],
		summary: (c) => `총 결제 ${c.value ? Number(c.value).toLocaleString() : "?"}원 ${c.operator === "lte" ? "이하" : "이상"}인 경우`,
	},
	visit_count: {
		label: "방문 횟수 조건",
		icon: CalendarDays,
		fields: [
			{ key: "operator", label: "조건", type: "select", options: [{ value: "gte", label: "회 이상" }, { value: "lte", label: "회 이하" }, { value: "eq", label: "회 정확히" }], defaultValue: "gte" },
			{ key: "value", label: "횟수", type: "number", placeholder: "3" },
		],
		summary: (c) => `방문 ${c.value || "?"}${c.operator === "lte" ? "회 이하" : c.operator === "eq" ? "회 정확히" : "회 이상"}인 경우`,
	},
	gender: {
		label: "성별 조건",
		icon: Users,
		fields: [{ key: "value", label: "성별", type: "select", options: [{ value: "F", label: "여성" }, { value: "M", label: "남성" }], defaultValue: "F" }],
		summary: (c) => `고객 성별 = ${c.value === "M" ? "남성" : "여성"}인 경우`,
	},
};

export const actionMeta: Record<string, StepMeta> = {
	send_message: {
		label: "메시지 발송",
		icon: MessageSquare,
		fields: [
			{
				key: "template", label: "템플릿 선택", type: "select",
				options: [
					{ value: "thanks", label: "방문 완료 감사" }, { value: "revisit", label: "재방문 유도" },
					{ value: "reservation", label: "예약 확인" }, { value: "followup", label: "시술 경과 확인" },
					{ value: "birthday", label: "생일 축하" }, { value: "vip", label: "VIP 감사 메시지" },
				],
				defaultValue: "thanks",
			},
		],
		summary: (c) => {
			const names: Record<string, string> = { thanks: "방문 완료 감사", revisit: "재방문 유도", reservation: "예약 확인", followup: "시술 경과 확인", birthday: "생일 축하", vip: "VIP 감사" };
			return `"${names[c.template] ?? "미선택"}" 메시지 자동 발송`;
		},
	},
	issue_coupon: {
		label: "쿠폰 발급",
		icon: Gift,
		fields: [
			{ key: "discount", label: "할인율 (%)", type: "number", placeholder: "10", defaultValue: "10" },
			{ key: "expiry", label: "유효 기간 (일)", type: "number", placeholder: "30", defaultValue: "30" },
		],
		summary: (c) => `${c.discount || "?"}% 할인 쿠폰 발급 (${c.expiry || "?"}일 유효)`,
	},
	change_grade: {
		label: "등급 변경",
		icon: Zap,
		fields: [
			{ key: "grade", label: "변경 등급", type: "select", options: [{ value: "VIP", label: "VIP" }, { value: "일반", label: "일반" }, { value: "휴면", label: "휴면" }], defaultValue: "VIP" },
		],
		summary: (c) => `등급을 "${c.grade || "?"}"(으)로 자동 변경`,
	},
	notify_staff: {
		label: "담당자 알림",
		icon: Bell,
		fields: [
			{
				key: "counselor", label: "알림 대상", type: "select",
				options: [{ value: "all", label: "전체 실장" }, { value: "이상담", label: "이상담" }, { value: "박상담", label: "박상담" }, { value: "김상담", label: "김상담" }],
				defaultValue: "all",
			},
		],
		summary: (c) => `${c.counselor === "all" ? "전체 실장" : (c.counselor || "?")}에게 내부 알림 발송`,
	},
};

export const kindMeta: Record<StepKind, Record<string, StepMeta>> = {
	trigger: triggerMeta,
	condition: conditionMeta,
	action: actionMeta,
};

export const kindStyle = {
	trigger: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", iconBg: "bg-blue-100", iconText: "text-blue-600", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700 border-blue-200" },
	condition: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", iconBg: "bg-amber-100", iconText: "text-amber-600", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200" },
	action: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", iconBg: "bg-emerald-100", iconText: "text-emerald-600", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export const kindLabel: Record<StepKind, string> = { trigger: "트리거", condition: "조건", action: "액션" };

export function getMeta(step: BuilderStep): StepMeta | null {
	return kindMeta[step.kind]?.[step.type] ?? null;
}

export function getDefaultConfig(kind: StepKind, type: string): Record<string, string> {
	const meta = kindMeta[kind]?.[type];
	if (!meta) return {};
	return meta.fields.reduce<Record<string, string>>((acc, f) => {
		if (f.defaultValue !== undefined) acc[f.key] = f.defaultValue;
		return acc;
	}, {});
}

// ── 초기 데이터 ──────────────────────────────────────────

const initialWorkflows: Workflow[] = [
	{
		id: "1", name: "방문 후 사후관리 플로우",
		steps: [
			{ id: "t1", kind: "trigger", type: "visit_complete", config: {} },
			{ id: "a1", kind: "action", type: "send_message", config: { template: "thanks" } },
			{ id: "a2", kind: "action", type: "send_message", config: { template: "followup" } },
		],
		active: true, executions: 482, successRate: 97.5, lastRun: "2026-03-30 14:22",
		recentRuns: [{ date: "03/30", count: 8, success: 8 }, { date: "03/29", count: 5, success: 5 }, { date: "03/28", count: 7, success: 7 }, { date: "03/27", count: 6, success: 6 }, { date: "03/26", count: 4, success: 4 }],
	},
	{
		id: "2", name: "휴면 고객 재활성화",
		steps: [
			{ id: "t2", kind: "trigger", type: "no_visit_days", config: { days: "90" } },
			{ id: "c2", kind: "condition", type: "visit_count", config: { operator: "gte", value: "3" } },
			{ id: "a3", kind: "action", type: "issue_coupon", config: { discount: "15", expiry: "30" } },
			{ id: "a4", kind: "action", type: "send_message", config: { template: "revisit" } },
		],
		active: true, executions: 89, successRate: 94.4, lastRun: "2026-03-25 09:00",
		recentRuns: [{ date: "03/25", count: 3, success: 3 }, { date: "03/18", count: 2, success: 2 }, { date: "03/11", count: 4, success: 3 }],
	},
	{
		id: "3", name: "VIP 자동 등급 승급",
		steps: [
			{ id: "t3", kind: "trigger", type: "payment_complete", config: {} },
			{ id: "c3", kind: "condition", type: "payment_total", config: { operator: "gte", value: "3000000" } },
			{ id: "a5", kind: "action", type: "change_grade", config: { grade: "VIP" } },
			{ id: "a6", kind: "action", type: "send_message", config: { template: "vip" } },
		],
		active: false, executions: 23, successRate: 100, lastRun: "2026-02-12 15:30",
		recentRuns: [{ date: "02/12", count: 1, success: 1 }],
	},
	{
		id: "4", name: "생일 특별 혜택 발송",
		steps: [
			{ id: "t4", kind: "trigger", type: "birthday", config: {} },
			{ id: "a7", kind: "action", type: "send_message", config: { template: "birthday" } },
			{ id: "a8", kind: "action", type: "issue_coupon", config: { discount: "10", expiry: "30" } },
		],
		active: true, executions: 156, successRate: 98.7, lastRun: "2026-03-30 09:02",
		recentRuns: [{ date: "03/30", count: 1, success: 1 }, { date: "03/22", count: 2, success: 2 }],
	},
	{
		id: "5", name: "예약 리마인더",
		steps: [
			{ id: "t5", kind: "trigger", type: "reservation_before", config: { days: "1" } },
			{ id: "a9", kind: "action", type: "send_message", config: { template: "reservation" } },
			{ id: "a10", kind: "action", type: "notify_staff", config: { counselor: "all" } },
		],
		active: true, executions: 312, successRate: 99.0, lastRun: "2026-03-29 10:00",
		recentRuns: [{ date: "03/29", count: 4, success: 4 }, { date: "03/28", count: 3, success: 3 }, { date: "03/27", count: 5, success: 5 }],
	},
];

// ── 모듈 레벨 스토어 ──────────────────────────────────────

type Listener = () => void;
let _workflows: Workflow[] = [...initialWorkflows];
const listeners = new Set<Listener>();

export const workflowsStore = {
	get(): Workflow[] {
		return _workflows;
	},
	getById(id: string): Workflow | undefined {
		return _workflows.find((w) => w.id === id);
	},
	upsert(wf: Workflow): void {
		const exists = _workflows.some((w) => w.id === wf.id);
		_workflows = exists
			? _workflows.map((w) => (w.id === wf.id ? wf : w))
			: [wf, ..._workflows];
		listeners.forEach((l) => l());
	},
	toggle(id: string): void {
		_workflows = _workflows.map((w) =>
			w.id === id ? { ...w, active: !w.active } : w,
		);
		listeners.forEach((l) => l());
	},
	delete(id: string): void {
		_workflows = _workflows.filter((w) => w.id !== id);
		listeners.forEach((l) => l());
	},
	subscribe(fn: Listener): () => void {
		listeners.add(fn);
		return () => listeners.delete(fn);
	},
};

export function useWorkflowsStore(): Workflow[] {
	const [, rerender] = useState(0);
	useEffect(() => {
		return workflowsStore.subscribe(() => rerender((n) => n + 1));
	}, []);
	return workflowsStore.get();
}
