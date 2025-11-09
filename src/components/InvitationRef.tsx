import { useEffect } from "react";
import { toast } from "sonner";

import references from "@/contants/references";

interface ToastElement {
	image: string;
	name: string;
}

export function InvitationRef() {
	const queryParams = new URLSearchParams(window.location.search);
	const refParam = queryParams.get("ref");

	function ToastElement({
		image = "https://placehold.co/60x60",
		name,
	}: ToastElement) {
		return (
			<div className="flex gap-2 items-center">
				<img src={image} alt="Image" width={60} className="rounded-full" />
				<div>
					<p className="text-white font-bold">
						Você recebeu um convite especial!
					</p>
					<p className="text-white">Convite por: {name}</p>
				</div>
			</div>
		);
	}

	useEffect(() => {
		const reference = references.find((item) => item.id === refParam);

		if (!reference) {
			return;
		}

		toast(<ToastElement image={reference.image} name={reference.name} />, {
			position: "bottom-center",
		});
	}, [refParam]);

	return null;
}
