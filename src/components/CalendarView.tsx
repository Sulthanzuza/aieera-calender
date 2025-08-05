import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar as RBCalendar, momentLocalizer, View, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import AddContentModal from './AddContentModal';
import EventsOnDayModal from './EventsOnDayModal';
import { ContentEvent, CalendarEvent, ApiResponse } from '../types';
import { Calendar as CalendarIcon, Plus, Mail, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CustomCalendar.css'; // ✨ NEW: Import a custom CSS file for specific overrides

const localizer = momentLocalizer(moment);
const API_BASE_URL = 'https://aieera-calender.onrender.com/api';

// ✨ NEW: Custom Toolbar Component
const CustomToolbar = (toolbar: ToolbarProps) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');
  
  const viewNames: { [key in View]: string } = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center space-x-2">
        <button onClick={goToCurrent} className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors">Today</button>
        <button onClick={goToBack} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={goToNext} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        <h3 className="text-xl font-bold text-gray-700 ml-2">{toolbar.label}</h3>
      </div>
      <div className="flex items-center rounded-lg border border-gray-300 p-1 bg-gray-50">
        {(toolbar.views as View[]).map(viewName => (
          <button
            key={viewName}
            onClick={() => toolbar.onView(viewName)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              toolbar.view === viewName
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {viewNames[viewName]}
          </button>
        ))}
      </div>
    </div>
  );
};


const CalendarView: React.FC = () => {
  /* ---------- state ---------- */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✨ CHANGED: Consolidated modal state for better management
  type ModalState = 
    | { type: null }
    | { type: 'add'; date: Date }
    | { type: 'view'; date: Date; dayEvents: CalendarEvent[] }
    | { type: 'edit'; event: CalendarEvent };
    
  const [modalState, setModalState] = useState<ModalState>({ type: null });

  /* ---------- fetch ---------- */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get<ApiResponse<ContentEvent[]>>(`${API_BASE_URL}/content`);
      if (res.data.content) {
        const calEvents: CalendarEvent[] = res.data.content.map(ev => ({
          id: ev._id,
          title: ev.caption, // Store full title, we'll truncate in the custom component
          start: new Date(ev.scheduledTime),
          end: new Date(new Date(ev.scheduledTime).getTime() + 60 * 60 * 1_000), // 1 hour duration
          resource: ev
        }));
        setEvents(calEvents);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ---------- helpers ---------- */
  const getIcon = (contentType: string) => contentType === 'post' ? '📱' : contentType === 'reel' ? '🎥' : '⭐';
  const getColor = (contentType: string) => {
    switch(contentType) {
      case 'post': return 'bg-blue-500 border-blue-600';
      case 'reel': return 'bg-red-500 border-red-600';
      default: return 'bg-green-500 border-green-600';
    }
  };

  /* ---------- event handlers ---------- */
  const handleSlotClick = useCallback(({ start }: { start: Date }) => {
    const dayEvents = events.filter(e => moment(e.start).isSame(start, 'day'));
    
    if (dayEvents.length === 0) {
      setModalState({ type: 'add', date: start });
    } else {
      setModalState({ type: 'view', date: start, dayEvents });
    }
  }, [events]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    handleSlotClick({ start: event.start });
  }, [handleSlotClick]);
  
  const handleDeleteEvent = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/content/${id}`);
      await fetchEvents();
      // Close modal if it was open for this day
      if (modalState.type === 'view') {
        const updatedEvents = modalState.dayEvents.filter(e => e.id !== id);
        if(updatedEvents.length > 0) {
           setModalState({ ...modalState, dayEvents: updatedEvents });
        } else {
           setModalState({ type: null });
        }
      }
    } catch {
      alert('Failed to delete the event.');
    }
  }, [fetchEvents, modalState]);
  
  const closeModal = () => setModalState({ type: null });

  /* ---------- style getters ---------- */
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const [backgroundColor, borderColor] = getColor(event.resource.contentType).split(' ');
    return {
      className: `${backgroundColor} ${borderColor} text-white p-1 text-xs rounded-md border-l-4 hover:opacity-80 transition-opacity`,
      style: { /* Can add inline styles if needed */ }
    };
  }, []);
  
  // ✨ NEW: Style for the day cells themselves
  const dayPropGetter = useCallback((date: Date) => {
      const isToday = moment(date).isSame(new Date(), 'day');
      return {
          className: `
              ${isToday ? 'bg-blue-50' : ''}
              hover:bg-gray-100 transition-colors cursor-pointer
          `,
          style: {}
      };
  }, []);


  /* ---------- custom components ---------- */
  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="flex items-center space-x-1.5 w-full">
      <span>{getIcon(event.resource.contentType)}</span>
      <span className="truncate flex-1">{event.title}</span>
      {event.resource.reminderSent && <Mail className="w-3 h-3 flex-shrink-0" />}
    </div>
  );

  const formats = useMemo(() => ({
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: () => '', // Hide time range on events
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: {start: Date, end: Date}) =>
      `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`
  }), []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
      {/* header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-7 h-7 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Content Calendar</h2>
        </div>
        <button
          onClick={() => setModalState({ type: 'add', date: new Date() })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Content</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button onClick={fetchEvents} className="underline ml-2 font-semibold">Retry</button>
        </div>
      )}

      {/* calendar */}
      <div className="relative" style={{ height: '70vh' }}>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col justify-center items-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <span className="mt-4 text-gray-600">Loading Calendar...</span>
          </div>
        )}
        <RBCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          popup
          onSelectSlot={handleSlotClick}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter} // ✨ NEW
          components={{
            event: CustomEvent,
            toolbar: CustomToolbar // ✨ NEW
          }}
          formats={formats}
          defaultDate={new Date()}
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      {/* add modal */}
      <AddContentModal
        isOpen={modalState.type === 'add'}
        onClose={closeModal}
        onSave={() => { closeModal(); fetchEvents(); }}
        selectedDate={modalState.type === 'add' ? modalState.date : new Date()}
      />
      
      {/* edit modal */}
      <AddContentModal
        isOpen={modalState.type === 'edit'}
        mode="edit"
        initialData={modalState.type === 'edit' ? modalState.event : undefined}
        onClose={closeModal}
        onSave={() => { closeModal(); fetchEvents(); }}
        selectedDate={modalState.type === 'edit' ? new Date(modalState.event.start) : new Date()}
      />

      {/* day-events modal */}
      <EventsOnDayModal
        isOpen={modalState.type === 'view'}
        date={modalState.type === 'view' ? modalState.date : new Date()}
        events={modalState.type === 'view' ? modalState.dayEvents : []}
        onClose={closeModal}
        onDelete={handleDeleteEvent}
        onAddEvent={() => setModalState({ type: 'add', date: (modalState as any).date })}
        onEdit={ev => setModalState({ type: 'edit', event: ev })}
      />
    </div>
  );
};

export default CalendarView;