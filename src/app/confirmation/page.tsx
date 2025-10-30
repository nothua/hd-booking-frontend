"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LoadingFallback = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
	</div>
);

export default function ConfirmationPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ConfirmationClientPage />
		</Suspense>
	);
}

function ConfirmationClientPage() {
	const searchParams = useSearchParams();
	const bookingRef = searchParams.get("ref");

	return (
		<div className="flex flex-col items-center justify-center text-center px-4 pt-20">
			<Image
				src="/success.png"
				alt="Success"
				width={70}
				height={70}
				className="mb-6"
			/>

			<h1 className="text-3xl text-delite-black mb-3">Booking Confirmed</h1>

			{bookingRef && (
				<p className="text-xl text-delite-cart-text mb-8">
					Ref ID: {bookingRef}
				</p>
			)}

			<Link
				href="/"
				className="px-5 py-2.5 bg-delite-go-home text-delite-cart-text rounded-lg text-base"
			>
				Back to Home
			</Link>
		</div>
	);
}
