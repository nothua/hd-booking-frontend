export interface Experience {
  _id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  about: string;
  price: number;
  duration?: string;
  included?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  slots?: Slot[];
}

export interface Slot {
  _id: string;
  experienceId: string;
  date: Date;
  time: string;
  capacity: number;
  booked: number;
  available: number;
  status: 'available' | 'low' | 'sold_out';
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoValidationResponse {
  isValid: boolean;
  message: string;
  subtotal?: number;
  discountAmount?: number;
  total?: number;
}

export interface BookingData {
  fullName: string;
  email: string;
  phone?: string;
  experienceId: string;
  slotId: string;
  quantity: number;
  promoCode?: string;
  agreedToTerms: boolean;
}

export interface Booking extends BookingData {
  _id: string;
  date: Date;
  time: string;
  subtotal: number;
  taxes: number;
  discount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingReference: string;
  createdAt?: string;
  updatedAt?: string;
}