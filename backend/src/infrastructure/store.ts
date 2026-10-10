import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  OrganizationType,
  UserModel,
  CaseType,
  CaseStatus,
  CasePriority,
  ICaseLocation,
  ICaseAttachment,
  ICaseSla,
  ICaseResolution,
  ICaseFeedback,
  CaseEventType,
  ICaseEventAttachment,
  IDepartment,
  IOrgLocation,
  IContactChannel,
  DestinationType,
  DestinationVerificationStatus,
  ICaseRouting,
  ICaseExternalDispatch,
  ICaseEventReadReceipt,
  NotificationType,
  BloodGroup,
  DonorAvailabilityStatus,
  ContactPreference,
  FormModel,
} from '@cpet/database';

export interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  organizationId?: string | null;
  organizationName?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  consent: {
    termsAccepted: boolean;
    termsVersion: string;
    acceptedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryOrganization {
  _id: string;
  name: string;
  slug: string;
  brandName?: string;
  aliases: string[];
  type: OrganizationType;
  category: string;
  departments: IDepartment[];
  services: string[];
  products: string[];
  serviceCategories: string[];
  locations: IOrgLocation[];
  jurisdictions: string[];
  contactChannels: IContactChannel[];
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  active: boolean;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  settings: {
    autoAssign: boolean;
    defaultSlaHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryDestination {
  _id: string;
  organizationId: string;
  departmentId?: string;
  serviceCategory?: string;
  type: DestinationType;
  value: string;
  credentials?: Record<string, any>;
  source: string;
  verificationStatus: DestinationVerificationStatus;
  verifiedDate?: Date;
  activeStatus: boolean;
  reviewDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryNotification {
  _id: string;
  recipientUserId?: string;
  recipientOrgId?: string;
  caseId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySession {
  _id: string;
  userId: string;
  refreshTokenHash: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface MemoryOtp {
  _id: string;
  target: string;
  destinationHash?: string;
  otpHash: string;
  purpose: string;
  attempts: number;
  maxAttempts: number;
  isVerified: boolean;
  lastSentAt: Date;
  verifiedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryCase {
  _id: string;
  referenceNumber: string;
  type: CaseType;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  productService?: string;
  structuredData: Record<string, any>;
  location?: ICaseLocation;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  organizationId: string;
  organizationName?: string;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  priority: CasePriority;
  status: CaseStatus;
  routing?: ICaseRouting;
  externalDispatch?: ICaseExternalDispatch;
  attachments: ICaseAttachment[];
  sla: ICaseSla;
  resolution?: ICaseResolution;
  feedback?: ICaseFeedback;
  version: number;
  submittedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryCaseEvent {
  _id: string;
  caseId: string;
  actorId?: string | null;
  actorName: string;
  actorRole: UserRole | 'SYSTEM';
  eventType: CaseEventType;
  previousState?: string | null;
  newState?: string | null;
  message: string;
  isInternal: boolean;
  attachments?: ICaseEventAttachment[];
  readBy?: ICaseEventReadReceipt[];
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MemoryDonor {
  _id: string;
  userId?: string;
  anonymousDonorCode: string;
  bloodGroup: BloodGroup;
  availabilityStatus: DonorAvailabilityStatus;
  approximateLocation: {
    locality?: string;
    municipality?: string;
    subDistrict?: string;
    district?: string;
    state?: string;
    pincode?: string;
    coordinates?: [number, number];
  };
  contactPreference: ContactPreference;
  contactPhone: string;
  contactEmail?: string;
  lastDonatedAt?: Date;
  isVerified: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'rating' | 'location';
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  order: number;
}

export interface MemoryForm {
  _id: string;
  organizationId?: string | null;
  organizationName: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  department?: string;
  isPublic: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slaHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  fields: MemoryFormField[];
  submitButtonText: string;
  successMessage: string;
  submissionsCount: number;
  publishedAt?: Date;
  createdById?: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  public users = new Map<string, MemoryUser>();
  public organizations = new Map<string, MemoryOrganization>();
  public destinations = new Map<string, MemoryDestination>();
  public notifications = new Map<string, MemoryNotification>();
  public sessions = new Map<string, MemorySession>();
  public otps = new Map<string, MemoryOtp>();
  public cases = new Map<string, MemoryCase>();
  public caseEvents = new Map<string, MemoryCaseEvent[]>(); // keyed by caseId
  public donors = new Map<string, MemoryDonor>();
  public slaPolicies = new Map<string, any>();
  public forms = new Map<string, MemoryForm>();

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    // Seed default administrative users
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', 10);

    const superAdminId = '66d100000000000000000001';
    this.users.set(superAdminId, {
      _id: superAdminId,
      name: 'System Administrator',
      email: 'admin@cpet.org',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      organizationId: null,
      organizationName: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cpetAdminId = '66d100000000000000000002';
    this.users.set(cpetAdminId, {
      _id: cpetAdminId,
      name: 'Chief CPET Administrator',
      email: 'admin@cpet.gov.in',
      phone: '+919876543211',
      passwordHash: adminPasswordHash,
      role: 'CPET_ADMIN',
      organizationId: null,
      organizationName: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orgId = '66d000000000000000000010';
    this.organizations.set(orgId, {
      _id: orgId,
      name: 'Apex Power & Water',
      slug: 'apex-power-water',
      brandName: 'Apex',
      aliases: ['apex', 'apex power', 'apex water'],
      type: 'UTILITY',
      category: 'Public Infrastructure',
      departments: [
        { id: 'DEP-APX-ELEC', name: 'Electric Distribution & Grid', code: 'ELEC-01', active: true, contactEmail: 'grid@apexutility.org' },
        { id: 'DEP-APX-WATER', name: 'Municipal Water & Sanitation', code: 'WATER-01', active: true, contactEmail: 'water@apexutility.org' },
        { id: 'DEP-APX-BILL', name: 'Commercial Metering & Billing', code: 'BILL-01', active: true, contactEmail: 'billing@apexutility.org' },
      ],
      services: ['Pipeline Leakage', 'Transformer Maintenance', 'Meter Calibration', 'Voltage Issue'],
      products: ['Municipal Water Pipeline', 'Electric Distribution Line', 'Smart Energy Meter'],
      serviceCategories: ['Public Utilities', 'Consumer Grievance'],
      locations: [
        { city: 'Metro City', state: 'Metro State', pincodes: ['500001', '500002'], address: 'Suite 400, Civic Center', isHeadquarters: true },
        { city: 'Hyderabad', state: 'Telangana', pincodes: ['500081'], address: 'Hitec City Utilities Center' },
      ],
      jurisdictions: ['Metro City', 'Greater Hyderabad', 'Telangana'],
      contactChannels: [
        { type: 'EMAIL', value: 'support@apexutility.org', isPrimary: true },
        { type: 'PHONE', value: '+1 555-0199', isPrimary: false },
      ],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'support@apexutility.org',
      contactPhone: '+1 555-0199',
      address: 'Suite 400, Civic Center',
      settings: {
        autoAssign: false,
        defaultSlaHours: 48,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Apex Destinations
    this.destinations.set('66d200000000000000000010', {
      _id: '66d200000000000000000010',
      organizationId: orgId,
      departmentId: 'DEP-APX-ELEC',
      type: 'INTERNAL_QUEUE',
      value: 'apex-triage-queue',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000011', {
      _id: '66d200000000000000000011',
      organizationId: orgId,
      departmentId: 'DEP-APX-WATER',
      type: 'OFFICIAL_PORTAL',
      value: 'https://grievance.apexutility.gov.in',
      source: 'GOVERNMENT_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Lloyd Organization
    const lloydOrgId = '66d000000000000000000030';
    this.organizations.set(lloydOrgId, {
      _id: lloydOrgId,
      name: 'Lloyd (Havells Consumer Appliances)',
      slug: 'lloyd',
      brandName: 'Lloyd',
      aliases: ['lloyd', 'लॉयड', 'లాయిడ్', 'havells', 'havells-lloyd'],
      type: 'CONSUMER_GOODS',
      category: 'Consumer Appliance & Utilities',
      departments: [
        { id: 'DEP-LLD-TECH', name: 'Technical Field Service & AC Care', code: 'TECH-01', active: true, contactEmail: 'service.south@lloyd.in' },
        { id: 'DEP-LLD-CARE', name: 'Customer Care & Warranty Desk', code: 'CARE-01', active: true, contactEmail: 'customercare@lloyd.in' },
        { id: 'DEP-LLD-GRIEVANCE', name: 'Consumer Grievance & Escalations', code: 'ESC-01', active: true, contactEmail: 'grievance@lloyd.in' },
      ],
      services: ['AC Servicing', 'Gas Leak Repair', 'Cooling Defect / Gas Check', 'Periodic Maintenance Service', 'Installation'],
      products: ['Lloyd Air Conditioner', 'Split Air Conditioner', 'Window AC', 'Home Refrigerator'],
      serviceCategories: ['Consumer Appliance & Utilities', 'HVAC'],
      locations: [
        { city: 'Hyderabad', state: 'Telangana', pincodes: ['500001', '500081', '500032'], address: 'Havells-Lloyd Service Hub, Begumpet', isHeadquarters: false },
        { city: 'National', state: 'All India', address: 'Noida HQ', isHeadquarters: true },
      ],
      jurisdictions: ['Greater Hyderabad', 'Telangana', 'National'],
      contactChannels: [
        { type: 'EMAIL', value: 'customercare@lloyd.in', isPrimary: true },
        { type: 'PHONE', value: '1800-102-2253', isPrimary: false },
      ],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'customercare@lloyd.in',
      contactPhone: '1800-102-2253',
      address: 'Havells India Ltd, Q4, Noida',
      settings: {
        autoAssign: true,
        defaultSlaHours: 48,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Lloyd Destinations
    this.destinations.set('66d200000000000000000001', {
      _id: '66d200000000000000000001',
      organizationId: lloydOrgId,
      departmentId: 'DEP-LLD-TECH',
      type: 'INTERNAL_QUEUE',
      value: 'lloyd-ac-triage-queue',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000002', {
      _id: '66d200000000000000000002',
      organizationId: lloydOrgId,
      departmentId: 'DEP-LLD-CARE',
      type: 'EMAIL',
      value: 'service.hyderabad@lloyd.in',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000003', {
      _id: '66d200000000000000000003',
      organizationId: lloydOrgId,
      departmentId: 'DEP-LLD-TECH',
      type: 'API',
      value: 'https://api.lloyd.in/v1/tickets',
      source: 'OFFICIAL_API',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Samsung Organization (for Multi-Brand Service Requests)
    const samsungOrgId = '66d000000000000000000040';
    this.organizations.set(samsungOrgId, {
      _id: samsungOrgId,
      name: 'Samsung India Electronics',
      slug: 'samsung-india',
      brandName: 'Samsung',
      aliases: ['samsung', 'सैमसंग', 'శామ్‌సంగ్', 'samsung-india'],
      type: 'CONSUMER_GOODS',
      category: 'Consumer Appliance & Utilities',
      departments: [
        { id: 'DEP-SAM-TECH', name: 'Samsung Technical Care & HVAC Support', code: 'SAM-TECH', active: true, contactEmail: 'support@samsung.com' },
        { id: 'DEP-SAM-CARE', name: 'Digital Appliances Support Desk', code: 'SAM-CARE', active: true, contactEmail: 'service@samsung.com' },
      ],
      services: ['AC Servicing', 'Compressor Check', 'Gas Leak Repair', 'Refrigerator Servicing', 'Washing Machine Repair'],
      products: ['Samsung Split AC', 'Samsung WindFree AC', 'Samsung Curd Maestro Refrigerator', 'Samsung EcoBubble Washing Machine'],
      serviceCategories: ['Consumer Appliance & Utilities', 'Digital Electronics'],
      locations: [
        { city: 'Hyderabad', state: 'Telangana', pincodes: ['500081', '500032'], address: 'Samsung SmartPlaza Service Hub, Hitec City', isHeadquarters: false },
        { city: 'National', state: 'All India', address: 'Samsung Two Horizon Center, Gurugram', isHeadquarters: true },
      ],
      jurisdictions: ['Greater Hyderabad', 'Telangana', 'National'],
      contactChannels: [
        { type: 'EMAIL', value: 'support@samsung.com', isPrimary: true },
        { type: 'PHONE', value: '1800-40-7267864', isPrimary: false },
      ],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'support@samsung.com',
      contactPhone: '1800-40-7267864',
      address: 'Samsung Electronics, Gurugram',
      settings: {
        autoAssign: true,
        defaultSlaHours: 48,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Samsung Destination
    this.destinations.set('66d200000000000000000041', {
      _id: '66d200000000000000000041',
      organizationId: samsungOrgId,
      departmentId: 'DEP-SAM-TECH',
      type: 'INTERNAL_QUEUE',
      value: 'samsung-triage-queue',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Red Cross Emergency Blood Center Organization
    const redCrossOrgId = '66d000000000000000000050';
    this.organizations.set(redCrossOrgId, {
      _id: redCrossOrgId,
      name: 'Red Cross Blood Center & Trauma Care',
      slug: 'red-cross-blood-center',
      brandName: 'Red Cross',
      aliases: ['red cross', 'redcross', 'blood bank', 'blood center'],
      type: 'HEALTHCARE',
      category: 'Emergency Healthcare',
      departments: [
        { id: 'DEP-RC-BLOOD', name: 'Emergency Blood & Donor Coordination', code: 'RC-BLOOD', active: true, contactEmail: 'emergency@redcrossblood.org' },
      ],
      services: ['Whole Blood Transfusion', 'Platelet Extraction', 'Emergency Cross-Matching', 'Rare Blood Group Registry'],
      products: ['Blood Units', 'Single Donor Platelets', 'Fresh Frozen Plasma'],
      serviceCategories: ['Emergency Healthcare', 'Blood Bank Coordination'],
      locations: [
        { city: 'Hyderabad', state: 'Telangana', pincodes: ['500001', '500081'], address: 'Central Blood Bank, Vidyanagar', isHeadquarters: true },
      ],
      jurisdictions: ['Greater Hyderabad', 'Telangana', 'National'],
      contactChannels: [
        { type: 'EMAIL', value: 'emergency@redcrossblood.org', isPrimary: true },
        { type: 'PHONE', value: '1800-BLOOD-HELP', isPrimary: true },
      ],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'emergency@redcrossblood.org',
      contactPhone: '1800-BLOOD-HELP',
      address: 'Central Red Cross Blood Bank, Vidyanagar, Hyderabad',
      settings: {
        autoAssign: true,
        defaultSlaHours: 12,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000051', {
      _id: '66d200000000000000000051',
      organizationId: redCrossOrgId,
      departmentId: 'DEP-RC-BLOOD',
      type: 'INTERNAL_QUEUE',
      value: 'redcross-blood-desk',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Anti-Ragging & Higher Education Cell
    const antiRaggingOrgId = '66d000000000000000000060';
    this.organizations.set(antiRaggingOrgId, {
      _id: antiRaggingOrgId,
      name: 'National Anti-Ragging Cell & UGC Grievance Desk',
      slug: 'ugc-anti-ragging',
      brandName: 'UGC Anti-Ragging',
      aliases: ['ugc', 'anti-ragging', 'antiragging', 'aicte', 'ragging cell'],
      type: 'GOVERNMENT',
      category: 'Higher Education & Statutory Cell',
      departments: [
        { id: 'DEP-UGC-ARC', name: 'Anti-Ragging Rapid Response Unit', code: 'ARC-01', active: true, contactEmail: 'helpline@antiragging.in' },
        { id: 'DEP-UGC-DEG', name: 'University Examination & Degree Bureau', code: 'DEG-01', active: true, contactEmail: 'degrees@ugc.ac.in' },
      ],
      services: ['Severe Campus Ragging', 'Hostel Bullying & Harassment', 'Degree Certificate Delay', 'Fee Cap Dispute'],
      products: ['Anti-Ragging Affidavit', 'Statutory Compliance Record'],
      serviceCategories: ['Education & Statutory Cell', 'Campus Grievance'],
      locations: [{ city: 'New Delhi', state: 'Delhi', pincodes: ['110002'], address: 'UGC Headquarters, Bahadur Shah Zafar Marg', isHeadquarters: true }],
      jurisdictions: ['National', 'All India Universities'],
      contactChannels: [{ type: 'PHONE', value: '1800-180-5522', isPrimary: true }, { type: 'EMAIL', value: 'helpline@antiragging.in', isPrimary: true }],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'helpline@antiragging.in',
      contactPhone: '1800-180-5522',
      address: 'UGC Headquarters, New Delhi',
      settings: { autoAssign: true, defaultSlaHours: 12 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000061', {
      _id: '66d200000000000000000061',
      organizationId: antiRaggingOrgId,
      departmentId: 'DEP-UGC-ARC',
      type: 'INTERNAL_QUEUE',
      value: 'ugc-antiragging-rapid-desk',
      source: 'GOVERNMENT_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed National Cyber Crime Reporting Bureau
    const cyberCrimeOrgId = '66d000000000000000000070';
    this.organizations.set(cyberCrimeOrgId, {
      _id: cyberCrimeOrgId,
      name: 'National Cyber Crime Reporting Bureau (1930 Helpline)',
      slug: 'cyber-crime-bureau',
      brandName: 'Cyber Crime 1930',
      aliases: ['cybercrime', 'cyber crime', '1930', 'cyber police', 'phishing cell'],
      type: 'GOVERNMENT',
      category: 'Law Enforcement & Cyber Security',
      departments: [
        { id: 'DEP-CYB-FIN', name: 'Financial Fraud & UPI Freeze Unit', code: 'CYB-FIN', active: true, contactEmail: 'finfraud@cybercrime.gov.in' },
        { id: 'DEP-CYB-HAR', name: 'Social Media & Cyber Stalking Cell', code: 'CYB-HAR', active: true, contactEmail: 'harassment@cybercrime.gov.in' },
      ],
      services: ['UPI Financial Fraud', 'Phishing Link Bank Hack', 'Social Media Impersonation', 'Unauthorized Card Debit'],
      products: ['Cyber Crime FIR Record', 'Bank Account Freeze Notice'],
      serviceCategories: ['Cyber Crime', 'Financial Fraud'],
      locations: [{ city: 'New Delhi', state: 'Delhi', pincodes: ['110003'], address: 'MHA Cyber Division, CGO Complex', isHeadquarters: true }],
      jurisdictions: ['National', 'All India Police Units'],
      contactChannels: [{ type: 'PHONE', value: '1930', isPrimary: true }, { type: 'EMAIL', value: 'helpdesk@cybercrime.gov.in', isPrimary: false }],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'helpdesk@cybercrime.gov.in',
      contactPhone: '1930',
      address: 'MHA Cyber Center, New Delhi',
      settings: { autoAssign: true, defaultSlaHours: 12 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000071', {
      _id: '66d200000000000000000071',
      organizationId: cyberCrimeOrgId,
      departmentId: 'DEP-CYB-FIN',
      type: 'INTERNAL_QUEUE',
      value: 'cybercrime-1930-desk',
      source: 'GOVERNMENT_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed E-Commerce Consumer Redressal
    const ecommerceOrgId = '66d000000000000000000080';
    this.organizations.set(ecommerceOrgId, {
      _id: ecommerceOrgId,
      name: 'Amazon India & E-Commerce Consumer Redressal Desk',
      slug: 'amazon-ecommerce',
      brandName: 'Amazon / E-Commerce',
      aliases: ['amazon', 'flipkart', 'ecommerce', 'swiggy', 'zomato', 'blinkit', 'zepto'],
      type: 'CONSUMER_GOODS',
      category: 'E-Commerce & Digital Commerce',
      departments: [
        { id: 'DEP-ECOM-REF', name: 'Order Refund & A-to-z Claims Bureau', code: 'ECOM-REF', active: true, contactEmail: 'grievance@amazon.in' },
      ],
      services: ['Damaged / Fake Item Delivered', 'Refund Delayed After Return', 'Missing High-Value Parcel', 'Quick Commerce Food Issue'],
      products: ['Amazon Order', 'E-Commerce Parcel'],
      serviceCategories: ['E-Commerce', 'Consumer Goods'],
      locations: [{ city: 'Bangalore', state: 'Karnataka', pincodes: ['560055'], address: 'World Trade Center, Brigade Gateway', isHeadquarters: true }],
      jurisdictions: ['National'],
      contactChannels: [{ type: 'PHONE', value: '1800-3000-9009', isPrimary: true }, { type: 'EMAIL', value: 'grievance@amazon.in', isPrimary: true }],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'grievance@amazon.in',
      contactPhone: '1800-3000-9009',
      address: 'Brigade Gateway, Bangalore',
      settings: { autoAssign: true, defaultSlaHours: 24 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000081', {
      _id: '66d200000000000000000081',
      organizationId: ecommerceOrgId,
      departmentId: 'DEP-ECOM-REF',
      type: 'INTERNAL_QUEUE',
      value: 'ecommerce-disputes-queue',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Telecom Ombudsman Desk (Jio / Airtel)
    const telecomOrgId = '66d000000000000000000090';
    this.organizations.set(telecomOrgId, {
      _id: telecomOrgId,
      name: 'Reliance Jio & Telecom Consumer Ombudsman Cell',
      slug: 'jio-telecom',
      brandName: 'Reliance Jio / Airtel Telecom',
      aliases: ['jio', 'reliance jio', 'airtel', 'vodafone idea', 'bsnl', 'telecom desk', 'broadband fiber', 'act fibernet'],
      type: 'UTILITY',
      category: 'Telecom & Fiber Broadband',
      departments: [
        { id: 'DEP-TEL-FIB', name: 'Fiber Broadband Outage & Repair', code: 'TEL-FIB', active: true, contactEmail: 'fiber.care@jio.com' },
        { id: 'DEP-TEL-MNP', name: 'MNP Porting & Billing Redressal', code: 'TEL-MNP', active: true, contactEmail: 'appellate@jio.com' },
      ],
      services: ['Fiber Cable Cut / Outage', 'MNP Porting Denial', 'Unauthorized VAS Deductions', 'Network Dead Zone'],
      products: ['JioFiber Optical Link', '5G Mobile SIM Connection'],
      serviceCategories: ['Telecom & Broadband', 'Utilities'],
      locations: [{ city: 'Mumbai', state: 'Maharashtra', pincodes: ['400701'], address: 'Reliance Corporate Park, Navi Mumbai', isHeadquarters: true }],
      jurisdictions: ['National'],
      contactChannels: [{ type: 'PHONE', value: '1800-889-9999', isPrimary: true }, { type: 'EMAIL', value: 'appellate@jio.com', isPrimary: true }],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'appellate@jio.com',
      contactPhone: '1800-889-9999',
      address: 'Reliance Corporate Park, Navi Mumbai',
      settings: { autoAssign: true, defaultSlaHours: 48 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000091', {
      _id: '66d200000000000000000091',
      organizationId: telecomOrgId,
      departmentId: 'DEP-TEL-FIB',
      type: 'INTERNAL_QUEUE',
      value: 'telecom-fiber-triage-desk',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed ABC Healthcare Ltd. Organization (from UI mockup)
    const abcHealthOrgId = '66d0000000000000000000ab';
    this.organizations.set(abcHealthOrgId, {
      _id: abcHealthOrgId,
      name: 'ABC Healthcare Ltd.',
      slug: 'abc-healthcare',
      brandName: 'ABC Healthcare',
      aliases: ['abc', 'abc healthcare', 'abc hospital', 'apollo', 'healthcare'],
      type: 'HEALTHCARE',
      category: 'Healthcare & Hospital Services',
      departments: [
        { id: 'DEP-ABC-WATER', name: 'Water Supply Department', code: 'WAT-01', active: true, contactEmail: 'water@abchealthcare.org' },
        { id: 'DEP-ABC-PATIENT', name: 'Patient Care & Grievance Desk', code: 'PAT-01', active: true, contactEmail: 'care@abchealthcare.org' },
        { id: 'DEP-ABC-EMERGENCY', name: 'Emergency Medical & Trauma Cell', code: 'EMG-01', active: true, contactEmail: 'emergency@abchealthcare.org' },
      ],
      services: ['Water Supply Issue', 'Patient Care Grievance', 'Emergency Blood Support', 'Hospital Facilities', 'Diagnostic Billing'],
      products: ['Hospital Clinical Services', 'Community Sanitation & Water Desk', 'Emergency Ambulance'],
      serviceCategories: ['Healthcare & Hospital Services', 'Public Health & Sanitation'],
      locations: [
        { city: 'Rajahmundry', state: 'Andhra Pradesh', pincodes: ['533101', '533103'], address: 'Main Road, Danavaipeta, Rajahmundry', isHeadquarters: true },
        { city: 'Hyderabad', state: 'Telangana', pincodes: ['500081'], address: 'Cyber Towers Campus' },
      ],
      jurisdictions: ['Rajahmundry', 'East Godavari', 'Andhra Pradesh', 'Telangana'],
      contactChannels: [
        { type: 'EMAIL', value: 'contact@abchealthcare.org', isPrimary: true },
        { type: 'PHONE', value: '+91 94940 12345', isPrimary: true },
      ],
      status: 'VERIFIED',
      active: true,
      contactEmail: 'contact@abchealthcare.org',
      contactPhone: '+91 94940 12345',
      address: 'Main Road, Danavaipeta, Rajahmundry',
      settings: {
        autoAssign: true,
        defaultSlaHours: 24,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.destinations.set('66d200000000000000000072', {
      _id: '66d200000000000000000072',
      organizationId: abcHealthOrgId,
      departmentId: 'DEP-ABC-WATER',
      type: 'INTERNAL_QUEUE',
      value: 'abc-water-triage-desk',
      source: 'OFFICIAL_REGISTRY',
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date(),
      activeStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const citizenId = '66d000000000000000000099';
    const validBcryptHash = bcrypt.hashSync('Password123!', 10); // Password123!

    this.users.set(citizenId, {
      _id: citizenId,
      name: 'Dev Citizen',
      email: 'citizen@cpet.org',
      phone: '+1 555-0199',
      passwordHash: validBcryptHash,
      role: 'CITIZEN',
      organizationId: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed ABC Healthcare Admin User (Medha Sri Varsha from Mockup)
    const abcAdminId = '66d000000000000000000075';
    this.users.set(abcAdminId, {
      _id: abcAdminId,
      name: 'Medha Sri Varsha',
      email: 'admin@abchealthcare.org',
      phone: '+91 94940 12345',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_ADMIN',
      organizationId: abcHealthOrgId,
      organizationName: 'ABC Healthcare Ltd.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orgAdminId = '66d000000000000000000011';
    this.users.set(orgAdminId, {
      _id: orgAdminId,
      name: 'Apex Admin',
      email: 'admin@apexutility.org',
      phone: '+1 555-0199',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_ADMIN',
      organizationId: orgId,
      organizationName: 'Apex Power & Water',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orgAgentId = '66d000000000000000000012';
    this.users.set(orgAgentId, {
      _id: orgAgentId,
      name: 'Apex Agent Alice',
      email: 'alice@apexutility.org',
      phone: '+1 555-0198',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_AGENT',
      organizationId: orgId,
      organizationName: 'Apex Power & Water',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const lloydAgentId = '66d000000000000000000032';
    this.users.set(lloydAgentId, {
      _id: lloydAgentId,
      name: 'Lloyd Support Specialist',
      email: 'support@lloyd.in',
      phone: '+91 9876543210',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_AGENT',
      organizationId: lloydOrgId,
      organizationName: 'Lloyd (Havells Consumer Appliances)',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Lloyd Admin User
    const lloydAdminId = '66d000000000000000000031';
    this.users.set(lloydAdminId, {
      _id: lloydAdminId,
      name: 'Lloyd Admin',
      email: 'admin@lloydappliances.com',
      phone: '+91 9876543211',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_ADMIN',
      organizationId: lloydOrgId,
      organizationName: 'Lloyd (Havells Consumer Appliances)',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Samsung Admin User
    const samsungAdminId = '66d000000000000000000041';
    this.users.set(samsungAdminId, {
      _id: samsungAdminId,
      name: 'Samsung Operations Admin',
      email: 'admin@samsung.com',
      phone: '+91 9876543222',
      passwordHash: validBcryptHash,
      role: 'ORGANIZATION_ADMIN',
      organizationId: samsungOrgId,
      organizationName: 'Samsung India Electronics',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Sample Case 1: Service Request
    const case1Id = '66d100000000000000000001';
    const due1 = new Date(Date.now() + 43 * 3600 * 1000);
    this.cases.set(case1Id, {
      _id: case1Id,
      referenceNumber: 'CPET-2026-001',
      type: 'SERVICE_REQUEST',
      title: 'Defective consumer unit electrical failure',
      description: 'Defective consumer unit electrical failure within 48 hours of purchase. Seeking replacement under warranty.',
      category: 'Consumer Goods',
      subcategory: 'Power Electronics',
      productService: 'Apex Transformer Model X-1',
      structuredData: {
        serialNumber: 'SN-APX-99882',
        purchaseDate: '2026-09-01',
        warrantyValid: true,
      },
      location: {
        city: 'Metro City',
        address: '42 Civic Avenue',
        pincode: '500001',
      },
      requesterId: citizenId,
      requesterName: 'Dev Citizen',
      requesterEmail: 'citizen@cpet.org',
      requesterPhone: '+1 555-0199',
      organizationId: orgId,
      organizationName: 'Apex Power & Water',
      assignedAgentId: null,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      attachments: [],
      sla: {
        dueAt: due1,
        slaHours: 48,
        isEscalated: false,
      },
      version: 2,
      submittedAt: new Date(Date.now() - 5 * 3600 * 1000),
      acknowledgedAt: new Date(Date.now() - 4 * 3600 * 1000),
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
      updatedAt: new Date(),
    });

    this.caseEvents.set(case1Id, [
      {
        _id: 'evt-101',
        caseId: case1Id,
        actorId: citizenId,
        actorName: 'Dev Citizen',
        actorRole: 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: 'Request created and submitted with warranty proof.',
        isInternal: false,
        timestamp: new Date(Date.now() - 5 * 3600 * 1000),
      },
      {
        _id: 'evt-102',
        caseId: case1Id,
        actorId: null,
        actorName: 'CPET Routing Gateway',
        actorRole: 'SYSTEM',
        eventType: 'STATUS_CHANGE',
        previousState: 'SUBMITTED',
        newState: 'ACKNOWLEDGED',
        message: 'Validated serial number and routed to Consumer Support queue with standard 48-hour SLA.',
        isInternal: false,
        timestamp: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        _id: 'evt-103',
        caseId: case1Id,
        actorId: orgId,
        actorName: 'Support Desk Agent',
        actorRole: 'ORGANIZATION_AGENT',
        eventType: 'STATUS_CHANGE',
        previousState: 'ACKNOWLEDGED',
        newState: 'IN_PROGRESS',
        message: 'Technician dispatched for on-site inspection under warranty.',
        isInternal: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ]);

    // Seed Sample Case 2: Complaint
    const case2Id = '66d100000000000000000002';
    const due2 = new Date(Date.now() + 47 * 3600 * 1000);
    this.cases.set(case2Id, {
      _id: case2Id,
      referenceNumber: 'CPET-2026-002',
      type: 'COMPLAINT',
      title: 'Delayed public transit route escalation',
      description: 'Route #42 civic bus delayed by over 45 minutes consistently during peak evening commute.',
      category: 'Transport',
      subcategory: 'Bus Transit',
      productService: 'Civic Metro Line #42',
      structuredData: {
        busRoute: '42-East',
        incidentDate: '2026-09-10',
      },
      location: {
        city: 'Metro City',
        address: 'Terminal 3',
        pincode: '500002',
      },
      requesterId: citizenId,
      requesterName: 'Dev Citizen',
      requesterEmail: 'citizen@cpet.org',
      organizationId: orgId,
      organizationName: 'Apex Power & Water',
      assignedAgentId: null,
      priority: 'MEDIUM',
      status: 'SUBMITTED',
      attachments: [],
      sla: {
        dueAt: due2,
        slaHours: 48,
        isEscalated: false,
      },
      version: 1,
      submittedAt: new Date(Date.now() - 1 * 3600 * 1000),
      createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      updatedAt: new Date(),
    });

    this.caseEvents.set(case2Id, [
      {
        _id: 'evt-201',
        caseId: case2Id,
        actorId: citizenId,
        actorName: 'Dev Citizen',
        actorRole: 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: 'Formal grievance filed regarding schedule deviation.',
        isInternal: false,
        timestamp: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ]);

    // Seed Sample Case 3: Blood Request
    const case3Id = '66d100000000000000000003';
    const due3 = new Date(Date.now() + 6 * 3600 * 1000);
    this.cases.set(case3Id, {
      _id: case3Id,
      referenceNumber: 'CPET-2026-003',
      type: 'BLOOD_REQUEST',
      title: 'Emergency O-Negative units required at City Trauma Care',
      description: 'Urgent need for 2 units of O-Negative whole blood for emergency orthopedic surgery.',
      category: 'Healthcare',
      subcategory: 'Emergency Blood Requirement',
      productService: 'Blood Bank Coordination',
      structuredData: {
        bloodGroup: 'O-',
        unitsNeeded: 2,
        hospitalName: 'Metro City Trauma Hospital',
        patientName: 'R. Sharma',
        attendantPhone: '+1 555-0199',
      },
      location: {
        city: 'Metro City',
        address: 'Metro City Trauma Hospital, Emergency Ward 2B',
        pincode: '500005',
      },
      requesterId: citizenId,
      requesterName: 'Dev Citizen',
      requesterEmail: 'citizen@cpet.org',
      organizationId: orgId,
      organizationName: 'Apex Power & Water',
      assignedAgentId: null,
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      attachments: [],
      sla: {
        dueAt: due3,
        slaHours: 12,
        isEscalated: false,
      },
      version: 2,
      submittedAt: new Date(Date.now() - 2 * 3600 * 1000),
      acknowledgedAt: new Date(Date.now() - 1.5 * 3600 * 1000),
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      updatedAt: new Date(),
    });

    this.caseEvents.set(case3Id, [
      {
        _id: 'evt-301',
        caseId: case3Id,
        actorId: citizenId,
        actorName: 'Dev Citizen',
        actorRole: 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: 'Emergency request generated with priority response flag.',
        isInternal: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        _id: 'evt-302',
        caseId: case3Id,
        actorId: orgId,
        actorName: 'Emergency Response Lead',
        actorRole: 'ORGANIZATION_AGENT',
        eventType: 'STATUS_CHANGE',
        previousState: 'SUBMITTED',
        newState: 'IN_PROGRESS',
        message: 'Dispatched broadcast alert to matching O- registered donors in 10km radius.',
        isInternal: false,
        timestamp: new Date(Date.now() - 1.5 * 3600 * 1000),
      },
    ]);

    // Seed ABC Healthcare Case 1: CPET-2025-1043 (Water Supply Issue)
    const case1043Id = '66d100000000000000001043';
    const due1043 = new Date(Date.now() + 4 * 3600 * 1000);
    this.cases.set(case1043Id, {
      _id: case1043Id,
      referenceNumber: 'CPET-2025-1043',
      type: 'COMPLAINT',
      title: 'Low water pressure and pipeline contamination in Ward 4',
      description: 'Low water pressure and muddy water in pipeline since morning. Affecting residential block.',
      category: 'Water Supply',
      subcategory: 'Pipeline Quality & Supply',
      productService: 'Municipal Water & Sanitation',
      structuredData: {
        civicWard: 'Ward 4',
        landmark: 'Near Danavaipeta Water Tank',
      },
      location: {
        city: 'Rajahmundry',
        address: 'Ward 4, Rajahmundry East',
        pincode: '533103',
      },
      requesterId: citizenId,
      requesterName: 'Dev Citizen',
      requesterEmail: 'citizen@cpet.org',
      requesterPhone: '+91 94940 12345',
      organizationId: abcHealthOrgId,
      organizationName: 'ABC Healthcare Ltd.',
      assignedAgentId: abcAdminId,
      assignedAgentName: 'Medha Sri Varsha',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      attachments: [],
      sla: {
        dueAt: due1043,
        slaHours: 24,
        isEscalated: false,
      },
      version: 3,
      submittedAt: new Date(Date.now() - 3 * 3600 * 1000),
      acknowledgedAt: new Date(Date.now() - 2.5 * 3600 * 1000),
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      updatedAt: new Date(),
    });

    this.caseEvents.set(case1043Id, [
      {
        _id: 'evt-1043-1',
        caseId: case1043Id,
        actorId: citizenId,
        actorName: 'Dev Citizen',
        actorRole: 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: 'Low water pressure and muddy water in pipeline since morning.',
        isInternal: false,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        _id: 'evt-1043-2',
        caseId: case1043Id,
        actorId: null,
        actorName: 'CPET Smart Routing',
        actorRole: 'SYSTEM',
        eventType: 'STATUS_CHANGE',
        previousState: 'SUBMITTED',
        newState: 'ACKNOWLEDGED',
        message: 'Assigned to Water Supply Dept with 4-hour SLA window.',
        isInternal: true,
        timestamp: new Date(Date.now() - 2.5 * 3600 * 1000),
      },
      {
        _id: 'evt-1043-3',
        caseId: case1043Id,
        actorId: abcAdminId,
        actorName: 'Medha Sri Varsha',
        actorRole: 'ORGANIZATION_ADMIN',
        eventType: 'MESSAGE',
        previousState: 'ACKNOWLEDGED',
        newState: 'IN_PROGRESS',
        message: 'Field inspection team dispatched to test main water supply valve.',
        isInternal: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        _id: 'evt-1043-4',
        caseId: case1043Id,
        actorId: citizenId,
        actorName: 'Dev Citizen',
        actorRole: 'CITIZEN',
        eventType: 'MESSAGE',
        previousState: null,
        newState: null,
        message: 'Any update on the repair? We need water for household by evening.',
        isInternal: false,
        timestamp: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ]);

    // Seed Companion Cases 1042-1037 for ABC Healthcare
    const companionCases = [
      { id: '66d100000000000000001042', ref: 'CPET-2025-1042', cat: 'Electricity', status: 'SUBMITTED', pri: 'MEDIUM', title: 'Streetlight power fluctuation in Block B' },
      { id: '66d100000000000000001041', ref: 'CPET-2025-1041', cat: 'Mobile Network', status: 'WAITING_FOR_USER', pri: 'LOW', title: 'Broadband loss of signal alert' },
      { id: '66d100000000000000001040', ref: 'CPET-2025-1040', cat: 'Consumer Goods', status: 'IN_PROGRESS', pri: 'MEDIUM', title: 'Appliance warranty service request' },
      { id: '66d100000000000000001039', ref: 'CPET-2025-1039', cat: 'Healthcare', status: 'ESCALATED', pri: 'HIGH', title: 'Emergency ambulance dispatch follow-up' },
      { id: '66d100000000000000001038', ref: 'CPET-2025-1038', cat: 'Water Supply', status: 'RESOLVED', pri: 'LOW', title: 'Ward 12 valve leakage resolved' },
      { id: '66d100000000000000001037', ref: 'CPET-2025-1037', cat: 'Electricity', status: 'WAITING_FOR_USER', pri: 'MEDIUM', title: 'Commercial meter replacement request' },
    ];

    for (const c of companionCases) {
      this.cases.set(c.id, {
        _id: c.id,
        referenceNumber: c.ref,
        type: 'COMPLAINT',
        title: c.title,
        description: `${c.title}. Logged via CPET universal multi-tenant platform.`,
        category: c.cat,
        productService: c.cat,
        structuredData: {},
        location: { city: 'Rajahmundry', address: 'Central Zone', pincode: '533101' },
        requesterId: citizenId,
        requesterName: 'Dev Citizen',
        requesterEmail: 'citizen@cpet.org',
        requesterPhone: '+91 94940 12345',
        organizationId: abcHealthOrgId,
        organizationName: 'ABC Healthcare Ltd.',
        assignedAgentId: abcAdminId,
        assignedAgentName: 'Medha Sri Varsha',
        priority: c.pri as any,
        status: c.status as any,
        attachments: [],
        sla: {
          dueAt: new Date(Date.now() + 24 * 3600 * 1000),
          slaHours: 24,
          isEscalated: c.status === 'ESCALATED',
        },
        version: 1,
        submittedAt: new Date(Date.now() - 6 * 3600 * 1000),
        createdAt: new Date(Date.now() - 6 * 3600 * 1000),
        updatedAt: new Date(),
      });

      this.caseEvents.set(c.id, [
        {
          _id: `evt-${c.ref}`,
          caseId: c.id,
          actorId: citizenId,
          actorName: 'Dev Citizen',
          actorRole: 'CITIZEN',
          eventType: 'CASE_CREATED',
          previousState: null,
          newState: 'SUBMITTED',
          message: `${c.title} registered by citizen.`,
          isInternal: false,
          timestamp: new Date(Date.now() - 6 * 3600 * 1000),
        },
      ]);
    }

    // Seed Voluntary Blood Donors with 5-Level Geographic Distribution
    this.donors.clear();

    // Donor 1: LEVEL 1 (Same Locality - Madhapur, < 3km from Hitec City)
    this.donors.set('dnr-001', {
      _id: 'dnr-001',
      userId: citizenId,
      anonymousDonorCode: 'DONOR-HYD-1001',
      bloodGroup: 'O-',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Madhapur',
        municipality: 'Greater Hyderabad',
        subDistrict: 'Serilingampally',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        coordinates: [78.3845, 17.4483], // Madhapur center
      },
      contactPreference: 'IN_APP',
      contactPhone: '+91 9876543210',
      contactEmail: 'citizen@cpet.org',
      lastDonatedAt: new Date(Date.now() - 120 * 86400 * 1000),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donor 2: LEVEL 2 (Same Municipality / Town - Gachibowli, ~3.5km from Madhapur)
    this.donors.set('dnr-002', {
      _id: 'dnr-002',
      anonymousDonorCode: 'DONOR-HYD-1002',
      bloodGroup: 'O-',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Gachibowli',
        municipality: 'Greater Hyderabad',
        subDistrict: 'Serilingampally',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        coordinates: [78.3578, 17.4401], // Gachibowli (~3.5km)
      },
      contactPreference: 'RELAY_SMS',
      contactPhone: '+91 9876543211',
      contactEmail: 'donor2@volunteer.org',
      lastDonatedAt: new Date(Date.now() - 95 * 86400 * 1000),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donor 3: LEVEL 3 (Same Mandal / Sub-District - Serilingampally, ~10km from Madhapur)
    this.donors.set('dnr-003', {
      _id: 'dnr-003',
      anonymousDonorCode: 'DONOR-HYD-1003',
      bloodGroup: 'O-',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Tara Nagar',
        municipality: 'Serilingampally Municipality',
        subDistrict: 'Serilingampally',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500019',
        coordinates: [78.3182, 17.4851], // Serilingampally town (~10km)
      },
      contactPreference: 'IN_APP',
      contactPhone: '+91 9876543212',
      contactEmail: 'donor3@volunteer.org',
      lastDonatedAt: new Date(Date.now() - 110 * 86400 * 1000),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donor 4: LEVEL 4 (Same District - Secunderabad, ~16km from Madhapur)
    this.donors.set('dnr-004', {
      _id: 'dnr-004',
      anonymousDonorCode: 'DONOR-HYD-1004',
      bloodGroup: 'O-',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Secunderabad Cantt',
        municipality: 'Secunderabad',
        subDistrict: 'Secunderabad Mandal',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500003',
        coordinates: [78.501, 17.4399], // Secunderabad (~16km)
      },
      contactPreference: 'ANONYMOUS_PROXY',
      contactPhone: '+91 9876543213',
      contactEmail: 'donor4@volunteer.org',
      lastDonatedAt: new Date(Date.now() - 150 * 86400 * 1000),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donor 5: LEVEL 5 (Same State - Warangal Urban, ~140km from Madhapur)
    this.donors.set('dnr-005', {
      _id: 'dnr-005',
      anonymousDonorCode: 'DONOR-WGL-1005',
      bloodGroup: 'O-',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Hanamkonda',
        municipality: 'Warangal',
        subDistrict: 'Warangal Mandal',
        district: 'Warangal Urban',
        state: 'Telangana',
        pincode: '506001',
        coordinates: [79.5941, 17.9689], // Warangal (~140km)
      },
      contactPreference: 'PHONE',
      contactPhone: '+91 9876543214',
      contactEmail: 'donor5@volunteer.org',
      lastDonatedAt: new Date(Date.now() - 180 * 86400 * 1000),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donors for other groups (O+, A+, B+, AB+)
    this.donors.set('dnr-006', {
      _id: 'dnr-006',
      anonymousDonorCode: 'DONOR-HYD-1006',
      bloodGroup: 'O+',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Madhapur',
        municipality: 'Greater Hyderabad',
        subDistrict: 'Serilingampally',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        coordinates: [78.3845, 17.4483],
      },
      contactPreference: 'IN_APP',
      contactPhone: '+91 9876543215',
      contactEmail: 'donor6@volunteer.org',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.donors.set('dnr-007', {
      _id: 'dnr-007',
      anonymousDonorCode: 'DONOR-HYD-1007',
      bloodGroup: 'A+',
      availabilityStatus: 'AVAILABLE',
      approximateLocation: {
        locality: 'Kukatpally',
        municipality: 'Greater Hyderabad',
        subDistrict: 'Kukatpally',
        district: 'Medchal-Malkajgiri',
        state: 'Telangana',
        pincode: '500072',
        coordinates: [78.4111, 17.4849],
      },
      contactPreference: 'IN_APP',
      contactPhone: '+91 9876543216',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Global Default SLA & Escalation Policy
    this.slaPolicies.set('sla-policy-global-default', {
      _id: 'sla-policy-global-default',
      name: 'Global Standard SLA & Multi-Tier Escalation Policy',
      organizationId: null,
      caseType: null,
      priority: 'MEDIUM',
      acknowledgementHours: 4,
      firstResponseHours: 8,
      resolutionHours: 48,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00',
        timezone: 'Asia/Kolkata',
        workingDays: [1, 2, 3, 4, 5],
      },
      holidays: ['2026-01-26', '2026-08-15', '2026-10-02'],
      escalationPolicy: {
        enabled: true,
        tiers: [
          {
            level: 1,
            tierName: 'Tier 1: Frontline Operations Desk',
            triggerAfterBreachMinutes: 0,
            assignDepartment: 'General Operations',
            escalationReason: 'Acknowledgement or Initial Resolution SLA breached.',
          },
          {
            level: 2,
            tierName: 'Tier 2: Senior Engineering & Supervisor Desk',
            triggerAfterBreachMinutes: 120,
            assignDepartment: 'Senior Engineering & Grievances',
            escalationReason: 'Continued non-resolution after 2 hours; escalated to supervisor.',
          },
          {
            level: 3,
            tierName: 'Tier 3: District Ombudsman & Regulatory Officer',
            triggerAfterBreachMinutes: 360,
            assignDepartment: 'District Oversight Cell',
            escalationReason: 'Escalated to District Ombudsman Authority.',
          },
          {
            level: 4,
            tierName: 'Tier 4: State Public Grievance Directorate',
            triggerAfterBreachMinutes: 720,
            assignDepartment: 'State Regulatory Commission',
            escalationReason: 'Critical escalation to State Consumer & Grievance Directorate.',
          },
        ],
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Blood Emergency 24x7 SLA Policy
    this.slaPolicies.set('sla-policy-blood-emergency', {
      _id: 'sla-policy-blood-emergency',
      name: 'Emergency Healthcare & Blood Requirement SLA Policy',
      organizationId: null,
      caseType: 'BLOOD_REQUEST',
      priority: 'URGENT',
      acknowledgementHours: 0.5,
      firstResponseHours: 1,
      resolutionHours: 6,
      businessHours: {
        enabled: false, // 24x7 immediate emergency response
        start: '00:00',
        end: '23:59',
        timezone: 'Asia/Kolkata',
        workingDays: [0, 1, 2, 3, 4, 5, 6],
      },
      escalationPolicy: {
        enabled: true,
        tiers: [
          {
            level: 1,
            tierName: 'Tier 1: Blood Bank Emergency Dispatcher',
            triggerAfterBreachMinutes: 0,
            assignDepartment: 'Emergency Blood & Donor Coordination',
            escalationReason: 'Urgent blood requirement acknowledged for immediate dispatch.',
          },
          {
            level: 2,
            tierName: 'Tier 2: Senior Trauma Care & Critical Lead',
            triggerAfterBreachMinutes: 30,
            assignDepartment: 'Trauma ICU Coordination',
            escalationReason: 'High priority blood supply escalation to Trauma Director.',
          },
        ],
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Lloyd Organization Custom SLA Policy
    this.slaPolicies.set('sla-policy-lloyd', {
      _id: 'sla-policy-lloyd',
      name: 'Lloyd Consumer Care & AC Service SLA Policy',
      organizationId: '66d000000000000000000030',
      caseType: 'SERVICE_REQUEST',
      priority: 'HIGH',
      acknowledgementHours: 2,
      firstResponseHours: 4,
      resolutionHours: 24,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '19:00',
        timezone: 'Asia/Kolkata',
        workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
      },
      escalationPolicy: {
        enabled: true,
        tiers: [
          {
            level: 1,
            tierName: 'Tier 1: Technical Field Service & AC Care',
            triggerAfterBreachMinutes: 0,
            assignDepartment: 'DEP-LLD-TECH',
            escalationReason: 'Service window opened; assigned to frontline AC technician.',
          },
          {
            level: 2,
            tierName: 'Tier 2: Consumer Grievance & Escalations Desk',
            triggerAfterBreachMinutes: 60,
            assignDepartment: 'DEP-LLD-GRIEVANCE',
            escalationReason: 'Technician dispatch delayed; escalated to Consumer Grievance Desk.',
          },
        ],
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Forms (Public & Organization-Created Forms)
    this.seedForms();
  }

  private seedForms() {
    const orgApexId = '66d000000000000000000010';
    const orgLloydId = '66d000000000000000000030';
    const orgSamsungId = '66d000000000000000000040';
    const orgRedCrossId = '66d000000000000000000050';

    // 1. PUBLIC: Civic Road Hazard & Pothole Grievance
    this.forms.set('form-pub-01', {
      _id: 'form-pub-01',
      organizationId: null,
      organizationName: 'Municipal Civic Authority',
      title: 'Civic Road Hazard & Pothole Repair Request',
      slug: 'civic-road-hazard-pothole',
      description: 'Report dangerous road potholes, open manholes, damaged dividers, or street light failures for urgent municipal repair.',
      category: 'Municipal & Civic Services',
      department: 'Roads & Infrastructure Engineering',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 24,
      priority: 'HIGH',
      submitButtonText: 'Submit Municipal Road Request',
      successMessage: 'Your civic road grievance has been registered. Field engineer team has been scheduled.',
      submissionsCount: 18,
      publishedAt: new Date(),
      fields: [
        { id: 'f-1', name: 'hazardType', label: 'Hazard Category', type: 'select', options: ['Deep Pothole / Crater', 'Uncovered Manhole', 'Broken Divider / Signage', 'Waterlogged Road Section', 'Defective Streetlight Grid'], required: true, order: 1 },
        { id: 'f-2', name: 'locationAddress', label: 'Exact Landmark & Street Location', type: 'location', placeholder: 'e.g., Near Signal 4, Outer Ring Road, Ward 12', required: true, order: 2 },
        { id: 'f-3', name: 'severity', label: 'Traffic & Hazard Severity', type: 'radio', options: ['Critical (High Accident Risk)', 'Moderate (Slows Traffic)', 'Minor'], required: true, order: 3 },
        { id: 'f-4', name: 'description', label: 'Detailed Description of Damage', type: 'textarea', placeholder: 'Describe dimensions, water presence, recent accidents or vehicle damages observed...', required: true, order: 4 },
        { id: 'f-5', name: 'photoProof', label: 'Upload Site Photo / Video Evidence', type: 'file', helpText: 'Attach clear picture of pothole or hazard', required: false, order: 5 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. PUBLIC: Municipal Water Quality & Supply Grievance
    this.forms.set('form-pub-02', {
      _id: 'form-pub-02',
      organizationId: orgApexId,
      organizationName: 'Apex Power & Water',
      title: 'Municipal Water Supply & Contamination Grievance',
      slug: 'water-supply-contamination-grievance',
      description: 'Submit reports for muddy/contaminated tap water, low pipeline pressure, pipeline burst, or unannounced supply stoppage.',
      category: 'Public Utilities',
      department: 'Municipal Water & Sanitation',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 12,
      priority: 'URGENT',
      submitButtonText: 'Dispatch Water Response Unit',
      successMessage: 'Water emergency grievance registered. Water quality inspection crew notified.',
      submissionsCount: 34,
      publishedAt: new Date(),
      fields: [
        { id: 'f-w1', name: 'waterIssue', label: 'Nature of Water Problem', type: 'select', options: ['Discolored / Muddy Water', 'Foul Odor / Chemical Smell', 'Complete Supply Outage', 'Low Pressure / No Flow', 'Main Pipeline Leakage in Street'], required: true, order: 1 },
        { id: 'f-w2', name: 'houseId', label: 'Consumer CAN / Meter Number (if known)', type: 'text', placeholder: 'e.g., WTR-8849102', required: false, order: 2 },
        { id: 'f-w3', name: 'durationHours', label: 'Hours since issue started', type: 'number', placeholder: 'e.g. 6', required: true, order: 3 },
        { id: 'f-w4', name: 'locality', label: 'Colony / Area / Ward', type: 'text', placeholder: 'e.g. Hitec City Layout Phase 2', required: true, order: 4 },
        { id: 'f-w5', name: 'remarks', label: 'Additional Observations', type: 'textarea', placeholder: 'Specify if neighboring houses are also affected...', required: false, order: 5 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. PUBLIC: Banking Ombudsman & Financial Dispute
    this.forms.set('form-pub-03', {
      _id: 'form-pub-03',
      organizationId: null,
      organizationName: 'National Banking & Financial Ombudsman',
      title: 'Banking Ombudsman ATM & UPI Dispute Escalation',
      slug: 'banking-ombudsman-dispute',
      description: 'Official statutory form to lodge grievance for failed ATM cash dispense, unauthorized UPI deduction, card skimming, or bank refusal to reverse charges.',
      category: 'Banking & Financial Redressal',
      department: 'Ombudsman Dispute Resolution Desk',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 48,
      priority: 'HIGH',
      submitButtonText: 'Lodge Ombudsman Case',
      successMessage: 'Your banking dispute has been submitted to the RBI Banking Ombudsman nodal cell.',
      submissionsCount: 42,
      publishedAt: new Date(),
      fields: [
        { id: 'f-b1', name: 'bankName', label: 'Bank / Institution Name', type: 'select', options: ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Other Scheduled Bank'], required: true, order: 1 },
        { id: 'f-b2', name: 'disputeType', label: 'Type of Transaction Dispute', type: 'select', options: ['ATM Cash Dispense Failure (Account Debited)', 'UPI Transaction Failed but Debited', 'Unauthorized Fraudulent Debit / Phishing', 'Loan Foreclosure Dispute / Hidden Charges', 'Excessive Interest Overcharge'], required: true, order: 2 },
        { id: 'f-b3', name: 'transactionRef', label: 'Bank UTR / Transaction Reference Number', type: 'text', placeholder: 'e.g. UPI/1234567890/SBI', required: true, order: 3 },
        { id: 'f-b4', name: 'disputedAmount', label: 'Disputed Amount (INR ₹)', type: 'number', placeholder: 'e.g. 15000', required: true, order: 4 },
        { id: 'f-b5', name: 'complaintSummary', label: 'Details of Dispute & Bank Branch Response', type: 'textarea', placeholder: 'State transaction date, time, branch visited, and why initial bank support failed to resolve...', required: true, order: 5 },
        { id: 'f-b6', name: 'bankStatement', label: 'Upload Bank Statement / SMS Screenshot', type: 'file', required: false, order: 6 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. ORGANIZATION FORM: Apex Power High Voltage Meter Replacement
    this.forms.set('form-org-apex-01', {
      _id: 'form-org-apex-01',
      organizationId: orgApexId,
      organizationName: 'Apex Power & Water',
      title: 'High Voltage Energy Meter Replacement & Load Sanction',
      slug: 'apex-meter-replacement-load-sanction',
      description: 'Official form created by Apex Power for residential and commercial customers requesting smart energy meter calibration, digital meter upgrades, or 3-phase load extension.',
      category: 'Public Utilities',
      department: 'Commercial Metering & Billing',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 36,
      priority: 'MEDIUM',
      submitButtonText: 'Submit Apex Meter Application',
      successMessage: 'Apex metering ticket created. Our certified grid technician will coordinate inspection.',
      submissionsCount: 15,
      publishedAt: new Date(),
      fields: [
        { id: 'f-ap1', name: 'consumerNumber', label: 'Apex Service Connection No. (SC No.)', type: 'text', placeholder: 'e.g. APX-992014', required: true, order: 1 },
        { id: 'f-ap2', name: 'requestReason', label: 'Request Purpose', type: 'select', options: ['Faulty / Burnt Meter Replacement', 'Upgrade to Smart Prepaid / Net-Meter', 'Load Extension (3-Phase Conversion)', 'Meter Relocation on Building Premises', 'Fast Meter Testing & Calibration'], required: true, order: 2 },
        { id: 'f-ap3', name: 'currentConnectedLoad', label: 'Current Connected Load (kW)', type: 'number', placeholder: 'e.g. 5', required: true, order: 3 },
        { id: 'f-ap4', name: 'proposedLoad', label: 'Requested New Load (kW)', type: 'number', placeholder: 'e.g. 10', required: false, order: 4 },
        { id: 'f-ap5', name: 'siteAddress', label: 'Installation Address & Landmark', type: 'location', placeholder: 'Complete premises address with postal code', required: true, order: 5 },
        { id: 'f-ap6', name: 'propertyProof', label: 'Upload Ownership / Electricity Bill Copy', type: 'file', required: false, order: 6 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. ORGANIZATION FORM: Lloyd Care - AC Service & Warranty Claim Form
    this.forms.set('form-org-lloyd-01', {
      _id: 'form-org-lloyd-01',
      organizationId: orgLloydId,
      organizationName: 'Lloyd (Havells Consumer Appliances)',
      title: 'Lloyd AC Service, Gas Leak & Warranty Repair Booking',
      slug: 'lloyd-ac-service-warranty-repair',
      description: 'Direct customer portal form created by Lloyd Customer Care to schedule home technician visits for AC breakdown, compressor fault, cooling issues, or warranty repairs.',
      category: 'Consumer Goods',
      department: 'Technical Field Service & AC Care',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 24,
      priority: 'HIGH',
      submitButtonText: 'Book Lloyd Authorized Technician',
      successMessage: 'Lloyd service ticket initiated! Field technician will call to confirm appointment time.',
      submissionsCount: 29,
      publishedAt: new Date(),
      fields: [
        { id: 'f-l1', name: 'acModel', label: 'Lloyd AC Model / Tonnage', type: 'select', options: ['1.5 Ton 5-Star Inverter Split AC', '1.0 Ton 3-Star Split AC', '2.0 Ton Heavy Duty Split AC', 'Window AC 1.5 Ton', 'Commercial Cassette AC'], required: true, order: 1 },
        { id: 'f-l2', name: 'serialNumber', label: 'Outdoor/Indoor Unit Serial Number', type: 'text', placeholder: 'e.g. LLD-2024-IN8841', required: false, order: 2 },
        { id: 'f-l3', name: 'faultType', label: 'Issue Reported', type: 'select', options: ['No Cooling / Low Gas Pressure', 'Water Dripping from Indoor Unit', 'Compressor Making Loud Noise', 'Display Error Code (E1/E2/F3)', 'Periodic Wet Service & Filter Cleaning', 'Complete Dead / No Power'], required: true, order: 3 },
        { id: 'f-l4', name: 'warrantyStatus', label: 'Warranty Coverage Status', type: 'radio', options: ['Within 1-Year Comprehensive Warranty', 'Within 5-Year Compressor Warranty', 'Out of Warranty (Standard Rates Apply)', 'Under Extended Care AMC'], required: true, order: 4 },
        { id: 'f-l5', name: 'preferredDate', label: 'Preferred Technician Visit Date', type: 'date', required: true, order: 5 },
        { id: 'f-l6', name: 'customerNotes', label: 'Special Instructions / Access Timings', type: 'textarea', placeholder: 'e.g., Gate key at security, please visit after 2 PM', required: false, order: 6 },
        { id: 'f-l7', name: 'invoiceCopy', label: 'Upload Purchase Invoice (for free warranty claims)', type: 'file', required: false, order: 7 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. ORGANIZATION FORM: Samsung Digital Diagnostics Form
    this.forms.set('form-org-samsung-01', {
      _id: 'form-org-samsung-01',
      organizationId: orgSamsungId,
      organizationName: 'Samsung India Electronics',
      title: 'Samsung Smart Care Diagnostic & Field Service Request',
      slug: 'samsung-smart-care-service-request',
      description: 'Official intake form for Samsung home appliances including Refrigerators, Washing Machines, and Smart Inverter ACs.',
      category: 'Consumer Goods',
      department: 'Samsung Technical Care & HVAC Support',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 24,
      priority: 'MEDIUM',
      submitButtonText: 'Schedule Samsung Expert Visit',
      successMessage: 'Samsung service request generated. Service engineer allocated under SmartPlaza network.',
      submissionsCount: 19,
      publishedAt: new Date(),
      fields: [
        { id: 'f-s1', name: 'productCategory', label: 'Samsung Product Type', type: 'select', options: ['Samsung Split AC (WindFree / Digital Inverter)', 'Samsung Refrigerator (Double Door / French Door)', 'Samsung EcoBubble Washing Machine', 'Samsung Smart TV (QLED / Neo QLED)', 'Samsung Microwave Oven'], required: true, order: 1 },
        { id: 'f-s2', name: 'symptom', label: 'Observed Fault Description', type: 'textarea', placeholder: 'Explain specific symptom, noise, or error code...', required: true, order: 2 },
        { id: 'f-s3', name: 'address', label: 'Service Location Address', type: 'location', placeholder: 'Door No, Street, Landmark, Pin code', required: true, order: 3 },
        { id: 'f-s4', name: 'preferredSlot', label: 'Preferred Time Window', type: 'select', options: ['Morning (10:00 AM - 01:00 PM)', 'Afternoon (01:00 PM - 04:00 PM)', 'Evening (04:00 PM - 07:00 PM)'], required: true, order: 4 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. ORGANIZATION FORM: Red Cross Blood Center SOS Dispatch Form
    this.forms.set('form-org-redcross-01', {
      _id: 'form-org-redcross-01',
      organizationId: orgRedCrossId,
      organizationName: 'Red Cross Blood Center & Trauma Care',
      title: 'Emergency Blood & Platelet Unit Reservation Form',
      slug: 'red-cross-emergency-blood-reservation',
      description: 'Hospital & Patient SOS form for direct reserve and dispatch of tested whole blood, PRBC, FFP, or single donor platelets.',
      category: 'Healthcare SOS',
      department: 'Emergency Blood & Donor Coordination',
      isPublic: true,
      status: 'PUBLISHED',
      slaHours: 4,
      priority: 'URGENT',
      submitButtonText: 'Dispatch Emergency Blood Request',
      successMessage: 'Emergency blood reservation received! Duty doctor and dispatch center alerted immediately.',
      submissionsCount: 52,
      publishedAt: new Date(),
      fields: [
        { id: 'f-rc1', name: 'bloodGroup', label: 'Required Blood Group', type: 'select', options: ['O Positive (O+)', 'O Negative (O-)', 'A Positive (A+)', 'A Negative (A-)', 'B Positive (B+)', 'B Negative (B-)', 'AB Positive (AB+)', 'AB Negative (AB-)', 'Rare Bombay Phenotype'], required: true, order: 1 },
        { id: 'f-rc2', name: 'componentType', label: 'Blood Component Needed', type: 'select', options: ['Packed Red Blood Cells (PRBC)', 'Fresh Frozen Plasma (FFP)', 'Single Donor Platelets (SDP)', 'Whole Blood Unit', 'Cryoprecipitate'], required: true, order: 2 },
        { id: 'f-rc3', name: 'unitsRequired', label: 'Number of Units', type: 'number', placeholder: 'e.g. 2', required: true, order: 3 },
        { id: 'f-rc4', name: 'hospitalName', label: 'Admitted Hospital & ICU Bed / Ward No', type: 'text', placeholder: 'e.g. Apollo Hospitals, ICU Bed #12, Jubilee Hills', required: true, order: 4 },
        { id: 'f-rc5', name: 'urgencyLevel', label: 'Clinical Urgency', type: 'radio', options: ['Immediate / Active Surgery (within 2 hrs)', 'Urgent (within 6 hrs)', 'Elective / Scheduled for tomorrow'], required: true, order: 5 },
        { id: 'f-rc6', name: 'doctorRequisition', label: 'Doctor Requisition Slip / Hospital Form', type: 'file', helpText: 'Upload signed requisition note for expedited cross-matching', required: false, order: 6 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public isDbConnected(): boolean {
    return (
      mongoose.connection.readyState === 1 ||
      Boolean((UserModel.findOne as any)?._isMockFunction) ||
      Boolean((UserModel.findById as any)?._isMockFunction)
    );
  }
}

export const memoryStore = new MemoryStore();
