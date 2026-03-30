import splashLogo from "@/assets/splash-logo.png";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SPLASH_DURATION = 2200;
const SPLASH_KEY = "minish-crm-visited";

export function SplashScreen({ children }: { children: React.ReactNode }) {
	const [showSplash, setShowSplash] = useState(() => {
		return !sessionStorage.getItem(SPLASH_KEY);
	});

	useEffect(() => {
		if (!showSplash) return;

		document.body.style.overflow = "hidden";
		const timer = setTimeout(() => {
			setShowSplash(false);
			sessionStorage.setItem(SPLASH_KEY, "1");
			document.body.style.overflow = "";
		}, SPLASH_DURATION);

		return () => {
			clearTimeout(timer);
			document.body.style.overflow = "";
		};
	}, [showSplash]);

	return (
		<>
			<AnimatePresence mode="wait">
				{showSplash && (
					<motion.div
						key="splash"
						className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden"
						style={{ height: "100dvh" }}
						initial={{ opacity: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
					>
						<motion.img
							src={splashLogo}
							alt="MINISH CRM"
							className="h-20 object-contain"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: "easeOut" }}
						/>

						<motion.p
							className="mt-4 text-sm text-muted-foreground tracking-wide"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
						>
							고객 관리의 새로운 기준
						</motion.p>

						<motion.div
							className="mt-8 h-0.5 rounded-full bg-neutral-200 overflow-hidden"
							style={{ width: 120 }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.7, duration: 0.3 }}
						>
							<motion.div
								className="h-full bg-neutral-900 rounded-full"
								initial={{ width: "0%" }}
								animate={{ width: "100%" }}
								transition={{
									delay: 0.8,
									duration: SPLASH_DURATION / 1000 - 0.8,
									ease: "easeInOut",
								}}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.div
				initial={showSplash ? { opacity: 0 } : { opacity: 1 }}
				animate={{ opacity: 1 }}
				transition={{ delay: showSplash ? 0.2 : 0, duration: 0.3 }}
			>
				{children}
			</motion.div>
		</>
	);
}
