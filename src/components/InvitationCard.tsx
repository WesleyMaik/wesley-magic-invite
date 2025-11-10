import { useMemo, useState } from "react";
import { Calendar, MapPin, Clock, Map, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import profileImage from "@/assets/profile.png";
import Confetti from "react-confetti";

import NearLocations from "./NearLocations";
import { HoverPeek } from "./PreviewCard";
import PartySongTrigger from "./PartySongTrigger";

const InvitationCard = () => {
	const [showConfetti, setShowConfetti] = useState(false);
	const [confettiRecycle, setConfettiRecycle] = useState(true);

	const totalHeight = useMemo(() => {
		return Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight,
			document.documentElement.clientHeight
		);
	}, [document]);

	const handleCelebrate = () => {
		setShowConfetti(true);
		setConfettiRecycle(true);
		setTimeout(() => {
			setConfettiRecycle(false);
		}, 46000);
		setTimeout(() => {
			setShowConfetti(false);
		}, 49000);
	};

	const handleMapsClick = () => {
		window.open("https://maps.app.goo.gl/nrVLdWg1p5JHmUeZA", "_blank");
	};

	return (
		<div className=" overflow-y-auto h-screen pb-8">
			<div className="absolute top-0 left-0 w-full h-full">
				{showConfetti && (
					<Confetti
						width={window.innerWidth}
						height={totalHeight}
						recycle={confettiRecycle}
						numberOfPieces={1000}
						gravity={0.3}
					/>
				)}
			</div>

			<div className="flex items-center min-h-screen justify-center p-4 z-50">
				<Card className="w-full max-w-2xl bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl overflow-y-auto">
					<div className="p-8 md:p-12 text-center space-y-6">
						{/* Title */}
						<div className="flex flex-col items-center text-center space-y-4 opacity-0 animate-fade-in-delay-1">
							<h1 className="lg:text-3xl text-2xl font-bold font-white">
								Você foi convidado para a
							</h1>
							<img
								src={"./logo.webp"}
								alt="Festa do Weslito"
								className="breathing lg:w-64 w-48"
							/>

							{/* Profile Image */}
							<div className="flex gap-2 items-center">
								<div className="opacity-0 animate-fade-in">
									<div className="relative lg:w-20 lg:h-20 w-16 h-16 mx-auto">
										<div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-50 animate-pulse" />
										<img
											src={profileImage}
											alt="Wesley Maik"
											className="relative w-full h-full rounded-full object-cover hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</div>
								<div className="flex flex-col items-start">
									<h1 className="lg:text-3xl text-2xl font-bold text-white">
										Wesley Maik
									</h1>
									<p className="lg:text-xl text-lg text-white">Te convidou</p>
								</div>
							</div>
						</div>

						{/* Event Details */}
						<div className="flex gap-2 items-center justify-center opacity-0 animate-fade-in-delay-2 font-geist-mono">
							<div className="flex items-center justify-center gap-1 flex-1">
								<Calendar className="min-w-6 h-6 text-white" />
								<span className="text-white">16/11/2025</span>
							</div>

							<div className="flex items-center justify-center gap-1  flex-1">
								<Clock className="min-w-6 h-6 text-white" />
								<span className="text-white">Horário: 12h</span>
							</div>
						</div>
						<div>
							<div className="flex items-start justify-center gap-1 font-geist-mono">
								<MapPin className="min-w-6 h-6 text-white" />
								<p className="text-white text-sm">
									Local: Espaço Bella Fest Brazil - R. Carlos Prata Neto - Bela
									Laguna, Campo Grande - MS, 79096-476
								</p>
							</div>
						</div>

						{/* Divider */}
						<div className="opacity-0 animate-fade-in-delay-2">
							<div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
						</div>

						{/* Action Buttons */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 animate-fade-in-delay-3">
							<HoverPeek url={`https://maps.app.goo.gl/nrVLdWg1p5JHmUeZA`}>
								<Button
									onClick={handleMapsClick}
									variant="outline"
									className="w-full group border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
								>
									<Map className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
									Ver no Maps
								</Button>
							</HoverPeek>

							<NearLocations>
								<Button
									variant="outline"
									className="w-full group border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
								>
									<Store className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
									Lugares Próximos
								</Button>
							</NearLocations>
						</div>

						{/* Celebrate Button */}
						<div className="pt-4 opacity-0 animate-fade-in-delay-4">
							<PartySongTrigger>
								<Button
									onClick={handleCelebrate}
									className="w-full md:w-auto px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-amber-400 to-primary bg-size-200 hover:bg-pos-100 transition-all duration-500 shadow-[0_0_30px_rgba(244,208,63,0.4)] hover:shadow-[0_0_50px_rgba(244,208,63,0.6)] hover:scale-105 breathing"
									style={{
										backgroundSize: "200% auto",
									}}
								>
									🎉 Festeje Comigo 🎉
								</Button>
							</PartySongTrigger>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default InvitationCard;
