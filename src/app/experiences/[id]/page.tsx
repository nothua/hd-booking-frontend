'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getExperience } from '@/lib/api';
import type { Experience, Slot } from '@/lib/types'; 
import {
  AlertCircle,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const formatShortDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getUniqueDates = (slots: Slot[] = []): string[] => {
  const dateSet = new Set<string>();
  slots.forEach((slot) => {
    dateSet.add(formatShortDate(slot.date));
  });
  return Array.from(dateSet);
};

interface BookingSummaryProps {
  price: number;
  quantity: number;
  maxQty: number;
  onIncreaseQty: () => void;
  onDecreaseQty: () => void;
  onConfirm: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  price,
  quantity,
  maxQty,
  onIncreaseQty,
  onDecreaseQty,
  onConfirm
}) => {
  const TAX_RATE = 0.05; 
  const taxes = (price * quantity) * TAX_RATE; 
  const subtotal = price * quantity;
  const total = subtotal + taxes;

  return (
    <div className="sticky top-24 rounded-lg bg-delite-cart ">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-delite-cart-text text-base">Starts at</span>
          <span className="text-delite-black text-lg">₹{price}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-delite-cart-text text-base">Quantity</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onDecreaseQty}
              disabled={quantity <= 1}
              className="w-4 h-4 flex items-center justify-center border border-delite-cart-border text-delite-black disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-xs w-4 text-center">{quantity}</span>
            <button
              onClick={onIncreaseQty}
              disabled={quantity >= maxQty}
              className="w-4 h-4 flex items-center justify-center border border-delite-cart-border text-delite-black disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-delite-cart-text text-base">Subtotal</span>
          <span className="text-delite-black text-sm">₹{subtotal.toFixed(0)}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-delite-cart-text text-base">Taxes</span>
          <span className="text-delite-black text-sm">₹{taxes.toFixed(0)}</span>
        </div>

        <hr className="my-3 border-gray-200" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-delite-black text-xl">Total</span>
          <span className="text-delite-black text-xl">₹{total.toFixed(0)}</span>
        </div>

        <button onClick={onConfirm} className={
          `w-full text-delite-black py-2.5 px-4 rounded-lg transition-colors 
          ${
            maxQty == 0 ? 'bg-delite-cart-disabled-button' : 'bg-delite-yellow' 
          }`
        }>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default function ExperiencePage() {
  const params = useParams();
  const router = useRouter();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const expData = await getExperience(params.id as string);

        setExperience(expData);
        
        if (expData.slots && expData.slots.length > 0) {
          const uniqueDates = getUniqueDates(expData.slots);
          setSelectedDate(uniqueDates[0]);
          setSelectedSlotId(null); 
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const slots = experience?.slots ?? [];
  const uniqueDates = getUniqueDates(slots);

  const availableTimes = slots
    .filter((slot) => formatShortDate(slot.date) === selectedDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 

  const selectedSlot = slots.find(slot => slot._id === selectedSlotId);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
  };

  const handleTimeSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => {
      if (selectedSlot && prev + 1 > selectedSlot.available) {
        return prev;
      }
      return prev + 1;
    });
  };

  const handleDecreaseQty = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = () => {
    if (!selectedSlotId) {
      alert('Please select a time slot before confirming.');
      return;
    }
    if (!experience) {
      alert('Error: Experience data is missing.');
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('expId', experience._id);
    queryParams.append('slotId', selectedSlotId);
    queryParams.append('qty', quantity.toString());

    router.push(`/checkout?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-xl">Error loading experience</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <Link href={'/'}>
          <div className="flex items-center gap-2 text-sm text-delite-black">
            <ArrowLeft size={20} />
            <span>Details</span>
          </div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-4">
          
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 mb-6 overflow-hidden rounded-2xl">
              <Image
                src={experience.image}
                alt={experience.name}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-2xl text-delite-black mb-4">{experience.name}</h1>
            <p className="text-base text-delite-gray mb-8">{experience.description}</p>

            <div className="mb-8">
              <h3 className="text-lg mb-3">Choose date</h3>
              <div className="flex flex-wrap gap-3">
                {uniqueDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`px-3 py-1.5 rounded-sm text-sm border-[0.6] text-delite-text
                      ${selectedDate === date
                        ? 'bg-delite-yellow border-delite-yellow'
                        : 'bg-white border-delite-border'
                      }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg mb-3">Choose time</h3>
              <div className="flex flex-wrap gap-3">
                {availableTimes.length > 0 ? (
                  availableTimes.map((slot) => {
                    const isSoldOut = slot.status === 'sold_out' || slot.available === 0;
                    const isSelected = selectedSlotId === slot._id;
                    
                    return (
                      <button
                        key={slot._id}
                        onClick={() => handleTimeSelect(slot._id)}
                        disabled={isSoldOut}
                        className={`px-3 py-1.5 rounded-sm text-sm border-[0.6] flex flex-row space-x-2 items-center text-delite-text
                          ${
                            isSoldOut
                              ? 'bg-delite-disabled cursor-not-allowed border-delite-disabled'
                              : isSelected
                                ? 'bg-delite-yellow border-delite-yellow text-delite-black'
                                : 'bg-white border-delite-border hover:border-gray-500'
                          }
                        `}

                      >
                        <span className="">{slot.time}</span>
                        {isSoldOut ? (
                          <span className="text-tiny text-delite-strong">Sold out</span>
                        ) : (
                          <span className="text-tiny font-medium text-delite-orange">{slot.available} left</span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No available times for this date.</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">All times are in IST (GMT +5:30)</p>
            </div>

            <div>
              <h3 className="text-lg mb-4">About</h3>
              <div className="bg-delite-about border border-delite-about rounded-md p-3">
                <p className="text-delite-text text-xs">{experience.about}</p>
              </div>
            </div>

          </div>
          
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <BookingSummary
              price={experience.price}
              quantity={quantity}
              maxQty={selectedSlot?.available || 0}
              onConfirm={handleConfirm}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
            />
          </div>

        </div>
      </div>
    </div>
  );
}