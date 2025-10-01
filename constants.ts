import { DepartmentId, DrapeType, type OperatingRoom, type Department, type Surgery } from './types';

export const DEPARTMENTS: readonly Department[] = [
  { id: DepartmentId.ORTHOPEDICS, name: 'Chấn Thương Chỉnh Hình', color: 'bg-blue-500', textColor: 'text-white' },
  { id: DepartmentId.GENERAL, name: 'Tổng Quát', color: 'bg-yellow-500', textColor: 'text-white' },
  { id: DepartmentId.NEURO, name: 'Ngoại Thần Kinh', color: 'bg-purple-500', textColor: 'text-white' },
  { id: DepartmentId.CARDIO, name: 'Tim Mạch', color: 'bg-red-500', textColor: 'text-white' },
  { id: DepartmentId.UROLOGY, name: 'Tiết Niệu', color: 'bg-green-500', textColor: 'text-white' },
];

export const OPERATING_ROOMS: readonly OperatingRoom[] = [
  { id: 1, name: 'Phòng Mổ 1', color: 'bg-sky-600', textColor: 'text-white' },
  { id: 2, name: 'Phòng Mổ 2', color: 'bg-indigo-600', textColor: 'text-white' },
  { id: 3, name: 'Phòng Mổ 3', color: 'bg-violet-600', textColor: 'text-white' },
  { id: 4, name: 'Phòng Mổ 4', color: 'bg-fuchsia-600', textColor: 'text-white' },
  { id: 5, name: 'Phòng Mổ 5', color: 'bg-rose-600', textColor: 'text-white' },
  { id: 6, name: 'Phòng Mổ 6', color: 'bg-amber-600', textColor: 'text-white' },
  { id: 7, name: 'Phòng Mổ 7', color: 'bg-lime-600', textColor: 'text-white' },
  { id: 8, name: 'Phòng Mổ 8', color: 'bg-emerald-600', textColor: 'text-white' },
  { id: 9, name: 'Phòng Mổ 9', color: 'bg-teal-600', textColor: 'text-white' },
  { id: 10, name: 'Phòng Mổ 10', color: 'bg-cyan-600', textColor: 'text-white' },
];

export const DRAPE_TYPES = Object.values(DrapeType);

const today = new Date().toISOString().split('T')[0];

export const INITIAL_SURGERIES: Surgery[] = [
  { id: 1, patientName: 'Nguyễn Văn A', patientAge: 45, diagnosis: 'Gãy xương đùi', procedure: 'Nẹp vít xương đùi', surgeon: 'BS. Tuấn', department: DepartmentId.ORTHOPEDICS, date: today, startTime: '08:00', endTime: '10:30', roomId: 1, specialRequirements: ['C-Arm'], drapeType: DrapeType.DAI_PHAU },
  { id: 2, patientName: 'Trần Thị B', patientAge: 60, diagnosis: 'Viêm ruột thừa', procedure: 'Cắt ruột thừa nội soi', surgeon: 'BS. Lan', department: DepartmentId.GENERAL, date: today, startTime: '09:00', endTime: '10:00', roomId: 2, specialRequirements: [], drapeType: DrapeType.TRUNG_PHAU },
  { id: 3, patientName: 'Lê Văn C', patientAge: 55, diagnosis: 'U não', procedure: 'Phẫu thuật u não', surgeon: 'BS. Hùng', department: DepartmentId.NEURO, date: today, startTime: '08:30', endTime: '13:00', roomId: 3, specialRequirements: ['Kính hiển vi'], drapeType: DrapeType.DAI_PHAU },
  { id: 4, patientName: 'Phạm Thị D', patientAge: 72, diagnosis: 'Hẹp van động mạch chủ', procedure: 'Thay van động mạch chủ', surgeon: 'BS. Tuấn', department: DepartmentId.CARDIO, date: today, startTime: '11:00', endTime: '15:00', roomId: 1, specialRequirements: ['Máy tuần hoàn ngoài cơ thể'], drapeType: DrapeType.DAI_PHAU },
  { id: 5, patientName: 'Vũ Văn E', patientAge: 30, diagnosis: 'Sỏi thận', procedure: 'Tán sỏi qua da', surgeon: 'BS. Minh', department: DepartmentId.UROLOGY, date: today, startTime: '10:30', endTime: '12:00', roomId: 2, specialRequirements: [], drapeType: DrapeType.SANG_LO },
  { id: 6, patientName: 'Hồ Thị F', patientAge: 25, diagnosis: 'Thoát vị bẹn', procedure: 'Phẫu thuật thoát vị bẹn', surgeon: 'BS. Lan', department: DepartmentId.GENERAL, date: today, startTime: '14:00', endTime: '15:30', roomId: 4, specialRequirements: [], drapeType: DrapeType.TRUNG_PHAU },
  { id: 7, patientName: 'Đặng Văn G', patientAge: 68, diagnosis: 'Thay khớp gối', procedure: 'Thay toàn bộ khớp gối', surgeon: 'BS. An', department: DepartmentId.ORTHOPEDICS, date: today, startTime: '13:30', endTime: '16:00', roomId: 5, specialRequirements: [], drapeType: DrapeType.DAI_PHAU },
  { id: 8, patientName: 'Hoàng Thị H', patientAge: 50, diagnosis: 'U tuyến giáp', procedure: 'Cắt tuyến giáp', surgeon: 'BS. Dũng', department: DepartmentId.GENERAL, date: today, startTime: '16:00', endTime: '17:30', roomId: 2, specialRequirements: [], drapeType: 'Khác', drapeOther: 'Săng cổ' },
  { id: 9, patientName: 'Nguyễn Văn K', patientAge: 42, diagnosis: 'Yêu cầu mổ', procedure: 'Chưa xác định', surgeon: 'BS. An', department: DepartmentId.ORTHOPEDICS, date: today, startTime: '00:00', endTime: '00:00', roomId: null, specialRequirements: ['Cần xếp lịch'], drapeType: null },
];

export const GANTT_START_HOUR = 7;
export const GANTT_END_HOUR = 19;
export const GANTT_TOTAL_HOURS = GANTT_END_HOUR - GANTT_START_HOUR;
export const PIXELS_PER_MINUTE = 3;
export const GANTT_ROW_HEIGHT = 80; // Corresponds to h-20