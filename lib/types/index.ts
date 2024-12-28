export enum Role {
  ADMIN = "SUPER_ADMIN",
  USER = "DEFAULT_USER",
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  candidates?: Candidate[];
  votes?: Vote[];
}

export interface Vote {
  id: string;
  userId: string;
  eventId: string;
  candidateId: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Candidate {
  id: string;
  eventId: number;
  name: string;
  position: string;
  photo: string;
  sequence: number;
  visi: string;
  misi: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CandidatePair {
  chairman: Candidate;
  viceChairman: Candidate;
}

export interface EventDetailProps {
  event: Event;
  candidates: CandidatePair[];
  paginatorInfo?: PaginatorInfo;
}

export interface PaginatorInfo {
  skip: number;
  limit: number;
  currentPage: number;
  pages: number;
  hasNextPage: boolean;
  totalRecords: number;
  pageSize: number;
}
