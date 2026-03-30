import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	AlertCircle,
	Bell,
	CalendarDays,
	CalendarX,
	CheckSquare,
	ClipboardList,
	CreditCard,
	Gift,
	MessageSquare,
	Phone,
	RefreshCw,
	Shield,
	Tag,
	UserCheck,
	UserPlus,
	UserX,
	Users,
	XCircle,
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

// ── 트리거 메타 ───────────────────────────────────────────

export const triggerMeta: Record<string, StepMeta> = {
	// 기존
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

	// 환자 여정 — 신규
	inquiry_registered: { label: "문의 등록", icon: ClipboardList, fields: [], summary: () => "새 문의가 등록되면 실행" },
	reservation_cancelled: { label: "예약 취소/변경", icon: CalendarX, fields: [], summary: () => "예약이 취소 또는 변경되면 실행" },
	reservation_noshow: { label: "노쇼 발생", icon: UserX, fields: [], summary: () => "노쇼가 발생하면 실행" },
	treatment_completed: { label: "치료 완료", icon: Activity, fields: [], summary: () => "치료가 완료 처리되면 실행" },
	recall_date: {
		label: "리콜 예정일",
		icon: RefreshCw,
		fields: [{ key: "days_before", label: "예정일 며칠 전", type: "number", placeholder: "0", defaultValue: "0" }],
		summary: (c) => c.days_before === "0" ? "리콜 예정일 당일 실행" : `리콜 예정일 ${c.days_before}일 전 실행`,
	},
	long_no_visit_dormant: {
		label: "장기 미방문 (휴면)",
		icon: CalendarX,
		fields: [
			{
				key: "months", label: "미방문 기준 (개월)", type: "select",
				options: [{ value: "3", label: "3개월" }, { value: "6", label: "6개월" }, { value: "12", label: "12개월" }],
				defaultValue: "6",
			},
		],
		summary: (c) => `마지막 방문 후 ${c.months || "6"}개월이 지나면 실행`,
	},
};

// ── 조건 메타 ─────────────────────────────────────────────

