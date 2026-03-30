import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
	CheckCircle2,
	MoreHorizontal,
	Pencil,
	Play,
	Plus,
	TrendingUp,
	Trash2,
	Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	type Workflow,
	type WorkflowRun,
	getMeta,
	kindStyle,
	useWorkflowsStore,
	workflowsStore,
} from "./workflows-store";

function MiniBarChart({ runs }: { runs: WorkflowRun[] }) {
	const max = Math.max(...runs.map((r) => r.count), 1);
	return (
		<div className="flex items-end gap-1 h-8">
			{runs.map((r) => (
				<div key={r.date} className="flex-1 relative" title={`${r.date}: ${r.success}/${r.count}건`} style={{ height: `${Math.max((r.count / max) * 32, 4)}px` }}>
					<div className="absolute inset-0 rounded-sm bg-primary/20" />
					<div className="absolute bottom-0 left-0 right-0 rounded-sm bg-primary/60" style={{ height: `${(r.success / r.count) * 100}%` }} />
				</div>
			))}
		</div>
	);
}

function WorkflowListCard({ workflow, onToggle, onEdit, onDelete }: {
	workflow: Workflow;
	onToggle: (id: string) => void;
	onEdit: (wf: Workflow) => void;
	onDelete: (id: string) => void;
}) {
	const configuredSteps = workflow.steps.filter((s) => s.type);
	return (
		<Card className={cn("transition-all duration-300 hover:shadow-sm cursor-pointer group", !workflow.active && "opacity-50 grayscale-[30%]")} onClick={() => onEdit(workflow)}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<CardTitle className="text-sm group-hover:text-primary transition-colors">{workflow.name}</CardTitle>
							{workflow.active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
						</div>
						<div className="flex items-center gap-1.5 flex-wrap">
							{configuredSteps.slice(0, 5).map((step, i) => {
								const meta = getMeta(step);
								if (!meta) return null;
								const style = kindStyle[step.kind];
								return (
									<div key={step.id} className="flex items-center gap-1">
										<div className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border", style.bg, style.border, style.text)}>
											<meta.icon className={cn("h-3 w-3", style.iconText)} />
											{meta.label}
										</div>
										{i < configuredSteps.length - 1 && i < 4 && <span className="text-muted-foreground text-xs">→</span>}
									</div>
								);
							})}
							{configuredSteps.length > 5 && <span className="text-xs text-muted-foreground">+{configuredSteps.length - 5}개</span>}
						</div>
					</div>
					<div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
						<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onEdit(workflow)}>
							<Pencil className="h-3.5 w-3.5" />
						</Button>
						<Switch checked={workflow.active} onCheckedChange={() => onToggle(workflow.id)} />
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
									<MoreHorizontal className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => onEdit(workflow)} className="gap-2">
									<Pencil className="h-3.5 w-3.5" />편집
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => onDelete(workflow.id)} className="gap-2 text-destructive focus:text-destructive">
									<Trash2 className="h-3.5 w-3.5" />삭제
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-end justify-between pt-3 border-t gap-4">
					<div className="grid grid-cols-3 gap-4 flex-1">
						<div><p className="text-xs text-muted-foreground">총 실행</p><p className="text-sm font-bold">{workflow.executions.toLocaleString()}회</p></div>
						<div><p className="text-xs text-muted-foreground">성공률</p><p className="text-sm font-bold text-emerald-600">{workflow.successRate}%</p></div>
						<div><p className="text-xs text-muted-foreground">마지막 실행</p><p className="text-xs font-medium text-muted-foreground">{workflow.lastRun ?? "-"}</p></div>
					</div>
					{workflow.recentRuns.length > 0 && (
						<div className="w-24 shrink-0">
							<p className="text-xs text-muted-foreground mb-1">최근 실행</p>
							<MiniBarChart runs={workflow.recentRuns} />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function WorkflowsPage() {
	const workflows = useWorkflowsStore();
	const navigate = useNavigate();

	const handleToggle = (id: string) => {
		const wf = workflowsStore.getById(id);
		if (!wf) return;
		workflowsStore.toggle(id);
		toast.success(`"${wf.name}" ${wf.active ? "비활성화" : "활성화"}되었습니다.`);
	};

	const handleEdit = (wf: Workflow) => navigate(`/workflows/${wf.id}`);

	const handleNew = () => navigate("/workflows/new");

	const handleDelete = (id: string) => {
		workflowsStore.delete(id);
		toast.success("워크플로우가 삭제되었습니다.");
	};

	const active = workflows.filter((w) => w.active).length;
	const totalExecutions = workflows.reduce((s, w) => s + w.executions, 0);
	const avgSuccess = workflows.length > 0
		? Math.round(workflows.reduce((s, w) => s + w.successRate, 0) / workflows.length * 10) / 10
		: 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">워크플로우</h1>
					<p className="text-sm text-muted-foreground mt-0.5">자동화 워크플로우를 구축하고 관리합니다</p>
				</div>
				<Button size="sm" onClick={handleNew}>
					<Plus className="h-4 w-4 mr-2" />새 워크플로우
				</Button>
			</div>

			{/* 요약 */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card><CardContent className="pt-4 pb-4 flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2.5"><Zap className="h-4 w-4 text-emerald-600" /></div><div><p className="text-xl font-bold">{active}/{workflows.length}</p><p className="text-xs text-muted-foreground">활성 워크플로우</p></div></CardContent></Card>
				<Card><CardContent className="pt-4 pb-4 flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2.5"><TrendingUp className="h-4 w-4 text-blue-600" /></div><div><p className="text-xl font-bold">{totalExecutions.toLocaleString()}</p><p className="text-xs text-muted-foreground">총 실행 횟수</p></div></CardContent></Card>
				<Card><CardContent className="pt-4 pb-4 flex items-center gap-3"><div className="rounded-lg bg-violet-100 p-2.5"><CheckCircle2 className="h-4 w-4 text-violet-600" /></div><div><p className="text-xl font-bold">{avgSuccess}%</p><p className="text-xs text-muted-foreground">평균 성공률</p></div></CardContent></Card>
			</div>

			{/* 목록 */}
			<div className="grid grid-cols-1 gap-4">
				{workflows.map((wf) => (
					<WorkflowListCard key={wf.id} workflow={wf} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
				))}
				{workflows.length === 0 && (
					<Card>
						<CardContent className="py-16 text-center">
							<Zap className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
							<p className="text-sm text-muted-foreground mb-4">워크플로우가 없습니다</p>
							<Button size="sm" onClick={handleNew}><Plus className="h-4 w-4 mr-2" />첫 워크플로우 만들기</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* 범례 */}
			<div className="flex items-center gap-3 flex-wrap">
				{[
					{ label: "트리거 — 시작 조건", bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700" },
					{ label: "조건 — 필터 규칙", bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-700" },
					{ label: "액션 — 실행 동작", bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700" },
				].map((l) => (
					<Badge key={l.label} variant="outline" className={cn("text-xs", l.bg, l.border, l.text)}>{l.label}</Badge>
				))}
			</div>

			{/* 안내 */}
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<Play className="h-3.5 w-3.5" />
				<span>워크플로우 카드를 클릭하면 Zapier 스타일 비주얼 에디터로 편집할 수 있습니다</span>
			</div>
		</div>
	);
}
