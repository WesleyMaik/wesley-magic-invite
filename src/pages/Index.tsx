import { BrowserView } from "react-device-detect";
import BallpitBackground from "@/components/Ballpit";
import InvitationCard from "@/components/InvitationCard";
import { InvitationRef } from "@/components/InvitationRef";

const Index = () => {
	return (
		<div className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-t from-[#2b303b] via-[#237ff7] via-[#cf69cf] to-[#ffb300]">
			<div className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<BrowserView>
					<div className="absolute top-0 left-0 w-full h-full">
						<BallpitBackground
							count={200}
							gravity={0.05}
							friction={0.9975}
							wallBounce={0.95}
							followCursor={false}
							colors={[0xf37602, 0xd4a1dd, 0x4266a1, 0x171b21]}
						/>
					</div>
				</BrowserView>
			</div>
			<InvitationCard />
			<InvitationRef />
		</div>
	);
};

export default Index;