export const conditionMeta: Record<string, StepMeta> = {
	// 기존
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

	// 환자 여정 — 신규
	contact_available: {
		label: "연락 가능 여부",
		icon: Phone,
		fields: [
			{ key: "value", label: "연락 상태", type: "select", options: [{ value: "yes", label: "수신/연락 가능" }, { value: "no", label: "수신 불가" }], defaultValue: "yes" },
		],
		summary: (c) => `연락 ${c.value === "no" ? "불가" : "가능"} 상태인 경우`,
	},
	patient_stage: {
		label: "환자 여정 단계",
		icon: Activity,
		fields: [
			{
				key: "stage", label: "현재 단계", type: "select",
				options: [
					{ value: "A", label: "A. 문의/예약 전후" },
					{ value: "B", label: "B. 초진/상담/견적" },
					{ value: "C", label: "C. 치료 진행" },
					{ value: "D", label: "D. 치료 완료 후 사후관리" },
					{ value: "E", label: "E. 휴면/재활성화" },
				],
				defaultValue: "A",
			},
		],
		summary: (c) => `환자 여정이 ${c.stage || "?"}단계인 경우`,
	},
	reservation_exists: {
		label: "예약 존재 여부",
		icon: CalendarDays,
		fields: [
			{ key: "value", label: "예약 상태", type: "select", options: [{ value: "yes", label: "예약 있음" }, { value: "no", label: "예약 없음" }], defaultValue: "yes" },
		],
		summary: (c) => `다음 예약이 ${c.value === "no" ? "없는" : "있는"} 경우`,
	},
	consultation_done: {
		label: "상담 완료 여부",
		icon: CheckSquare,
		fields: [
			{ key: "value", label: "상담 상태", type: "select", options: [{ value: "yes", label: "상담 완료" }, { value: "no", label: "상담 미완료" }], defaultValue: "yes" },
		],
		summary: (c) => `상담(치료계획/견적)이 ${c.value === "no" ? "미완료인" : "완료된"} 경우`,
	},
	undecision_reason: {
		label: "미결정 사유",
		icon: AlertCircle,
		fields: [
			{
				key: "reason", label: "미결정 사유", type: "select",
				options: [
					{ value: "cost", label: "비용 부담" },
					{ value: "schedule", label: "일정 문제" },
					{ value: "decision", label: "의사결정 보류" },
					{ value: "compare", label: "타병원 비교" },
					{ value: "other", label: "기타/거절" },
				],
				defaultValue: "cost",
			},
		],
		summary: (c) => {
			const labels: Record<string, string> = { cost: "비용 부담", schedule: "일정 문제", decision: "의사결정 보류", compare: "타병원 비교", other: "기타/거절" };
			return `미결정 사유가 "${labels[c.reason] ?? "?"}"인 경우`;
		},
	},
	tracking_count: {
		label: "추적 횟수 한도",
		icon: RefreshCw,
		fields: [
			{ key: "operator", label: "조건", type: "select", options: [{ value: "exceeded", label: "한도 초과" }, { value: "within", label: "한도 이내" }], defaultValue: "within" },
			{ key: "limit", label: "최대 횟수", type: "number", placeholder: "3", defaultValue: "3" },
		],
		summary: (c) => `추적 횟수가 ${c.limit || "3"}회 한도를 ${c.operator === "exceeded" ? "초과한" : "초과하지 않은"} 경우`,
	},
	recall_target: {
		label: "리콜 대상 여부",
		icon: RefreshCw,
		fields: [
			{
				key: "type", label: "리콜 유형", type: "select",
				options: [
					{ value: "checkup", label: "정기 검진" },
					{ value: "scaling", label: "스케일링" },
					{ value: "followup", label: "경과 체크" },
					{ value: "any", label: "전체" },
				],
				defaultValue: "any",
			},
		],
		summary: (c) => {
			const labels: Record<string, string> = { checkup: "정기검진", scaling: "스케일링", followup: "경과체크", any: "전체" };
			return `${labels[c.type] ?? "?"}  리콜 대상인 경우`;
		},
	},
	treatment_interruption: {
		label: "치료 중단/지연 징후",
		icon: AlertCircle,
		fields: [
			{
				key: "sign", label: "징후 유형", type: "select",
				options: [
					{ value: "overdue", label: "예정일 경과" },
					{ value: "cancel_repeat", label: "예약취소 반복" },
					{ value: "payment_delay", label: "결제 지연" },
					{ value: "long_absence", label: "장기 미내원" },
					{ value: "any", label: "전체 해당" },
				],
				defaultValue: "any",
			},
		],
		summary: (c) => {
			const labels: Record<string, string> = { overdue: "예정일 경과", cancel_repeat: "예약취소 반복", payment_delay: "결제 지연", long_absence: "장기 미내원", any: "치료 중단/지연 징후" };
			return `${labels[c.sign] ?? "?"}이 감지된 경우`;
		},
	},
};

// ── 액션 메타 ─────────────────────────────────────────────

