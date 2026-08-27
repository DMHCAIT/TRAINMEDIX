export type UserRole = 'trainee' | 'hospital' | 'admin';

export type CityName =
  | 'Delhi'
  | 'Noida'
  | 'Gurugram'
  | 'Mumbai'
  | 'Pune'
  | 'Hyderabad'
  | 'Bangalore'
  | 'Chennai'
  | 'Kolkata'
  | 'Ahmedabad'
  | 'Jaipur'
  | 'Chandigarh'
  | 'Kochi'
  | 'Lucknow'
  | 'Bhopal'
  | 'Other'
  | (string & {});

export type DurationOption = '1 Month' | '3 Months' | '6 Months';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  availableCities: CityName[];
  subDepartments?: string[];
  hospitalsCount: number;
  iconName: string;
  featured?: boolean;
  baseFeePerMonth: number;
  clinicalHighlights: string[];
  image?: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: CityName;
  rating: number;
  departments: string[]; // department IDs
  availableSlotsCount: number;
  image: string;
  address: string;
  chiefMentor?: string;
  description?: string;
  clinicalHighlights?: string[];
  mostBookedSpecialization?: string;
  offeredDepartments?: Record<string, string[]>;
}

export interface TrainingSlot {
  id: string;
  hospitalId: string;
  departmentId: string;
  subDepartment?: string;
  city: CityName;
  duration: DurationOption;
  startDate: string; // e.g. "2026-08-15"
  endDate: string;
  totalSeats: number;
  availableSeats: number;
  monthlyFee: number;
  status: 'Open' | 'Filling Fast' | 'Sold Out';
}

export interface Booking {
  id: string;
  bookingRef: string;
  traineeName: string;
  traineeEmail: string;
  traineePhone: string;
  medicalQualification: string;
  councilRegistrationNumber: string;
  departmentId: string;
  departmentName: string;
  subDepartment?: string;
  hospitalId: string;
  hospitalName: string;
  city: CityName;
  duration: DurationOption;
  startDate: string;
  amountPaid: number;
  paymentMethod: 'UPI' | 'Debit Card' | 'Credit Card' | 'EMI' | 'International Payment';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingStatus: 'Approved' | 'Pending Approval' | 'In Rotation' | 'Completed' | 'Rejected';
  documents: {
    medicalLicense?: string;
    idProof?: string;
    degreeCertificate?: string;
  };
  createdAt: string;
}

export interface LogbookEntry {
  id: string;
  bookingId: string;
  date: string;
  procedureName: string;
  casesObserved: number;
  casesAssisted: number;
  supervisorSignature: boolean;
  notes: string;
}

export interface Certificate {
  certificateId: string;
  traineeName: string;
  qualification: string;
  departmentName: string;
  hospitalName: string;
  city: CityName;
  duration: DurationOption;
  issueDate: string;
  completionDate: string;
  qrCodeUrl: string;
  verificationCode: string;
  dmhcaRegNumber: string;
}

export interface NotificationItem {
  id: string;
  type: 'WhatsApp' | 'Email' | 'System';
  recipient: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Read';
}
