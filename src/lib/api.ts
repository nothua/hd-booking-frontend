import type { Experience, Booking, BookingData, PromoValidationResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getExperiences(searchQuery?: string): Promise<Experience[]> {
  const url = new URL(`${API_BASE_URL}/experiences`);
  
  if (searchQuery) {
    url.searchParams.append('search', searchQuery);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch experiences');
  }

  return response.json();
}


export async function getExperience(id: string): Promise<Experience> {
  const response = await fetch(`${API_BASE_URL}/experiences/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch experience');
  }
  
  return response.json();
}

export async function createBooking(bookingData: BookingData): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create booking');
  }
  
  return response.json();
}

export async function getBookingByReference(reference: string): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings/${reference}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }
  
  return response.json();
}

export async function validatePromoCode(
  code: string,
  experienceId: string,
  quantity: number
): Promise<PromoValidationResponse> {
  const response = await fetch(`${API_BASE_URL}/promos/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, experienceId, quantity }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to validate promo code');
  }

  return data;
}