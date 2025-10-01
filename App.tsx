import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DepartmentId, ViewMode, DrapeType, type Surgery, type OperatingRoom, type Department, type TimeScale } from './types';
import { DEPARTMENTS, OPERATING_ROOMS, INITIAL_SURGERIES, DRAPE_TYPES, GANTT_START_HOUR, GANTT_END_HOUR, GANTT_TOTAL_HOURS, PIXELS_PER_MINUTE, GANTT_ROW_HEIGHT } from './constants';

// --- UTILITY FUNCTIONS ---
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const totalMinutes = Math.round(minutes);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const roundToNearest5 = (minutes: number): number => {
    return Math.round(minutes / 5) * 5;
}

const getDepartmentInfo = (deptId: DepartmentId): Department => {
  return DEPARTMENTS.find(d => d.id === deptId) || { id: deptId, name: deptId, color: 'bg-gray-400', textColor: 'text-black'};
};

const getOperatingRoomInfo = (roomId: number): OperatingRoom | undefined => {
  return OPERATING_ROOMS.find(r => r.id === roomId);
};


const changeDate = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// --- ICON COMPONENTS ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const ConflictIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.74a3 3 0 01-2.598 4.502H4.644a3 3 0 01-2.598-4.502L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>);
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);


// --- UI COMPONENTS ---

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddSurgery: () => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
}
const Header: React.FC<HeaderProps> = ({ viewMode, onViewModeChange, onAddSurgery, currentDate, onDateChange, onPrevDay, onNextDay, timeScale, onTimeScaleChange }) => {
    const timeScaleOptions: {id: TimeScale, label: string}[] = [
        {id: 'morning', label: 'Sáng'},
        {id: 'afternoon', label: 'Chiều'},
        {id: 'all', label: 'Cả ngày'}
    ];
    
    return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center space-x-8">
        <nav className="flex items-center space-x-4">
          {(Object.values(ViewMode) as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => onViewModeChange(mode)} className={`px-2 py-2 text-sm transition-colors duration-200 border-b-2 ${viewMode === mode ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-600 hover:text-gray-800 font-medium'}`}>{mode}</button>
          ))}
        </nav>
        {viewMode === ViewMode.ROOM && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {timeScaleOptions.map(option => (
                     <button key={option.id} onClick={() => onTimeScaleChange(option.id)} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${timeScale === option.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>{option.label}</button>
                ))}
            </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
            <button onClick={onPrevDay} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeftIcon className="w-5 h-5 text-gray-600" /></button>
            <div className="relative">
                <input type="date" value={currentDate} onChange={(e) => onDateChange(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="w-5 h-5 text-gray-500" /></div>
            </div>
            <button onClick={onNextDay} className="p-2 rounded-md hover:bg-gray-200"><ChevronRightIcon className="w-5 h-5 text-gray-600" /></button>
        </div>
        <button onClick={onAddSurgery} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform duration-150 ease-in-out hover:scale-105"><PlusIcon className="w-5 h-5 mr-2" /> Thêm ca mổ</button>
      </div>
    </header>
)};

interface SurgeryBlockProps {
  surgery: Surgery;
  onDragStart: (e: React.MouseEvent<HTMLDivElement>, surgery: Surgery) => void;
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>, surgery: Surgery, direction: 'left' | 'right') => void;
  onDoubleClick: (surgery: Surgery) => void;
  ganttConfig: { pixelsPerMinute: number; ganttOffsetMinutes: number };
}
const SurgeryBlock: React.FC<SurgeryBlockProps> = ({ surgery, onDragStart, onResizeStart, onDoubleClick, ganttConfig }) => {
    const { pixelsPerMinute, ganttOffsetMinutes } = ganttConfig;
    const startMinutes = timeToMinutes(surgery.startTime);
    const endMinutes = timeToMinutes(surgery.endTime);
    const duration = endMinutes - startMinutes;
    const { color, textColor } = getDepartmentInfo(surgery.department);

    return (
      <div
        style={{ left: `${(startMinutes - ganttOffsetMinutes) * pixelsPerMinute}px`, width: `${duration * pixelsPerMinute}px` }}
        onMouseDown={(e) => onDragStart(e, surgery)}
        onDoubleClick={() => onDoubleClick(surgery)}
        className={`absolute h-full p-2 rounded-lg shadow-md flex flex-col justify-center text-xs transition-all duration-200 group ${color} ${textColor} ${surgery.isConflicting ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
        title={`${surgery.procedure} - ${surgery.patientName} (${surgery.startTime} - ${surgery.endTime})`}
      >
        <div 
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, surgery, 'left'); }}
        ></div>
        <div>
            <div className="font-bold truncate">{surgery.isConflicting && <ConflictIcon className="w-4 h-4 inline mr-1" />}{surgery.procedure}</div>
            <div className="truncate">{surgery.patientName}, {surgery.patientAge}t - {surgery.diagnosis}</div>
        </div>
         <div 
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, surgery, 'right'); }}
        ></div>
      </div>
    );
};

interface GanttChartProps {
    surgeries: Surgery[];
    onSurgeryUpdate: (surgery: Surgery) => void;
    onEditSurgery: (surgery: Surgery) => void;
    onSurgeryDrop: (surgeryId: number, newRoomId: number, newStartTime: string) => void;
    timeScale: TimeScale;
}
const GanttChart: React.FC<GanttChartProps> = ({ surgeries, onSurgeryUpdate, onEditSurgery, onSurgeryDrop, timeScale }) => {
    const ganttRef = useRef<HTMLDivElement>(null);
    const [interaction, setInteraction] = useState<{ type: 'drag' | 'resize', surgery: Surgery, initialMouseX: number, direction?: 'left' | 'right' } | null>(null);
    const ghostRef = useRef<HTMLDivElement>(null);
    const timeIndicatorRef = useRef<HTMLDivElement>(null);
    const [dragOverRoomId, setDragOverRoomId] = useState<number | null>(null);

    const ganttConfig = useMemo(() => {
        switch (timeScale) {
            case 'morning': return { startHour: 7, endHour: 13, pixelsPerMinute: PIXELS_PER_MINUTE * 2 };
            case 'afternoon': return { startHour: 13, endHour: 19, pixelsPerMinute: PIXELS_PER_MINUTE * 2 };
            default: return { startHour: GANTT_START_HOUR, endHour: GANTT_END_HOUR, pixelsPerMinute: PIXELS_PER_MINUTE };
        }
    }, [timeScale]);
    
    const { startHour, endHour, pixelsPerMinute } = ganttConfig;
    const totalHours = endHour - startHour;
    const ganttOffsetMinutes = startHour * 60;

    const visibleSurgeries = useMemo(() => surgeries.filter(s => {
        if (!s.roomId) return false;
        const start = timeToMinutes(s.startTime);
        const end = timeToMinutes(s.endTime);
        return end > startHour * 60 && start < endHour * 60;
    }), [surgeries, startHour, endHour]);


    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, surgery: Surgery, type: 'drag' | 'resize', direction?: 'left'|'right') => {
        if (e.button !== 0) return;
        e.stopPropagation();
        setInteraction({ type, surgery, initialMouseX: e.clientX, direction });
        if (ghostRef.current) {
            const rect = (e.currentTarget.closest('.absolute') as HTMLElement).getBoundingClientRect();
             ghostRef.current.style.width = `${rect.width}px`;
             ghostRef.current.innerHTML = `<div class="font-bold truncate">${surgery.procedure}</div>`;
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interaction || !ganttRef.current || !ghostRef.current || !timeIndicatorRef.current) return;
        
        const ganttRect = ganttRef.current.getBoundingClientRect();
        const { surgery, type, initialMouseX, direction } = interaction;
        
        let newStartTimeStr = surgery.startTime;
        let newEndTimeStr = surgery.endTime;
        
        const deltaX = e.clientX - initialMouseX;
        const deltaMinutes = deltaX / pixelsPerMinute;

        if (type === 'drag') {
            const initialLeft = (timeToMinutes(surgery.startTime) - ganttOffsetMinutes) * pixelsPerMinute;
            const x = initialLeft + deltaX;
            const y = e.clientY - ganttRect.top - (GANTT_ROW_HEIGHT / 2);
            
            ghostRef.current.style.transform = `translate(${x}px, ${y}px)`;
            ghostRef.current.style.display = 'block';

            timeIndicatorRef.current.style.transform = `translate(${e.clientX - ganttRect.left + 15}px, ${e.clientY - ganttRect.top + 15}px)`;
            timeIndicatorRef.current.style.display = 'block';

            const minutesFromStart = x / pixelsPerMinute;
            const totalMinutes = ganttOffsetMinutes + minutesFromStart;
            const newStartMinutes = roundToNearest5(Math.max(ganttOffsetMinutes, totalMinutes));
            const duration = timeToMinutes(surgery.endTime) - timeToMinutes(surgery.startTime);
            const newEndMinutes = newStartMinutes + duration;

            newStartTimeStr = minutesToTime(newStartMinutes);
            newEndTimeStr = minutesToTime(newEndMinutes);

        } else { // Resizing
            const startMinutes = timeToMinutes(surgery.startTime);
            const endMinutes = timeToMinutes(surgery.endTime);
            if (direction === 'left') {
                let newStartMinutes = startMinutes + deltaMinutes;
                newStartMinutes = roundToNearest5(newStartMinutes);
                newStartTimeStr = minutesToTime(Math.min(newStartMinutes, endMinutes - 15));
            } else {
                let newEndMinutes = endMinutes + deltaMinutes;
                newEndMinutes = roundToNearest5(newEndMinutes);
                newEndTimeStr = minutesToTime(Math.max(newEndMinutes, startMinutes + 15));
            }
             timeIndicatorRef.current.style.transform = `translate(${e.clientX - ganttRect.left + 15}px, ${e.clientY - ganttRect.top + 15}px)`;
             timeIndicatorRef.current.style.display = 'block';
        }
        
        timeIndicatorRef.current.textContent = `${newStartTimeStr} - ${newEndTimeStr}`;
    }, [interaction, ganttConfig]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!interaction || !ganttRef.current) return;
        
        const { surgery, type, initialMouseX, direction } = interaction;
        const ganttRect = ganttRef.current.getBoundingClientRect();
        let updatedSurgery = { ...surgery };

        const deltaX = e.clientX - initialMouseX;
        const deltaMinutes = deltaX / pixelsPerMinute;

        if (type === 'drag') {
            const yPos = e.clientY - ganttRect.top;
            const roomIndex = Math.floor(yPos / GANTT_ROW_HEIGHT);
            const newRoomId = OPERATING_ROOMS[roomIndex]?.id;

            if (newRoomId !== undefined) {
                const startMinutes = timeToMinutes(surgery.startTime);
                const duration = timeToMinutes(surgery.endTime) - startMinutes;
                let newStartMinutes = startMinutes + deltaMinutes;
                newStartMinutes = roundToNearest5(Math.max(ganttOffsetMinutes, newStartMinutes));
                
                updatedSurgery = {...updatedSurgery, roomId: newRoomId, startTime: minutesToTime(newStartMinutes), endTime: minutesToTime(newStartMinutes + duration)};
            }
        } else { // Resize
            const startMinutes = timeToMinutes(surgery.startTime);
            const endMinutes = timeToMinutes(surgery.endTime);

            if (direction === 'left') {
                let newStartMinutes = startMinutes + deltaMinutes;
                newStartMinutes = roundToNearest5(newStartMinutes);
                updatedSurgery.startTime = minutesToTime(Math.min(newStartMinutes, endMinutes - 15));
            } else {
                let newEndMinutes = endMinutes + deltaMinutes;
                newEndMinutes = roundToNearest5(newEndMinutes);
                updatedSurgery.endTime = minutesToTime(Math.max(newEndMinutes, startMinutes + 15));
            }
        }

        onSurgeryUpdate(updatedSurgery);
        setInteraction(null);
    }, [interaction, onSurgeryUpdate, ganttConfig]);
    
     useEffect(() => {
        const upHandler = (e: MouseEvent) => handleMouseUp(e);
        const moveHandler = (e: MouseEvent) => handleMouseMove(e);
        
        if (interaction) {
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        } else {
            if (ghostRef.current) ghostRef.current.style.display = 'none';
            if (timeIndicatorRef.current) timeIndicatorRef.current.style.display = 'none';
        }
        
        return () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        }
    }, [interaction, handleMouseUp, handleMouseMove]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverRoomId(null);
        if (!ganttRef.current) return;
        const surgeryId = e.dataTransfer.getData('surgery-id');
        if (!surgeryId) return;

        const ganttRect = ganttRef.current.getBoundingClientRect();
        const yPos = e.clientY - ganttRect.top;
        const xPos = e.clientX - ganttRect.left - 160; // 160 is room label width (w-40)

        const roomIndex = Math.floor(yPos / GANTT_ROW_HEIGHT);
        const newRoomId = OPERATING_ROOMS[roomIndex]?.id;

        if (newRoomId !== undefined) {
             const minutesFromStart = xPos / pixelsPerMinute;
             let totalMinutes = ganttOffsetMinutes + minutesFromStart;
             totalMinutes = roundToNearest5(totalMinutes);
             const newStartTime = minutesToTime(Math.max(ganttOffsetMinutes, totalMinutes));
             onSurgeryDrop(Number(surgeryId), newRoomId, newStartTime);
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!ganttRef.current) return;
        const ganttRect = ganttRef.current.getBoundingClientRect();
        const yPos = e.clientY - ganttRect.top;
        const roomIndex = Math.floor(yPos / GANTT_ROW_HEIGHT);
        const newRoomId = OPERATING_ROOMS[roomIndex]?.id;
        setDragOverRoomId(newRoomId || null);
    };

    const timeHeaders = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
    const totalWidth = totalHours * 60 * pixelsPerMinute;
    
    return (
        <div className="flex flex-col flex-grow p-4 bg-gray-50 overflow-auto">
            <div className="flex-shrink-0 flex items-stretch sticky top-0 bg-gray-50 z-20">
                <div className="w-40 bg-gray-100 p-2 border-r border-b border-gray-300 flex items-center justify-center font-semibold text-gray-700 sticky left-0 z-10">Phòng</div>
                <div className="flex-grow relative h-10 border-b border-gray-300">
                    {timeHeaders.map(hour => (<div key={hour} className="absolute top-0 h-full flex flex-col items-center justify-end text-xs text-gray-500" style={{ left: `${(hour - startHour) * 60 * pixelsPerMinute}px` }}><span className="font-semibold">{`${String(hour).padStart(2, '0')}:00`}</span><div className="w-px h-2 bg-gray-400 mt-1"></div></div>))}
                </div>
            </div>
            <div 
                ref={ganttRef} 
                className="flex-grow relative"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOverRoomId(null)}
            >
                <div className="relative" style={{ width: `${totalWidth}px`, height: `${OPERATING_ROOMS.length * GANTT_ROW_HEIGHT}px` }}>
                    {/* Background Grid & Room Labels */}
                    {OPERATING_ROOMS.map((room, index) => (
                         <div key={room.id} className={`absolute flex items-stretch border-b border-gray-200 transition-colors ${dragOverRoomId === room.id ? 'bg-blue-100' : ''}`} style={{ top: `${index * GANTT_ROW_HEIGHT}px`, height: `${GANTT_ROW_HEIGHT}px`, width: '100%' }}>
                            <div className="w-40 flex-shrink-0 bg-white p-2 border-r border-gray-200 flex items-center justify-center font-bold text-gray-600 sticky left-0 z-10">{room.name}</div>
                            <div className="absolute left-40 top-0 bottom-0 right-0">
                                {Array.from({ length: totalHours }, (_, i) => (<div key={i} className="absolute top-0 h-full w-px bg-gray-200" style={{ left: `${i * 60 * pixelsPerMinute}px` }}></div>))}
                            </div>
                        </div>
                    ))}
                    {/* Surgery Blocks */}
                    {OPERATING_ROOMS.map((room, index) => (
                         <div key={room.id} className="absolute" style={{ top: `${index * GANTT_ROW_HEIGHT}px`, height: `${GANTT_ROW_HEIGHT}px`, left: '10rem', right: '0' }}>
                            {visibleSurgeries.filter(s => s.roomId === room.id).map(s => <SurgeryBlock key={s.id} surgery={s} onDragStart={(e, surg) => handleMouseDown(e, surg, 'drag')} onResizeStart={(e, surg, dir) => handleMouseDown(e, surg, 'resize', dir)} onDoubleClick={onEditSurgery} ganttConfig={{ pixelsPerMinute, ganttOffsetMinutes }} />)}
                        </div>
                    ))}
                    <div ref={ghostRef} className="absolute top-0 h-20 p-2 rounded-lg shadow-lg bg-blue-300 bg-opacity-70 backdrop-blur-sm border-2 border-blue-500 pointer-events-none hidden text-white"></div>
                    <div ref={timeIndicatorRef} className="absolute top-0 rounded-md bg-black bg-opacity-70 text-white text-sm font-mono p-2 pointer-events-none hidden z-50"></div>
                </div>
            </div>
        </div>
    );
};

interface ListViewProps {
    surgeries: Surgery[];
    groupBy: 'department' | 'room';
    onEditSurgery: (surgery: Surgery) => void;
}
const ListView: React.FC<ListViewProps> = ({ surgeries, groupBy, onEditSurgery }) => {
    const [filter, setFilter] = useState<string>('all');
    
    const items = useMemo(() => (groupBy === 'department' ? DEPARTMENTS : OPERATING_ROOMS), [groupBy]);
    
    const filteredSurgeries = useMemo(() => {
        if (filter === 'all') return surgeries;
        if (groupBy === 'department') return surgeries.filter(s => s.department === filter);
        return surgeries.filter(s => s.roomId === Number(filter));
    }, [surgeries, filter, groupBy]);

    const groupedSurgeries = useMemo(() => {
        return items
            .filter(item => filter === 'all' || (groupBy === 'department' ? item.id === filter : item.id === Number(filter)))
            .map(item => ({
                ...item,
                surgeries: filteredSurgeries
                    .filter(s => (groupBy === 'department' ? s.department === item.id : s.roomId === item.id))
                    .sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
            }));
    }, [filteredSurgeries, items, filter, groupBy]);

    const getGroupHeaderStyle = (group: any) => {
        if (groupBy === 'department') {
            const { color, textColor } = getDepartmentInfo(group.id as DepartmentId);
            return { colorClass: color, textColorClass: textColor };
        }
        const roomInfo = getOperatingRoomInfo(group.id as number);
        return { colorClass: roomInfo?.color || 'bg-gray-600', textColorClass: roomInfo?.textColor || 'text-white' };
    };


    return (
        <div className="p-6 bg-gray-100 flex-grow overflow-y-auto">
            <div className="mb-4 bg-white p-3 rounded-lg shadow-sm sticky top-0 z-10">
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700">Lọc theo {groupBy === 'department' ? 'Khoa' : 'Phòng Mổ'}</label>
                <select id="filter" value={filter} onChange={e => setFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="all">Tất cả</option>
                    {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </div>
            <div className="space-y-6">
                 {groupedSurgeries.map(group => {
                     const { colorClass, textColorClass } = getGroupHeaderStyle(group);
                     return (
                    <div key={group.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className={`p-4 ${colorClass}`}>
                            <div className="flex items-center space-x-3">
                                <h2 className={`text-xl font-bold ${textColorClass}`}>{group.name}</h2>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-white/30 ${textColorClass}`}>{group.surgeries.length} ca</span>
                            </div>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {group.surgeries.length > 0 ? group.surgeries.map(s => {
                                const room = s.roomId ? OPERATING_ROOMS.find(r => r.id === s.roomId) : null;
                                return (
                                <li key={s.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onEditSurgery(s)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {groupBy === 'department' ? (
                                                <>
                                                    <p className="font-semibold text-lg text-gray-800">{s.patientName}, {s.patientAge} tuổi</p>
                                                    <p className="text-sm text-gray-600">{s.procedure} - {s.diagnosis}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-lg text-gray-800">{s.procedure}</p>
                                                    <p className="text-sm text-gray-600">{s.patientName}, {s.patientAge} tuổi - {s.diagnosis}</p>
                                                </>
                                            )}
                                            
                                            {groupBy === 'department' && (
                                                <p className="text-sm text-gray-500 mt-1">Phòng: <span className="font-semibold">{room ? room.name : 'Chưa xếp'}</span></p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">PTV: <span className="font-semibold">{s.surgeon || 'Chưa có'}</span></p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="font-mono text-base text-blue-600">{s.startTime} - {s.endTime}</p>
                                            { groupBy !== 'department' && (
                                                <p className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${getDepartmentInfo(s.department).color} ${getDepartmentInfo(s.department).textColor}`}>
                                                    {s.department}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                                )}) : <li className="p-4 text-gray-500 italic">Không có ca mổ nào được lên lịch.</li>}
                        </ul>
                    </div>
                 )})}
            </div>
        </div>
    );
};

interface UnassignedSidebarProps {
    surgeries: Surgery[];
    onEditSurgery: (surgery: Surgery) => void;
    onSurgeryDragStart: (e: React.DragEvent, surgery: Surgery) => void;
}
const UnassignedSidebar: React.FC<UnassignedSidebarProps> = ({ surgeries, onEditSurgery, onSurgeryDragStart }) => (
    <aside className="w-64 bg-gray-100 border-l border-gray-300 p-4 flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Ca chờ duyệt & xếp lịch ({surgeries.length})</h2>
      <div className="flex-grow overflow-y-auto space-y-3">
        {surgeries.length > 0 ? surgeries.map(s => (
          <div 
            key={s.id} 
            onClick={() => onEditSurgery(s)} 
            draggable={true}
            onDragStart={(e) => onSurgeryDragStart(e, s)}
            className="bg-white p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-500 border border-transparent transition-all"
          >
            <p className="font-semibold text-gray-900">{s.patientName}, {s.patientAge}t</p>
            <p className="text-sm text-gray-600">{s.procedure}</p>
            <p className="text-xs text-gray-500 truncate mt-1">{s.diagnosis}</p>
            <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getDepartmentInfo(s.department).color} ${getDepartmentInfo(s.department).textColor}`}>{s.department}</span>
                <span className="text-xs font-medium text-gray-700">{s.surgeon}</span>
            </div>
          </div>
        )) : <p className="text-sm text-gray-500 italic mt-4">Không có ca mổ nào đang chờ.</p>}
      </div>
    </aside>
);

const DrapeCountView: React.FC<{ surgeries: Surgery[] }> = ({ surgeries }) => {
    const { countsByRoom, totalCounts } = useMemo(() => {
        const result: { [key: number]: { name: string, color: string, textColor: string, counts: { [key: string]: number }, others: string[] } } = {};
        const totals: { [key: string]: number } = {};
        let totalOthersCount = 0;

        OPERATING_ROOMS.forEach(room => {
            result[room.id] = { name: room.name, color: room.color, textColor: room.textColor, counts: {}, others: [] };
        });
        
        DRAPE_TYPES.forEach(type => {
            totals[type] = 0;
        });

        surgeries.forEach(surgery => {
            if (surgery.roomId && surgery.drapeType) {
                const roomData = result[surgery.roomId];
                if (surgery.drapeType === 'Khác') {
                    if(surgery.drapeOther) {
                        roomData.others.push(surgery.drapeOther);
                        totalOthersCount++;
                    }
                } else {
                    roomData.counts[surgery.drapeType] = (roomData.counts[surgery.drapeType] || 0) + 1;
                    totals[surgery.drapeType] = (totals[surgery.drapeType] || 0) + 1;
                }
            }
        });

        return { countsByRoom: Object.values(result), totalCounts: { counts: totals, othersCount: totalOthersCount } };
    }, [surgeries]);

    return (
        <div className="p-6 bg-gray-100 flex-grow overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Thống kê số lượng săng mổ</h1>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-100 z-10">Phòng Mổ</th>
                            {DRAPE_TYPES.map(type => <th key={type} scope="col" className="px-6 py-3 text-center">{type}</th>)}
                            <th scope="col" className="px-6 py-3 text-center">Khác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-gray-50 border-b font-bold text-gray-900">
                             <td className="px-6 py-4 sticky left-0 bg-gray-50 z-10">Tổng cộng</td>
                             {DRAPE_TYPES.map(type => <td key={type} className="px-6 py-4 text-center text-lg">{totalCounts.counts[type] || 0}</td>)}
                             <td className="px-6 py-4 text-center text-lg">{totalCounts.othersCount}</td>
                        </tr>
                        {countsByRoom.map(roomData => (
                             <tr key={roomData.name} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10">
                                    <span className={`px-2 py-1 rounded-md ${roomData.color} ${roomData.textColor}`}>{roomData.name}</span>
                                </td>
                                {DRAPE_TYPES.map(type => <td key={type} className="px-6 py-4 text-center font-semibold text-base">{roomData.counts[type] || 0}</td>)}
                                <td className="px-6 py-4 text-center font-semibold text-base" title={roomData.others.join(', ')}>
                                    {roomData.others.length > 0 ? roomData.others.length : 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface SurgeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (surgery: Surgery) => void;
  onDelete: (id: number) => void;
  surgery: Surgery | null;
}

const SurgeryModal: React.FC<SurgeryModalProps> = ({ isOpen, onClose, onSave, onDelete, surgery }) => {
    const [formData, setFormData] = useState<Partial<Surgery>>(surgery || {});
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setFormData(surgery || { 
            patientName: '',
            patientAge: 0,
            diagnosis: '',
            procedure: '',
            surgeon: '',
            department: DepartmentId.GENERAL,
            date: new Date().toISOString().split('T')[0],
            startTime: '08:00',
            endTime: '09:00',
            roomId: null,
            specialRequirements: [],
            drapeType: null
        });
        setIsDeleting(false);
    }, [surgery, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrapeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as DrapeType | 'Khác' | '';
        setFormData(prev => ({...prev, drapeType: value === '' ? null : value, drapeOther: value !== 'Khác' ? '' : prev.drapeOther }));
    }

    const handleSave = () => {
        if (!formData.patientName || !formData.procedure) {
            alert('Vui lòng điền tên bệnh nhân và PPPT.');
            return;
        }
        onSave(formData as Surgery);
    };

    const handleDeleteClick = () => {
        if (surgery && surgery.id) {
            onDelete(surgery.id);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{surgery?.id ? 'Chỉnh sửa ca mổ' : 'Thêm ca mổ mới'}</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Tên bệnh nhân</label>
                         <input type="text" name="patientName" value={formData.patientName || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Tuổi</label>
                         <input type="number" name="patientAge" value={formData.patientAge || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700">Chẩn đoán</label>
                         <input type="text" name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700">PPPT</label>
                         <input type="text" name="procedure" value={formData.procedure || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Phẫu thuật viên</label>
                         <input type="text" name="surgeon" value={formData.surgeon || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Khoa</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {DEPARTMENTS.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Phòng mổ</label>
                        <select name="roomId" value={formData.roomId ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value ? Number(e.target.value) : null }))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">Chưa xếp phòng</option>
                            {OPERATING_ROOMS.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày</label>
                        <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                        <input type="time" name="startTime" value={formData.startTime || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" step="300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                        <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" step="300" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Loại săng</label>
                        <div className="flex space-x-2 mt-1">
                            <select name="drapeType" value={formData.drapeType || ''} onChange={handleDrapeTypeChange} className="block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">Không chọn</option>
                                {DRAPE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                <option value="Khác">Khác</option>
                            </select>
                            {formData.drapeType === 'Khác' && (
                                <input type="text" name="drapeOther" placeholder="Nhập loại săng khác" value={formData.drapeOther || ''} onChange={handleChange} className="block w-full border-gray-300 rounded-md shadow-sm" />
                            )}
                        </div>
                    </div>
                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700">Yêu cầu đặc biệt</label>
                         <textarea name="specialRequirements" value={Array.isArray(formData.specialRequirements) ? formData.specialRequirements.join(', ') : ''} onChange={(e) => setFormData(prev => ({...prev, specialRequirements: e.target.value.split(',').map(s => s.trim())}))} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                        {surgery?.id && (
                            <button onClick={() => setIsDeleting(true)} className="text-red-600 hover:text-red-800 font-medium transition">Xoá ca mổ</button>
                        )}
                         {isDeleting && surgery?.id && (
                            <div className="ml-4 inline-flex items-center">
                                <span className="text-sm text-gray-700 mr-2">Chắc chắn xoá?</span>
                                <button onClick={handleDeleteClick} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">Có</button>
                                <button onClick={() => setIsDeleting(false)} className="ml-2 text-sm text-gray-600">Không</button>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Huỷ</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [surgeries, setSurgeries] = useState<Surgery[]>(INITIAL_SURGERIES);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ROOM);
    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
    const [timeScale, setTimeScale] = useState<TimeScale>('all');
    
    const checkConflicts = useCallback((allSurgeries: Surgery[]): Surgery[] => {
      const surgeriesByRoom: { [key: number]: Surgery[] } = {};
      
      allSurgeries.forEach(s => {
          if (s.roomId) {
              if (!surgeriesByRoom[s.roomId]) surgeriesByRoom[s.roomId] = [];
              surgeriesByRoom[s.roomId].push(s);
          }
      });
      
      const conflictingIds = new Set<number>();
      
      for (const roomId in surgeriesByRoom) {
          const roomSurgeries = surgeriesByRoom[roomId].sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
          for (let i = 0; i < roomSurgeries.length - 1; i++) {
              const current = roomSurgeries[i];
              const next = roomSurgeries[i+1];
              if (timeToMinutes(current.endTime) > timeToMinutes(next.startTime)) {
                  conflictingIds.add(current.id);
                  conflictingIds.add(next.id);
              }
          }
      }

      return allSurgeries.map(s => ({...s, isConflicting: conflictingIds.has(s.id) }));
    }, []);

    useEffect(() => {
        setSurgeries(currentSurgeries => checkConflicts(currentSurgeries));
    }, []);


    const handleSurgeryUpdate = useCallback((updatedSurgery: Surgery) => {
        setSurgeries(prev => checkConflicts(prev.map(s => s.id === updatedSurgery.id ? updatedSurgery : s)));
    }, [checkConflicts]);
    
    const handleOpenModal = (surgery: Surgery | null = null) => {
        setSelectedSurgery(surgery);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSurgery(null);
    };

    const handleSaveSurgery = (surgeryToSave: Surgery) => {
        let savedSurgery;
        if (surgeryToSave.id) { // Update
            savedSurgery = surgeryToSave;
            setSurgeries(prev => prev.map(s => s.id === surgeryToSave.id ? surgeryToSave : s));
        } else { // Create
            savedSurgery = { ...surgeryToSave, id: Date.now() };
            setSurgeries(prev => [...prev, savedSurgery]);
        }
        // Directly call checkConflicts after state update
        setSurgeries(currentSurgeries => checkConflicts(currentSurgeries));
        handleCloseModal();
    };
    
    const handleDeleteSurgery = (id: number) => {
        setSurgeries(prev => checkConflicts(prev.filter(s => s.id !== id)));
        handleCloseModal();
    }
    
    const handleSurgeryDragStart = (e: React.DragEvent, surgery: Surgery) => {
        e.dataTransfer.setData('surgery-id', surgery.id.toString());
    };

    const handleSurgeryDrop = (surgeryId: number, newRoomId: number, newStartTime: string) => {
        const surgeryToUpdate = surgeries.find(s => s.id === surgeryId);
        if (surgeryToUpdate) {
            const duration = timeToMinutes(surgeryToUpdate.endTime) - timeToMinutes(surgeryToUpdate.startTime);
            const newEndTime = minutesToTime(timeToMinutes(newStartTime) + (duration > 0 ? duration : 60)); // ensure min 60min duration on drop
            
            const updatedSurgery: Surgery = {
                ...surgeryToUpdate,
                roomId: newRoomId,
                startTime: newStartTime,
                endTime: newEndTime,
            };
            handleSurgeryUpdate(updatedSurgery);
        }
    };

    const filteredSurgeries = useMemo(() => {
        return surgeries.filter(s => s.date === currentDate);
    }, [surgeries, currentDate]);

    const unassignedSurgeries = useMemo(() => {
        return filteredSurgeries.filter(s => s.roomId === null);
    }, [filteredSurgeries]);
    
    const renderView = () => {
        switch(viewMode) {
            case ViewMode.ROOM:
                return <GanttChart surgeries={filteredSurgeries} onSurgeryUpdate={handleSurgeryUpdate} onEditSurgery={handleOpenModal} onSurgeryDrop={handleSurgeryDrop} timeScale={timeScale} />;
            case ViewMode.DEPARTMENT:
                return <ListView surgeries={filteredSurgeries} groupBy="department" onEditSurgery={handleOpenModal} />;
            case ViewMode.ROOM_LIST:
                return <ListView surgeries={filteredSurgeries} groupBy="room" onEditSurgery={handleOpenModal} />;
            case ViewMode.DRAPE_COUNT:
                return <DrapeCountView surgeries={filteredSurgeries} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100 font-sans">
            <Header 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
                onAddSurgery={() => handleOpenModal()}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onPrevDay={() => setCurrentDate(prev => changeDate(prev, -1))}
                onNextDay={() => setCurrentDate(prev => changeDate(prev, 1))}
                timeScale={timeScale}
                onTimeScaleChange={setTimeScale}
            />
            <main className="flex-grow flex overflow-auto">
                <div className="flex-grow flex flex-col min-w-0">
                    {renderView()}
                </div>
                {viewMode === ViewMode.ROOM && <UnassignedSidebar surgeries={unassignedSurgeries} onEditSurgery={handleOpenModal} onSurgeryDragStart={handleSurgeryDragStart} />}
            </main>
            <SurgeryModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSurgery}
                onDelete={handleDeleteSurgery}
                surgery={selectedSurgery}
            />
        </div>
    );
};

export default App;
