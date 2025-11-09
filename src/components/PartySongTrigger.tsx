import { ReactNode, useCallback, useState } from "react";

export interface PartySongTriggerProps {
	children: ReactNode;
}

export default function PartySongTrigger({ children }: PartySongTriggerProps) {
	const [audio] = useState(
		new Audio("./songs/yeah-yeah-yeahs-heads-will-roll.mp3")
	);
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlay = useCallback(() => {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		setIsPlaying(!isPlaying);
	}, [audio, isPlaying]);

	return <div onClick={togglePlay}>{children}</div>;
}
