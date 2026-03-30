import { PageHeader } from "@/components/common/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Building, Palette, Shield, User } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const defaultNotifications: Record<string, boolean> = {
	"새 예약 알림": true,
	"예약 취소 알림": true,
	"노쇼 알림": true,
	"휴면 전환 알림": true,
	"VIP 등급 승급 알림": false,
};

export function SettingsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = searchParams.get("tab") ?? "profile";
	const [notifications, setNotifications] = useState(defaultNotifications);
	const [profile, setProfile] = useState({ name: "관리자", email: "admin@minish.com", phone: "010-9876-5432" });
	const [profileEditing, setProfileEditing] = useState(false);
	const [profileDraft, setProfileDraft] = useState(profile);

	const toggleNotification = (label: string) => {
		setNotifications((prev) => {
			const next = { ...prev, [label]: !prev[label] };
			toast.success(`${label}이(가) ${next[label] ? "활성화" : "비활성화"}되었습니다.`);
			return next;
		});
	};

	const saveProfile = () => {
		if (!profileDraft.name.trim() || !profileDraft.email.trim()) {
			toast.error("이름과 이메일을 입력해주세요.");
			return;
		}
		setProfile(profileDraft);
		setProfileEditing(false);
		toast.success("프로필이 저장되었습니다.");
	};

	return (
		<div className="space-y-6">
			<PageHeader title="설정" description="시스템 설정을 관리합니다" />

			<Tabs value={tab} onValueChange={(v) => setSearchParams((p) => { const n = new URLSearchParams(p); v === "profile" ? n.delete("tab") : n.set("tab", v); return n; })} className="space-y-4">
				<TabsList>
					<TabsTrigger value="profile">프로필</TabsTrigger>
					<TabsTrigger value="general">일반</TabsTrigger>
					<TabsTrigger value="notifications">알림</TabsTrigger>
					<TabsTrigger value="team">팀 관리</TabsTrigger>
					<TabsTrigger value="billing">구독/결제</TabsTrigger>
				</TabsList>

				{/* ── 프로필 ── */}
				<TabsContent value="profile" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<User className="h-4 w-4" />
								내 프로필
							</CardTitle>
							<CardDescription>계정 정보를 관리합니다</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* 아바타 */}
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
										{profile.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-semibold">{profile.name}</p>
									<p className="text-sm text-muted-foreground">{profile.email}</p>
									<Badge variant="outline" className="text-xs mt-1">관리자</Badge>
								</div>
							</div>

							<Separator />

							{/* 프로필 폼 */}
							{profileEditing ? (
								<div className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>이름</Label>
											<Input value={profileDraft.name} onChange={(e) => setProfileDraft((f) => ({ ...f, name: e.target.value }))} />
										</div>
										<div className="space-y-2">
											<Label>전화번호</Label>
											<Input value={profileDraft.phone} onChange={(e) => setProfileDraft((f) => ({ ...f, phone: e.target.value }))} />
										</div>
										<div className="space-y-2 sm:col-span-2">
											<Label>이메일</Label>
											<Input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft((f) => ({ ...f, email: e.target.value }))} />
										</div>
									</div>
									<div className="flex gap-2">
										<Button size="sm" onClick={saveProfile}>저장</Button>
										<Button size="sm" variant="outline" onClick={() => { setProfileEditing(false); setProfileDraft(profile); }}>취소</Button>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									{[
										{ label: "이름", value: profile.name },
										{ label: "이메일", value: profile.email },
										{ label: "전화번호", value: profile.phone },
										{ label: "권한", value: "관리자" },
									].map((row) => (
										<div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0">
											<span className="text-xs text-muted-foreground w-24">{row.label}</span>
											<span className="text-sm font-medium flex-1">{row.value}</span>
										</div>
									))}
									<Button size="sm" variant="outline" className="mt-2" onClick={() => { setProfileEditing(true); setProfileDraft(profile); }}>
										프로필 편집
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">보안</CardTitle>
							<CardDescription>비밀번호 및 보안 설정을 관리합니다</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="text-sm font-medium">비밀번호 변경</p>
									<p className="text-xs text-muted-foreground">마지막 변경: 2025-12-01</p>
								</div>
								<Button variant="outline" size="sm" onClick={() => toast.info("비밀번호 변경 이메일을 발송했습니다.")}>변경</Button>
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="text-sm font-medium">2단계 인증</p>
									<p className="text-xs text-muted-foreground">추가 보안 레이어 활성화</p>
								</div>
								<Switch onCheckedChange={(v) => toast.success(`2단계 인증이 ${v ? "활성화" : "비활성화"}되었습니다.`)} />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 일반 ── */}
				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Building className="h-4 w-4" />
								입점사 정보
							</CardTitle>
							<CardDescription>기본 사업장 정보를 관리합니다</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>사업장명</Label>
									<Input defaultValue="미니쉬 청담라운지" />
								</div>
								<div className="space-y-2">
									<Label>대표자명</Label>
									<Input defaultValue="홍길동" />
								</div>
								<div className="space-y-2">
									<Label>연락처</Label>
									<Input defaultValue="02-1234-5678" />
								</div>
								<div className="space-y-2">
									<Label>이메일</Label>
									<Input defaultValue="contact@minish.com" />
								</div>
								<div className="space-y-2">
									<Label>사업자등록번호</Label>
									<Input defaultValue="123-45-67890" />
								</div>
								<div className="space-y-2">
									<Label>주소</Label>
									<Input defaultValue="서울특별시 강남구 청담동" />
								</div>
							</div>
							<div className="flex justify-end">
								<Button size="sm" onClick={() => toast.success("설정이 저장되었습니다.")}>저장</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Palette className="h-4 w-4" />
								고객 등급 설정
							</CardTitle>
							<CardDescription>고객 등급 기준을 설정합니다</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{ grade: "VIP", condition: "총 결제 300만원 이상 또는 방문 20회 이상", color: "bg-amber-100 text-amber-800" },
									{ grade: "일반", condition: "기본 등급", color: "bg-neutral-100 text-neutral-700" },
									{ grade: "신규", condition: "첫 방문 후 30일 이내", color: "bg-blue-100 text-blue-800" },
									{ grade: "휴면", condition: "90일 이상 미방문", color: "bg-red-100 text-red-800" },
								].map((g) => (
									<div key={g.grade} className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<Badge variant="outline" className={`${g.color} text-xs`}>{g.grade}</Badge>
											<span className="text-sm text-muted-foreground">{g.condition}</span>
										</div>
										<Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.info("등급 편집 기능은 준비 중입니다.")}>편집</Button>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 알림 ── */}
				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Bell className="h-4 w-4" />
								알림 설정
							</CardTitle>
							<CardDescription>알림 수신 방법을 설정합니다</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[
									{ label: "새 예약 알림", description: "새로운 예약이 생성되면 알림을 받습니다" },
									{ label: "예약 취소 알림", description: "고객이 예약을 취소하면 알림을 받습니다" },
									{ label: "노쇼 알림", description: "고객이 예약 시간에 미방문하면 알림을 받습니다" },
									{ label: "휴면 전환 알림", description: "고객이 휴면 상태로 전환되면 알림을 받습니다" },
									{ label: "VIP 등급 승급 알림", description: "고객이 VIP로 승급되면 알림을 받습니다" },
								].map((n) => (
									<div key={n.label} className="flex items-center justify-between transition-opacity duration-200">
										<div>
											<p className="text-sm font-medium">{n.label}</p>
											<p className="text-xs text-muted-foreground">{n.description}</p>
										</div>
										<Switch
											checked={notifications[n.label]}
											onCheckedChange={() => toggleNotification(n.label)}
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 팀 관리 ── */}
				<TabsContent value="team" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<User className="h-4 w-4" />
								팀 멤버
							</CardTitle>
							<CardDescription>CRM에 접근 가능한 팀원을 관리합니다</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{ name: "관리자", email: "admin@minish.com", role: "관리자", joined: "2023-01-01" },
									{ name: "이상담", email: "lee@minish.com", role: "상담 실장", joined: "2023-03-15" },
									{ name: "박상담", email: "park@minish.com", role: "상담 실장", joined: "2023-06-01" },
									{ name: "김상담", email: "kim@minish.com", role: "상담 실장", joined: "2024-01-10" },
								].map((member) => (
									<div key={member.email} className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<Avatar className="h-9 w-9">
												<AvatarFallback className="text-sm bg-muted font-medium">{member.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-sm font-medium">{member.name}</p>
												<p className="text-xs text-muted-foreground">{member.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-xs text-muted-foreground hidden sm:block">입사 {member.joined}</span>
											<Badge variant="outline" className="text-xs">{member.role}</Badge>
										</div>
									</div>
								))}
							</div>
							<div className="flex gap-2 mt-4">
								<Button variant="outline" size="sm" onClick={() => toast.info("멤버 초대 기능은 준비 중입니다.")}>
									멤버 초대
								</Button>
								<Button variant="ghost" size="sm" onClick={() => toast.info("역할 관리 기능은 준비 중입니다.")}>
									역할 관리
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── 구독/결제 ── */}
				<TabsContent value="billing" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Shield className="h-4 w-4" />
								현재 플랜
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
								<div>
									<div className="flex items-center gap-2">
										<p className="text-lg font-bold">Premium</p>
										<Badge className="text-xs">현재 플랜</Badge>
									</div>
									<p className="text-sm text-muted-foreground mt-1">월 ₩50,000 · CRM 전체 기능 + 추가 할인</p>
									<p className="text-xs text-muted-foreground mt-0.5">다음 결제일: 2026-04-30</p>
								</div>
								<Button variant="outline" size="sm" onClick={() => toast.info("플랜 변경 기능은 준비 중입니다.")}>
									플랜 변경
								</Button>
							</div>

							<Separator className="my-6" />

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{[
									{ name: "Basic", price: "₩30,000/월", features: ["고객 관리", "예약 관리", "기본 리포트"], current: false },
									{ name: "Premium", price: "₩50,000/월", features: ["Basic 전체", "자동 메시지", "워크플로우", "VIP 분석"], current: true },
									{ name: "Enterprise", price: "₩100,000/월", features: ["Premium 전체", "AI 에이전트", "전용 혜택", "우선 지원"], current: false },
								].map((plan) => (
									<Card key={plan.name} className={plan.current ? "border-primary ring-1 ring-primary/30" : ""}>
										<CardContent className="pt-5">
											<div className="flex items-center justify-between mb-1">
												<p className="font-bold">{plan.name}</p>
												{plan.current && <Badge className="text-xs">현재</Badge>}
											</div>
											<p className="text-lg font-bold mt-1">{plan.price}</p>
											<ul className="mt-3 space-y-1.5">
												{plan.features.map((f) => (
													<li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
														<span className="text-emerald-500">✓</span>
														{f}
													</li>
												))}
											</ul>
											{!plan.current && (
												<Button variant="outline" size="sm" className="w-full mt-4 text-xs" onClick={() => toast.info("플랜 변경 기능은 준비 중입니다.")}>
													업그레이드
												</Button>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
