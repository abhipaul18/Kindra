export type VerificationDecisionStatus =
  | 'pending'
  | 'auto_verified'
  | 'verified_low_confidence'
  | 'manual_review_required'
  | 'auto_rejected'
  | 'manual_approved'
  | 'manual_rejected';

export type CivicCategory =
  | 'Tree Plantation'
  | 'Water Conservation'
  | 'Garbage Cleanup'
  | 'Recycling'
  | 'Blood Donation'
  | 'Medicine Donation'
  | 'Food Donation'
  | 'Book Donation'
  | 'Volunteer Teaching'
  | 'Animal Feeding'
  | 'Animal Rescue'
  | 'NGO Volunteering'
  | 'Community Events'
  | 'Disaster Relief'
  | 'Government Assistance'
  | 'Road Damage'
  | 'Streetlight Failure'
  | 'Water Leakage'
  | 'Sewage'
  | 'Public Safety'
  | 'Heritage Conservation'
  | 'Digital Public Service'
  | 'Other Civic Contribution';

export interface MultimodalIngestPayload {
  submissionId?: string;
  reportId?: string;
  selectedMissionId?: string;
  expectedActivity?: string;
  userId: string;
  title: string;
  notes?: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  videoUrl?: string;
  voiceNoteUrl?: string;
  gps?: {
    currentLat: number;
    currentLng: number;
    uploadLat?: number;
    uploadLng?: number;
    missionLat?: number;
    missionLng?: number;
    altitude?: number;
    accuracy?: number;
  };
  timestamp?: string;
  deviceMetadata?: {
    deviceModel?: string;
    operatingSystem?: string;
    appVersion?: string;
    captureSource?: 'camera_live' | 'gallery_upload' | 'file_import';
  };
}

export interface ClassificationResult {
  category: CivicCategory;
  subcategory: string;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  detectedObjects: string[];
}

export interface VisionAnalysisResult {
  environment: {
    trees: boolean;
    plants: boolean;
    garbage: boolean;
    plastic: boolean;
    roads: boolean;
    buildings: boolean;
    rivers: boolean;
    lakes: boolean;
    publicInfrastructure: boolean;
    tags: string[];
  };
  humans: {
    volunteers: boolean;
    children: boolean;
    elderly: boolean;
    medicalStaff: boolean;
    count: number;
  };
  animals: {
    dogs: boolean;
    cats: boolean;
    birds: boolean;
    cattle: boolean;
    wildlife: boolean;
    detected: string[];
  };
  healthcare: {
    bloodDonationCard: boolean;
    hospitalSetting: boolean;
    medicalCamp: boolean;
  };
  education: {
    books: boolean;
    schoolSetting: boolean;
    teachers: boolean;
  };
  govtAssets: {
    streetlights: boolean;
    roadDamage: boolean;
    drainage: boolean;
    trafficSignals: boolean;
  };
  beforeAfterComparison?: {
    hasBothImages: boolean;
    improvementPercentage: number;
    notes: string;
  };
  detectedObjects: string[];
}

export interface GPSValidationResult {
  currentGps: { lat: number; lng: number };
  uploadGps?: { lat: number; lng: number };
  missionGps?: { lat: number; lng: number };
  isWithinGeofence: boolean;
  distanceFromMissionMeters: number;
  travelPathValid: boolean;
  isSpoofed: boolean;
  confidence: number;
  reasoning: string;
}

export interface OCRResultPayload {
  documentType: 'donation_receipt' | 'blood_card' | 'govt_document' | 'certificate' | 'hospital_document' | 'qr_code' | 'unknown';
  extractedText: string;
  structuredFields: {
    donorName?: string;
    institution?: string;
    date?: string;
    amountOrUnit?: string;
    documentNumber?: string;
    qrData?: string;
  };
  isAuthentic: boolean;
  confidence: number;
  reasoning: string;
}

export interface FraudDetectionResult {
  fraudScore: number; // 0.0 to 100.0
  isDuplicate: boolean;
  perceptualHash: string;
  matchedSubmissionId?: string;
  isAiGenerated: boolean;
  isEditedOrTampered: boolean;
  metadataTamperFlag: boolean;
  timestampMismatchFlag: boolean;
  isFakeGps: boolean;
  isInternetStockPhoto: boolean;
  isScreenshot: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning: string;
}

export interface ImpactScoreResult {
  environmentalScore: number; // 0-100
  communityScore: number; // 0-100
  urgencyRating: number; // 0-100
  difficultyRating: number; // 0-100
  volunteerHours: number;
  beneficiariesCount: number;
  socialValueScore: number; // 0-100
  totalImpactScore: number; // 0-100
}

export interface KarmaEvaluationResult {
  baselineKarma: number;
  impactMultiplier: number;
  difficultyMultiplier: number;
  confidenceMultiplier: number;
  repeatParticipationBonus: number;
  communityNeedMultiplier: number;
  finalKarmaAwarded: number;
  reasoning: string;
}

export interface SmartRoutingResult {
  destinationDepartment: string;
  routingTargetEntity: 'PWD' | 'Municipality' | 'Electricity Department' | 'Animal Welfare NGO' | 'Hospital' | 'NGO' | 'Water Board' | 'General Civic Authority';
  routingReasoning: string;
}

export interface AISummariesResult {
  executiveSummary: string;
  citizenSummary: string;
  officerSummary: string;
  ngoSummary: string;
}

export interface VerificationDecisionResult {
  status: VerificationDecisionStatus;
  confidenceScore: number;
  missionMatch: boolean;
  expectedActivity: string;
  detectedActivity: string;
  requiresManualReview: boolean;
  autoRejected: boolean;
  decisionReasoning: string;
  rejectionReason?: string;
  suggestedAction?: string;
  apiError?: {
    statusCode: number;
    statusText: string;
    endpoint: string;
    model: string;
    message: string;
  };
}

export interface CompleteVerificationPipelineOutput {
  id: string;
  timestamp: string;
  payload: MultimodalIngestPayload;
  classification: ClassificationResult;
  vision: VisionAnalysisResult;
  gps: GPSValidationResult;
  ocr: OCRResultPayload;
  fraud: FraudDetectionResult;
  impact: ImpactScoreResult;
  karma: KarmaEvaluationResult;
  routing: SmartRoutingResult;
  summaries: AISummariesResult;
  decision: VerificationDecisionResult;
  auditTrail: {
    stage: string;
    completedAt: string;
    notes?: string;
  }[];
}
