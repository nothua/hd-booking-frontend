"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
	const router = useRouter();
	const [query, setQuery] = useState("");

	const handleSearch = () => {
		router.push(`/?search=${encodeURIComponent(query.trim())}`);
	};

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 shadow-md h-22 bg-white">
			<div className="flex flex-col items-center justify-between md:flex-row md:gap-0 lg:px-8 py-4 mx-auto max-w-[1300px]">
				<Image
					src="/logo.png"
					alt="Highway Delite Logo"
					width={100}
					height={55}
					className="inline-block cursor-pointer"
					onClick={() => router.push("/")}
				/>
				<div className="flex h-10.5 items-center space-x-2">
					<input
						type="text"
						placeholder="Search experiences"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						className="h-full w-85 rounded-md px-4 text-sm bg-delite-search text-delite-black placeholder:text-delite-hint border-none"
					/>
					<button
						onClick={handleSearch}
						className="-ml-px h-full w-22 rounded-lg text-sm border-delite-yellow bg-delite-yellow text-delite-black transition-colors"
					>
						Search
					</button>
				</div>
			</div>
		</nav>
	);
};

export default Header;
