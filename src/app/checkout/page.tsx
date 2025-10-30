"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getExperience, createBooking, validatePromoCode } from "@/lib/api";
import type {
	Experience,
	Slot,
	BookingData,
	PromoValidationResponse,
} from "@/lib/types";
import { AlertCircle, ArrowLeft } from "lucide-react";

const FullPageSpinner = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
	</div>
);

export default function CheckoutPage() {
	return (
		<Suspense fallback={<FullPageSpinner />}>
			<CheckoutClientPage />
		</Suspense>
	);
}

function CheckoutClientPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [experience, setExperience] = useState<Experience | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [promoCode, setPromoCode] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [appliedPromo, setAppliedPromo] =
		useState<PromoValidationResponse | null>(null);
	const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
	const [promoError, setPromoError] = useState<string | null>(null);
	const [isPromoLoading, setIsPromoLoading] = useState(false);

	useEffect(() => {
		const expId = searchParams.get("expId");
		const slotId = searchParams.get("slotId");
		const qty = searchParams.get("qty");

		if (!expId || !slotId || !qty) {
			setError("Missing booking details. Please go back and try again.");
			setLoading(false);
			return;
		}

		async function fetchData() {
			try {
				setLoading(true);
				const expData = await getExperience(expId ?? "");
				const slot = expData.slots?.find((s) => s._id === slotId);

				if (!slot) {
					throw new Error("Selected slot is no longer available.");
				}

				const numQty = parseInt(qty ?? "0", 10);
				if (numQty > slot.available) {
					throw new Error(
						`Only ${slot.available} tickets are available. Please adjust your quantity.`
					);
				}

				setExperience(expData);
				setSelectedSlot(slot);
				setQuantity(numQty);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [searchParams]);

	const handlePromoApply = async () => {
		if (!promoCode.trim()) {
			setPromoError("Please enter a promo code.");
			return;
		}
		if (!experience || !quantity) return;

		setIsPromoLoading(true);
		setPromoError(null);
		setAppliedPromo(null);
		setAppliedPromoCode(null);

		try {
			const data = await validatePromoCode(promoCode, experience._id, quantity);

			if (data.isValid) {
				setAppliedPromo(data);
				setAppliedPromoCode(promoCode);
				setPromoError(null);
			}
		} catch (err) {
			setPromoError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsPromoLoading(false);
		}
	};

	const validateForm = () => {
		const errors: { [key: string]: string } = {};
		if (!fullName.trim()) {
			errors.fullName = "Full name is required";
		}
		if (!email.trim()) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errors.email = "Email is invalid";
		}
		if (!agreedToTerms) {
			errors.agreedToTerms = "You must agree to the terms and policy";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm() || !experience || !selectedSlot) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		const bookingData: BookingData = {
			fullName,
			email,
			experienceId: experience._id,
			slotId: selectedSlot._id,
			quantity,
			promoCode: promoCode || undefined,
			agreedToTerms: agreedToTerms,
		};

		try {
			const newBooking = await createBooking(bookingData);
			router.push(`/confirmation?ref=${newBooking.bookingReference}`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create booking."
			);
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return <FullPageSpinner />;
	}

	if (error || !experience || !selectedSlot) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
				<AlertCircle size={48} className="mb-4 text-red-600" />
				<p className="text-xl font-semibold text-red-600">Error</p>
				<p className="text-gray-600 mb-4">
					{error || "Could not load booking details."}
				</p>
				<Link
					href="/"
					className="px-4 py-2 bg-delite-yellow text-delite-black rounded-lg"
				>
					Go Home
				</Link>
			</div>
		);
	}

	const TAX_RATE = 0.05;
	const subtotal = experience.price * quantity;
	const discountAmount = appliedPromo?.discountAmount ?? 0;
	const subtotalAfterDiscount = subtotal - discountAmount;
	const taxes = Math.max(0, subtotalAfterDiscount * TAX_RATE);
	const total = subtotalAfterDiscount + taxes;

	const formatDate = (date: string | Date): string => {
		return new Date(date).toLocaleDateString("en-CA");
	};

	return (
		<div className="">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
				<Link href={`/experiences/${experience._id}`}>
					<div className="flex items-center gap-2 text-sm text-delite-black mb-6">
						<ArrowLeft size={20} />
						<span className="font-medium">Checkout</span>
					</div>
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-4">
					<div className="lg:col-span-2">
						<div className="bg-delite-cart rounded-lg p-8">
							<form onSubmit={handleSubmit}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
									<div>
										<label
											htmlFor="fullName"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Full name
										</label>
										<input
											type="text"
											id="fullName"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											className="w-full p-3 bg-delite-cart-textbox placeholder:text-delite-hint rounded-md text-sm"
											placeholder="Your name"
										/>
										{formErrors.fullName && (
											<p className="text-red-500 text-xs mt-1">
												{formErrors.fullName}
											</p>
										)}
									</div>
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Email
										</label>
										<input
											type="email"
											id="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full p-3 bg-delite-cart-textbox placeholder:text-delite-hint rounded-md text-sm"
											placeholder="Your name"
										/>
										{formErrors.email && (
											<p className="text-red-500 text-xs mt-1">
												{formErrors.email}
											</p>
										)}
									</div>
								</div>

								<div className="mb-6">
									<div className="flex gap-3">
										<input
											type="text"
											id="promoCode"
											value={promoCode}
											onChange={(e) => {
												setPromoCode(e.target.value);
												setPromoError(null);
												setAppliedPromo(null);
												setAppliedPromoCode(null);
											}}
											className="grow p-3 bg-delite-cart-textbox placeholder:text-delite-hint rounded-md text-sm"
											placeholder="Promo code"
										/>
										<button
											type="button"
											onClick={handlePromoApply}
											disabled={isPromoLoading}
											className="px-6 py-2.5 bg-delite-black text-white rounded-md text-sm transition-opacity disabled:opacity-50"
										>
											{isPromoLoading ? "Applying..." : "Apply"}
										</button>
									</div>
									{promoError && (
										<p className="text-red-500 text-xs mt-2">{promoError}</p>
									)}
									{appliedPromo && (
										<p className="text-green-600 text-xs mt-2">
											{appliedPromo.message}
										</p>
									)}
								</div>

								<div className="flex items-start gap-2">
									<input
										type="checkbox"
										id="terms"
										checked={agreedToTerms}
										onChange={(e) => setAgreedToTerms(e.target.checked)}
										className="mt-1 h-4 w-4 text-delite-yellow border-gray-300 rounded focus:ring-delite-yellow"
									/>
									<div>
										<label htmlFor="terms" className="text-sm text-gray-700">
											I agree to the terms and safety policy
										</label>
										{formErrors.agreedToTerms && (
											<p className="text-red-500 text-xs mt-1">
												{formErrors.agreedToTerms}
											</p>
										)}
									</div>
								</div>
							</form>
						</div>
					</div>

					<div className="lg:col-span-1 mt-10 lg:mt-0">
						<div className="bg-delite-cart rounded-lg p-8">
							<div className="space-y-2.5 text-sm">
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">
										Experience
									</span>
									<span className="text-delite-black text-sm text-end">
										{experience.name}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">Date</span>
									<span className="text-delite-black text-sm">
										{formatDate(selectedSlot.date)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">Time</span>
									<span className="text-delite-black text-sm">
										{selectedSlot.time}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">Qty</span>
									<span className="text-delite-black text-sm">{quantity}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">
										Subtotal
									</span>
									<span className="text-delite-black text-sm">
										₹{subtotal.toFixed(0)}
									</span>
								</div>
								{appliedPromo && discountAmount > 0 && (
									<div className="flex justify-between">
										<span className="text-delite-cart-text text-base text-green-600">
											Discount
										</span>
										<span className="text-delite-black text-sm text-green-600">
											-₹{discountAmount.toFixed(0)}
										</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-delite-cart-text text-base">Taxes</span>
									<span className="text-delite-black text-sm">
										₹{taxes.toFixed(0)}
									</span>
								</div>
							</div>

							<hr className="my-3 border-gray-200" />

							<div className="flex justify-between items-center mb-6">
								<span className="text-lg text-delite-black">Total</span>
								<span className="text-lg text-delite-black">
									₹{total.toFixed(0)}
								</span>
							</div>

							{error &&
								!formErrors.fullName &&
								!formErrors.email &&
								!formErrors.agreedToTerms && (
									<p className="text-red-500 text-sm text-center mb-3">
										{error}
									</p>
								)}

							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="w-full bg-delite-yellow text-delite-black py-2.5 px-4 rounded-lg text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Processing..." : "Pay and Confirm"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
