import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
	title: "Highway Delite",
	description: "Curated small-group experiences.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Header />
				<div className="mx-auto my-8 max-w-[1300px] px-4 pt-20">{children}</div>
			</body>
		</html>
	);
}
