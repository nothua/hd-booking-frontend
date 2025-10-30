"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ExperienceCard from "@/components/ExperienceCard";
import { getExperiences } from "@/lib/api";
import type { Experience } from "@/lib/types";

function ExperienceList() {
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search")?.toLowerCase() || "";

	useEffect(() => {
		async function fetchExperiences() {
			try {
				setLoading(true);
				const data = await getExperiences(searchQuery);
				setExperiences(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchExperiences();
	}, [searchQuery]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading experiences...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<p className="text-red-600 mb-4">Error: {error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (experiences.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">
					{searchQuery
						? `No experiences found for “${searchQuery}”.`
						: "No experiences available at the moment."}
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{experiences.map((exp) => (
				<ExperienceCard key={exp._id} {...exp} />
			))}
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
				<p className="text-gray-600">Loading experiences...</p>
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<main>
			<Suspense fallback={<LoadingFallback />}>
				<ExperienceList />
			</Suspense>
		</main>
	);
}
