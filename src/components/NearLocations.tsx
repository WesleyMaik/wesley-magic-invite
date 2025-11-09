"use client";

import { ReactNode } from "react";
import { Drawer } from "vaul";

import LOCATION_1 from "@/assets/near-locations/1.webp";
import { Separator } from "./ui/separator";

interface NearLocationsProps {
	children?: ReactNode;
}

export default function NearLocations({ children }: NearLocationsProps) {
	return (
		<Drawer.Root direction="right">
			{children ? (
				<Drawer.Trigger>{children}</Drawer.Trigger>
			) : (
				<Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
					Open Drawer
				</Drawer.Trigger>
			)}

			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40" />
				<Drawer.Content
					className="right-2 top-2 bottom-2 fixed z-10 outline-none w-[310px] flex"
					// The gap between the edge of the screen and the drawer is 8px in this case.
					style={
						{ "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
					}
				>
					<div className="bg-zinc-50 h-full w-full grow p-5 flex flex-col rounded-[16px]">
						<div className="max-w-md mx-auto">
							<Drawer.Title className="font-medium mb-2 text-zinc-900">
								Esses são os estabelecimentos próximos ao local.
							</Drawer.Title>
							<Separator className="opacity-20" />
							<Drawer.Description className="text-zinc-600 my-2">
								<div className="flex flex-col gap-2">
									<a
										href={`https://maps.app.goo.gl/sGK2NpayiuWZbQLA7`}
										target="_blank"
										className="flex gap-2 items-center"
									>
										<img
											src={LOCATION_1}
											alt="Supermercado Feitosa"
											width={80}
											className="rounded-md"
										/>
										<div className="flex flex-col gap-1">
											<h2 className="font-medium text-zinc-800">
												Supermercado Feitosa
											</h2>
											<p className="text-zinc-600 text-sm">
												Av. Mário Madeira, 652 - Lot. Bela Laguna
											</p>
										</div>
									</a>
								</div>
							</Drawer.Description>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
