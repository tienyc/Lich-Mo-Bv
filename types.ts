export enum DepartmentId {
  ORTHOPEDICS = 'Chấn Thương Chỉnh Hình',
  GENERAL = 'Tổng Quát',
  NEURO = 'Ngoại Thần Kinh',
  CARDIO = 'Tim Mạch',
  UROLOGY = 'Tiết Niệu',
}

export enum ViewMode {
  ROOM = 'Lịch Phòng Mổ',
  DEPARTMENT = 'Xem theo Khoa',
  ROOM_LIST = 'Xem theo Phòng Mổ',
  DRAPE_COUNT = 'Số lượng săng',
}

export enum DrapeType {
  TRUNG_PHAU = 'Trung phẫu',
  DAI_PHAU = 'Đại phẫu',
  SANG_LO = 'Săng lổ',
}

export type TimeScale = 'all' | 'morning' | 'afternoon';

export interface Surgery {
  id: number;
  patientName: string;
  patientAge: number;
  diagnosis: string;
  procedure: string;
  surgeon: string;
  department: DepartmentId;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  roomId: number | null;
  specialRequirements: string[];
  isConflicting?: boolean;
  drapeType: DrapeType | 'Khác' | null;
  drapeOther?: string;
}

export interface OperatingRoom {
  id: number;
  name: string;
  color: string;
  textColor: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  color: string;
  textColor: string;
}