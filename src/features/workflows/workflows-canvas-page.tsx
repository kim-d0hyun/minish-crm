import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import {
	ArrowLeft,
	CheckCircle2,
	ChevronDown,
	GripVertical,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	type BuilderStep,
	type StepKind,
	type Workflow,
	getMeta,
	getDefaultConfig,
	kindLabel,
	kindMeta,
	kindStyle,
	workflowsStore,
} from "./workflows-store";

// ── 설정 필드 ─────────────────────────────────────────────

function ConfigFields({
	fields,
	values,
	onChange,
}: {
	fields: import("./workflows-store").ConfigField[];
	values: Record<string, string>;
	onChange: (key: string, value: string) => void;
}) {
	if (fields.length === 0) return null;
	return (
		<div className="grid gap-3 mt-3">
			{fields.map((field) => (
				<div key={field.key} className="flex flex-col gap-1.5">
					<Label className="text-xs text-muted-foreground">{field.label}</Label>
					{field.type === "select" ? (
						<Select
							value={values[field.key] ?? field.defaultValue ?? ""}
							onValueChange={(v) => onChange(field.key, v)}
						>
							<SelectTrigger className="h-9 text-sm bg-white shadow-sm">
								<SelectValue placeholder="선택..." />
							</SelectTrigger>
							<SelectContent>
								{field.options?.map((o) => (
									<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<Input
							type="number"
							placeholder={field.placeholder}
							value={values[field.key] ?? ""}
							onChange={(e) => onChange(field.key, e.target.value)}
							className="h-9 text-sm bg-white shadow-sm"
						/>
					)}
				</div>
			))}
		</div>
	);
}

// ── 단계 추가 드롭다운 ─────────────────────────────────────

function AddStepDropdown({
	onAdd,
	onlyActions = false,
}: {
	onAdd: (kind: StepKind, type: string) => void;
	onlyActions?: boolean;
}) {
	const [open, setOpen] = useState(false);
	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="group flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-border shadow-sm hover:border-primary hover:bg-primary/5 transition-all duration-200 z-10"
				>
					<Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-52">
				{!onlyActions && (
					<>
						<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">조건</div>
						{Object.entries(kindMeta.condition).map(([type, m]) => (
							<DropdownMenuItem key={type} onClick={() => { onAdd("condition", type); setOpen(false); }} className="gap-2 text-amber-700">
								<div className="h-6 w-6 rounded bg-amber-100 flex items-center justify-center shrink-0">
									<m.icon className="h-3.5 w-3.5 text-amber-600" />
								</div>
								{m.label}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
					</>
				)}
				<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">액션</div>
				{Object.entries(kindMeta.action).map(([type, m]) => (
					<DropdownMenuItem key={type} onClick={() => { onAdd("action", type); setOpen(false); }} className="gap-2 text-emerald-700">
						<div className="h-6 w-6 rounded bg-emerald-100 flex items-center justify-center shrink-0">
							<m.icon className="h-3.5 w-3.5 text-emerald-600" />
						</div>
						{m.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// ── 연결선 ────────────────────────────────────────────────

function Connector({
	onAdd,
	stepIndex,
}: {
	onAdd: (kind: StepKind, type: string, index: number) => void;
	stepIndex: number;
}) {
	return (
		<div className="flex flex-col items-center py-0.5 group/connector">
			<div className="w-px h-6 bg-border group-hover/connector:bg-primary/40 transition-colors duration-200" />
			<AddStepDropdown onAdd={(kind, type) => onAdd(kind, type, stepIndex)} />
			<div className="w-px h-6 bg-border group-hover/connector:bg-primary/40 transition-colors duration-200" />
		</div>
	);
}

// ── 노드 카드 ─────────────────────────────────────────────

function FlowNode({
	step,
	index,
	onUpdateType,
	onUpdateConfig,
	onDelete,
	isDraggable,
}: {
	step: BuilderStep;
	index: number;
	onUpdateType: (id: string, type: string) => void;
	onUpdateConfig: (id: string, key: string, value: string) => void;
	onDelete: (id: string) => void;
	isDraggable: boolean;
}) {
	const controls = useDragControls();
	const [expanded, setExpanded] = useState(!step.type);
	const meta = getMeta(step);
	const style = kindStyle[step.kind];

	const nodeContent = (
		<div className="w-full flex flex-col items-center">
			<div className={cn(
				"w-full rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition-all duration-200",
				style.border,
				expanded && "shadow-md",
			)}>
				{/* 헤더 */}
				<div
					className={cn("flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none", expanded && style.bg)}
					onClick={() => setExpanded((v) => !v)}
				>
					{isDraggable ? (
						<div
							className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
							onPointerDown={(e) => { e.stopPropagation(); controls.start(e); }}
						>
							<GripVertical className="h-4 w-4" />
						</div>
					) : (
						<div className="w-4 shrink-0" />
					)}

					<div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", style.iconBg)}>
						{meta
							? <meta.icon className={cn("h-4 w-4", style.iconText)} />
							: <Plus className={cn("h-4 w-4", style.iconText)} />
						}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className={cn("text-xs font-bold uppercase tracking-wider", style.text)}>{kindLabel[step.kind]}</span>
							<span className="text-xs text-muted-foreground">{index + 1}단계</span>
						</div>
						<p className="text-sm font-semibold mt-0.5 truncate">
							{meta
								? meta.label
								: <span className="text-muted-foreground font-normal">클릭하여 설정...</span>
							}
						</p>
						{meta && !expanded && (
							<p className="text-xs text-muted-foreground truncate mt-0.5">{meta.summary(step.config)}</p>
						)}
					</div>

					<div className="flex items-center gap-1 shrink-0">
						{step.kind !== "trigger" && (
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onDelete(step.id); }}
								className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						)}
						<ChevronDown className={cn(
							"h-4 w-4 text-muted-foreground transition-transform duration-200",
							expanded && "rotate-180",
						)} />
					</div>
				</div>

				{/* 확장 영역 */}
				<AnimatePresence initial={false}>
					{expanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							style={{ overflow: "hidden" }}
						>
							<div className="px-4 pb-4 pt-3 border-t border-border/60">
								<div className="space-y-1.5">
									<Label className="text-xs text-muted-foreground">{kindLabel[step.kind]} 유형 선택</Label>
									<Select
										value={step.type}
										onValueChange={(v) => onUpdateType(step.id, v)}
									>
										<SelectTrigger className="h-9 text-sm font-medium bg-white shadow-sm">
											<SelectValue placeholder={`${kindLabel[step.kind]}를 선택하세요...`} />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(kindMeta[step.kind]).map(([value, m]) => (
												<SelectItem key={value} value={value}>
													<div className="flex items-center gap-2">
														<m.icon className="h-4 w-4 text-muted-foreground" />
														<span>{m.label}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{meta && meta.fields.length > 0 && (
									<ConfigFields
										fields={meta.fields}
										values={step.config}
										onChange={(key, value) => onUpdateConfig(step.id, key, value)}
									/>
								)}

								{meta && step.type && (
									<div className={cn("mt-3 px-3 py-2 rounded-lg text-xs font-medium", style.bg, style.text)}>
										↳ {meta.summary(step.config)}
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);

	if (!isDraggable) {
		return <div className="w-full">{nodeContent}</div>;
	}

	return (
		<Reorder.Item
			value={step}
			dragListener={false}
			dragControls={controls}
			layout
			layoutId={step.id}
			className="w-full"
		>
			{nodeContent}
		</Reorder.Item>
	);
}

// ── 메인 캔버스 페이지 ────────────────────────────────────

function makeBlankWorkflow(id: string): Workflow {
	return {
		id,
		name: "새 워크플로우",
		steps: [{ id: `t-${id}`, kind: "trigger", type: "", config: {} }],
		active: true,
		executions: 0,
		successRate: 100,
		recentRuns: [],
	};
}

export function WorkflowCanvasPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// id가 "new"면 새 워크플로우, 아니면 스토어에서 조회
	const isNew = id === "new";
	const existing = id && !isNew ? workflowsStore.getById(id) : undefined;
	const initial: Workflow = existing ?? makeBlankWorkflow(isNew ? String(Date.now()) : (id ?? String(Date.now())));

	const [name, setName] = useState(initial.name);
	const [active, setActive] = useState(initial.active);
	const [steps, setSteps] = useState<BuilderStep[]>(initial.steps);

	const trigger = steps.find((s) => s.kind === "trigger") ?? steps[0];
	const rest = steps.filter((s) => s.kind !== "trigger");

	const updateStep = (id: string, updater: (s: BuilderStep) => BuilderStep) =>
		setSteps((prev) => prev.map((s) => s.id === id ? updater(s) : s));

	const handleUpdateType = (id: string, type: string) =>
		updateStep(id, (s) => ({ ...s, type, config: getDefaultConfig(s.kind, type) }));

	const handleUpdateConfig = (id: string, key: string, value: string) =>
		updateStep(id, (s) => ({ ...s, config: { ...s.config, [key]: value } }));

	const handleDelete = (id: string) => {
		setSteps((prev) => prev.filter((s) => s.id !== id));
		toast.success("단계가 삭제되었습니다.");
	};

	const handleAddAt = (kind: StepKind, type: string, index: number) => {
		const newStep: BuilderStep = { id: `${kind}-${Date.now()}`, kind, type, config: getDefaultConfig(kind, type) };
		setSteps(() => {
			const newRest = [...rest];
			newRest.splice(index, 0, newStep);
			return [trigger, ...newRest];
		});
		toast.success(`${kindLabel[kind]} 단계가 추가되었습니다.`);
	};

	const handleAddAtEnd = (kind: StepKind, type: string) => {
		const newStep: BuilderStep = { id: `${kind}-${Date.now()}`, kind, type, config: getDefaultConfig(kind, type) };
		setSteps((prev) => [...prev, newStep]);
		toast.success(`${kindLabel[kind]} 단계가 추가되었습니다.`);
	};

	const handleReorder = (newRest: BuilderStep[]) =>
		setSteps([trigger, ...newRest]);

	const handleSave = () => {
		if (!name.trim()) { toast.error("워크플로우 이름을 입력해주세요."); return; }
		if (!trigger.type) { toast.error("트리거를 설정해주세요."); return; }
		if (steps.filter((s) => s.kind === "action").length === 0) { toast.error("액션을 하나 이상 추가해주세요."); return; }

		workflowsStore.upsert({ ...initial, name: name.trim(), active, steps });
		toast.success(`"${name.trim()}" 저장 완료!`);
		navigate("/workflows");
	};

	return (
		// -m-6: AppLayout의 p-6 패딩 상쇄, h-[calc(100vh-56px)]: 헤더(h-14=56px) 아래 전체 영역 채우기
		<div className="-m-6 flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
			{/* 상단 바 */}
			<div className="flex items-center gap-3 px-5 py-3 bg-white border-b z-10 shadow-sm shrink-0">
				<Button variant="ghost" size="sm" onClick={() => navigate("/workflows")} className="gap-1.5 text-muted-foreground">
					<ArrowLeft className="h-4 w-4" />
					목록
				</Button>
				<div className="w-px h-5 bg-border" />
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border-0 shadow-none text-base font-semibold focus-visible:ring-0 p-0 h-auto w-60 bg-transparent"
					placeholder="워크플로우 이름..."
				/>
				<div className="flex items-center gap-2 ml-auto">
					<span className="text-xs text-muted-foreground">{active ? "활성" : "비활성"}</span>
					<Switch checked={active} onCheckedChange={setActive} />
					<div className="w-px h-5 bg-border" />
					<Button size="sm" onClick={handleSave} className="gap-1.5">
						<CheckCircle2 className="h-4 w-4" />
						저장
					</Button>
				</div>
			</div>

			{/* 캔버스 */}
			<div
				className="flex-1 overflow-auto flex justify-center py-10 px-4"
				style={{
					background: "#f8f7f4",
					backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			>
				<div className="flex flex-col items-center w-full max-w-[520px]">
					{/* 트리거 노드 (항상 첫 번째, 드래그 불가) */}
					<div className="w-full">
						<FlowNode
							step={trigger}
							index={0}
							onUpdateType={handleUpdateType}
							onUpdateConfig={handleUpdateConfig}
							onDelete={handleDelete}
							isDraggable={false}
						/>
					</div>

					<Connector onAdd={handleAddAt} stepIndex={0} />

					{/* 나머지 스텝 (드래그 순서 변경 가능) */}
					<Reorder.Group
						axis="y"
						values={rest}
						onReorder={handleReorder}
						className="w-full flex flex-col items-center"
						style={{ listStyle: "none", padding: 0, margin: 0 }}
					>
						{rest.map((step, i) => (
							<div key={step.id} className="w-full flex flex-col items-center">
								<FlowNode
									step={step}
									index={i + 1}
									onUpdateType={handleUpdateType}
									onUpdateConfig={handleUpdateConfig}
									onDelete={handleDelete}
									isDraggable={true}
								/>
								<Connector onAdd={handleAddAt} stepIndex={i + 1} />
							</div>
						))}
					</Reorder.Group>

					{/* 맨 아래 추가 버튼 */}
					<div className="flex flex-col items-center mt-1">
						<AddStepDropdown onAdd={handleAddAtEnd} />
						<p className="text-xs text-muted-foreground mt-2">단계 추가</p>
					</div>

					<div className="h-16" />
				</div>
			</div>
		</div>
	);
}