export const actionMeta: Record<string, StepMeta> = {
	// 기존
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

	// 환자 여정 — 신규
	stop_action: {
		label: "액션 중지",
		icon: XCircle,
		fields: [],
		summary: () => "연락 불가 상태 — 이후 액션 실행 중지",
	},
	send_consultation_crm: {
		label: "상담 유도 CRM 발송",
		icon: MessageSquare,
		fields: [
			{
				key: "channel", label: "발송 채널", type: "select",
				options: [{ value: "kakao", label: "카카오 알림톡" }, { value: "sms", label: "SMS" }, { value: "both", label: "카카오+SMS" }],
				defaultValue: "kakao",
			},
		],
		summary: (c) => `${c.channel === "both" ? "카카오+SMS" : c.channel === "sms" ? "SMS" : "카카오 알림톡"}으로 상담 유도 CRM 발송`,
	},
	send_reservation_reminder: {
		label: "예약 리마인드 발송",
		icon: CalendarDays,
		fields: [
			{
				key: "timing", label: "발송 시점", type: "select",
				options: [{ value: "1day", label: "예약 1일 전" }, { value: "3day", label: "예약 3일 전" }, { value: "1hour", label: "예약 1시간 전" }],
				defaultValue: "1day",
			},
		],
		summary: (c) => {
			const t: Record<string, string> = { "1day": "1일 전", "3day": "3일 전", "1hour": "1시간 전" };
			return `예약 ${t[c.timing] ?? "?"}에 리마인드 메시지 발송`;
		},
	},
	trigger_rebook: {
		label: "재예약 유도",
		icon: CalendarDays,
		fields: [
			{
				key: "type", label: "유형", type: "select",
				options: [{ value: "cancel", label: "취소/변경 후 재예약" }, { value: "noshow", label: "노쇼 후 재예약" }, { value: "next", label: "다음 치료 예약" }],
				defaultValue: "next",
			},
		],
		summary: (c) => {
			const t: Record<string, string> = { cancel: "취소 후 재예약 유도", noshow: "노쇼 후 재예약 유도", next: "다음 치료 예약 유도" };
			return t[c.type] ?? "재예약 유도 메시지 발송";
		},
	},
	trigger_noshow_recovery: {
		label: "노쇼 회복 플로우",
		icon: UserX,
		fields: [
			{
				key: "step", label: "회복 단계", type: "select",
				options: [{ value: "1", label: "1차 — 당일 연락" }, { value: "2", label: "2차 — 3일 후 재연락" }, { value: "3", label: "3차 — 1주 후 재연락" }],
				defaultValue: "1",
			},
		],
		summary: (c) => `노쇼 회복 ${c.step || "1"}차 연락 실행`,
	},
	assign_staff_task: {
		label: "직원 태스크 배정",
		icon: ClipboardList,
		fields: [
			{
				key: "counselor", label: "배정 대상", type: "select",
				options: [{ value: "all", label: "전체 실장" }, { value: "이상담", label: "이상담" }, { value: "박상담", label: "박상담" }, { value: "김상담", label: "김상담" }],
				defaultValue: "all",
			},
			{
				key: "task", label: "태스크 내용", type: "select",
				options: [
					{ value: "cost_proposal", label: "분납/우선치료/패키지 재제안" },
					{ value: "schedule_slot", label: "예약 가능 슬롯 제안" },
					{ value: "info_provide", label: "정보 제공/사례 안내" },
					{ value: "differentiator", label: "차별점 안내 + 재상담 유도" },
					{ value: "recontact_eval", label: "주기적 재접촉 대상 여부 판단" },
					{ value: "custom", label: "직접 입력" },
				],
				defaultValue: "cost_proposal",
			},
		],
		summary: (c) => {
			const tasks: Record<string, string> = { cost_proposal: "분납/패키지 재제안", schedule_slot: "슬롯 제안", info_provide: "정보 제공", differentiator: "차별점 안내", recontact_eval: "재접촉 판단", custom: "커스텀 태스크" };
			return `${c.counselor === "all" ? "전체 실장" : c.counselor}에게 "${tasks[c.task] ?? "?"}" 태스크 배정`;
		},
	},
	send_retention_crm: {
		label: "이탈방지 CRM 발송",
		icon: Shield,
		fields: [
			{
				key: "reason", label: "이탈 사유", type: "select",
				options: [
					{ value: "no_next_reservation", label: "다음 예약 없음" },
					{ value: "cancel_repeat", label: "예약 반복 취소" },
					{ value: "long_absence", label: "장기 미내원" },
					{ value: "payment_delay", label: "결제 지연" },
				],
				defaultValue: "no_next_reservation",
			},
		],
		summary: (c) => {
			const r: Record<string, string> = { no_next_reservation: "다음 예약 없음", cancel_repeat: "예약 반복 취소", long_absence: "장기 미내원", payment_delay: "결제 지연" };
			return `이탈방지 CRM 발송 (${r[c.reason] ?? "?"} 사유)`;
		},
	},
	send_recall_crm: {
		label: "리콜 CRM 발송",
		icon: RefreshCw,
		fields: [
			{
				key: "sequence", label: "발송 차수", type: "select",
				options: [{ value: "1", label: "1차 리콜" }, { value: "2", label: "2차 리콜" }, { value: "3", label: "3차 리콜" }],
				defaultValue: "1",
			},
		],
		summary: (c) => `리콜 ${c.sequence || "1"}차 CRM 발송`,
	},
	tag_dormant: {
		label: "휴면 태깅",
		icon: UserX,
		fields: [
			{
				key: "level", label: "휴면 등급", type: "select",
				options: [{ value: "candidate", label: "휴면 후보군" }, { value: "dormant", label: "휴면" }, { value: "long_dormant", label: "장기 휴면" }],
				defaultValue: "dormant",
			},
		],
		summary: (c) => {
			const l: Record<string, string> = { candidate: "휴면 후보군", dormant: "휴면", long_dormant: "장기 휴면" };
			return `고객을 "${l[c.level] ?? "?"}"으로 태깅`;
		},
	},
	send_reactivation_crm: {
		label: "재활성화 CRM 발송",
		icon: Zap,
		fields: [
			{
				key: "offer", label: "제안 유형", type: "select",
				options: [
					{ value: "discount", label: "복귀 할인 혜택" },
					{ value: "new_treatment", label: "신규 시술 안내" },
					{ value: "seasonal", label: "시즌 특별 혜택" },
					{ value: "checkup", label: "무료 체크업 제안" },
				],
				defaultValue: "discount",
			},
		],
		summary: (c) => {
			const o: Record<string, string> = { discount: "복귀 할인 혜택", new_treatment: "신규 시술 안내", seasonal: "시즌 특별 혜택", checkup: "무료 체크업 제안" };
			return `재활성화 CRM — ${o[c.offer] ?? "?"} 발송`;
		},
	},
	convert_to_dormant: {
		label: "휴면 전환",
		icon: UserX,
		fields: [],
		summary: () => "추적 한도 초과 — 고객을 휴면으로 전환",
	},
	manage_consultation: {
		label: "상담 진행 관리",
		icon: ClipboardList,
		fields: [
			{
				key: "counselor", label: "담당 실장", type: "select",
				options: [{ value: "all", label: "전체 실장" }, { value: "이상담", label: "이상담" }, { value: "박상담", label: "박상담" }, { value: "김상담", label: "김상담" }],
				defaultValue: "all",
			},
		],
		summary: (c) => `${c.counselor === "all" ? "전체 실장" : c.counselor}에게 상담 진행 관리 알림`,
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
	// ── 기존 워크플로우 ──
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

	// ── 환자 여정 Stage A: 문의/예약 전후 ──
	{
		id: "6", name: "[A] 문의 후 예약 전환 플로우",
		steps: [
			{ id: "t6", kind: "trigger", type: "inquiry_registered", config: {} },
			{ id: "c6a", kind: "condition", type: "contact_available", config: { value: "yes" } },
			{ id: "c6b", kind: "condition", type: "reservation_exists", config: { value: "no" } },
			{ id: "a6a", kind: "action", type: "send_consultation_crm", config: { channel: "kakao" } },
			{ id: "a6b", kind: "action", type: "notify_staff", config: { counselor: "all" } },
		],
		active: true, executions: 64, successRate: 85.9, lastRun: "2026-03-30 11:10",
		recentRuns: [{ date: "03/30", count: 5, success: 4 }, { date: "03/29", count: 7, success: 6 }, { date: "03/28", count: 4, success: 4 }],
	},
	{
		id: "7", name: "[A] 노쇼 회복 플로우",
		steps: [
			{ id: "t7", kind: "trigger", type: "reservation_noshow", config: {} },
			{ id: "c7", kind: "condition", type: "contact_available", config: { value: "yes" } },
			{ id: "a7a", kind: "action", type: "trigger_noshow_recovery", config: { step: "1" } },
			{ id: "a7b", kind: "action", type: "notify_staff", config: { counselor: "all" } },
		],
		active: true, executions: 28, successRate: 78.6, lastRun: "2026-03-29 15:30",
		recentRuns: [{ date: "03/29", count: 2, success: 2 }, { date: "03/22", count: 3, success: 2 }, { date: "03/15", count: 1, success: 1 }],
	},

	// ── 환자 여정 Stage B: 초진/상담/견적 ──
	{
		id: "8", name: "[B] 상담 미결정 팔로업 플로우",
		steps: [
			{ id: "t8", kind: "trigger", type: "visit_complete", config: {} },
			{ id: "c8a", kind: "condition", type: "consultation_done", config: { value: "no" } },
			{ id: "c8b", kind: "condition", type: "tracking_count", config: { operator: "within", limit: "3" } },
			{ id: "a8a", kind: "action", type: "assign_staff_task", config: { counselor: "all", task: "cost_proposal" } },
			{ id: "a8b", kind: "action", type: "send_message", config: { template: "followup" } },
		],
		active: true, executions: 41, successRate: 90.2, lastRun: "2026-03-30 13:00",
		recentRuns: [{ date: "03/30", count: 3, success: 3 }, { date: "03/27", count: 5, success: 4 }, { date: "03/24", count: 2, success: 2 }],
	},

	// ── 환자 여정 Stage C: 치료 진행 ──
	{
		id: "9", name: "[C] 치료 이탈방지 플로우",
		steps: [
			{ id: "t9", kind: "trigger", type: "visit_complete", config: {} },
			{ id: "c9a", kind: "condition", type: "reservation_exists", config: { value: "no" } },
			{ id: "c9b", kind: "condition", type: "treatment_interruption", config: { sign: "any" } },
			{ id: "a9a", kind: "action", type: "send_retention_crm", config: { reason: "no_next_reservation" } },
			{ id: "a9b", kind: "action", type: "trigger_rebook", config: { type: "next" } },
			{ id: "a9c", kind: "action", type: "notify_staff", config: { counselor: "all" } },
		],
		active: true, executions: 53, successRate: 92.5, lastRun: "2026-03-30 10:45",
		recentRuns: [{ date: "03/30", count: 4, success: 4 }, { date: "03/28", count: 6, success: 5 }, { date: "03/25", count: 3, success: 3 }],
	},

	// ── 환자 여정 Stage D & E: 사후관리 + 휴면/재활성화 ──
	{
		id: "10", name: "[D] 리콜 관리 플로우",
		steps: [
			{ id: "t10", kind: "trigger", type: "recall_date", config: { days_before: "3" } },
			{ id: "c10", kind: "condition", type: "recall_target", config: { type: "any" } },
			{ id: "a10a", kind: "action", type: "send_recall_crm", config: { sequence: "1" } },
			{ id: "a10b", kind: "action", type: "send_reservation_reminder", config: { timing: "1day" } },
			{ id: "a10c", kind: "action", type: "notify_staff", config: { counselor: "all" } },
		],
		active: true, executions: 77, successRate: 96.1, lastRun: "2026-03-30 09:00",
		recentRuns: [{ date: "03/30", count: 6, success: 6 }, { date: "03/23", count: 8, success: 8 }, { date: "03/16", count: 5, success: 4 }],
	},
	{
		id: "11", name: "[E] 휴면 재활성화 플로우",
		steps: [
			{ id: "t11", kind: "trigger", type: "long_no_visit_dormant", config: { months: "6" } },
			{ id: "c11", kind: "condition", type: "contact_available", config: { value: "yes" } },
			{ id: "a11a", kind: "action", type: "tag_dormant", config: { level: "dormant" } },
			{ id: "a11b", kind: "action", type: "send_reactivation_crm", config: { offer: "discount" } },
			{ id: "a11c", kind: "action", type: "change_grade", config: { grade: "휴면" } },
		],
		active: true, executions: 34, successRate: 88.2, lastRun: "2026-03-28 09:00",
		recentRuns: [{ date: "03/28", count: 4, success: 3 }, { date: "03/21", count: 5, success: 5 }, { date: "03/14", count: 3, success: 2 }],
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
