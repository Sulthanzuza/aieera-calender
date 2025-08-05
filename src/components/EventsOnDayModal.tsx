import React, { useState } from 'react';
import Modal from 'react-modal';
import { CalendarEvent } from '../types';

interface Props {
  isOpen: boolean;
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onAddEvent: () => void;
  onEdit?: (event: CalendarEvent) => void; // keep optional
}

/* helper to shorten very long URLs for display */
const truncateLink = (url: string, len = 45) =>
  url.length > len ? url.slice(0, len) + '…' : url;

const EventsOnDayModal: React.FC<Props> = ({
  isOpen,
  date,
  events,
  onClose,
  onDelete,
  onAddEvent,
  onEdit
}) => {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const dateString = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  /* ---------- LIST VIEW ---------- */
  const renderList = () =>
    events.length === 0 ? (
      <div className="flex flex-col items-center py-10">
        <p className="text-gray-500 mb-4">No content scheduled.</p>
        <button
          onClick={onAddEvent}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Content
        </button>
      </div>
    ) : (
      <>
        <ul className="space-y-4">
          {events.map(ev => (
            <li
              key={ev.id}
              onClick={() => setSelected(ev)}
              className="p-3 rounded border bg-gray-50 cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span className="font-medium mr-2">{ev.title}</span>
                <span className="text-xs text-gray-500">
                  • {ev.resource.clientName}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(ev.start).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {ev.resource.contentType}
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={onAddEvent}
          className="mt-8 px-6 py-2 bg-blue-500 text-white w-full rounded hover:bg-blue-600"
        >
          Add Content
        </button>
      </>
    );

  /* ---------- DETAILS VIEW ---------- */
  const renderDetails = () =>
    selected && (
      <>
        <h3 className="text-lg font-semibold mb-4 break-all">
          {selected.title}
        </h3>

        <div className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
          <span className="font-medium text-gray-600">Client:</span>
          <span>{selected.resource.clientName}</span>

          <span className="font-medium text-gray-600">Date/Time:</span>
          <span>{new Date(selected.start).toLocaleString()}</span>

          <span className="font-medium text-gray-600">Type:</span>
          <span className="capitalize">{selected.resource.contentType}</span>

          <span className="font-medium text-gray-600">Caption:</span>
          <span className="whitespace-pre-line">{selected.resource.caption}</span>

          {selected.resource.contentLink && (
            <>
              <span className="font-medium text-gray-600">Link:</span>
              <a
                href={selected.resource.contentLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline break-all"
              >
                {truncateLink(selected.resource.contentLink)}
              </a>
            </>
          )}

          <span className="font-medium text-gray-600">Emails:</span>
          <span>{selected.resource.userEmail.join(', ')}</span>
        </div>

        <div className="flex justify-end space-x-2 mt-8">
          {onEdit && (
            <button
             onClick={() => {
    onClose();       
    onEdit && onEdit(selected);
  }}
  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => {
              onDelete(selected.id);
              setSelected(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => setSelected(null)}
            className="px-4 py-2 bg-gray-200 rounded text-gray-700"
          >
            Back
          </button>
        </div>
      </>
    );

  /* ---------- MODAL ---------- */
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      style={{
        content: {
          maxWidth: '520px',
          margin: 'auto',
          borderRadius: '12px',
          padding: 0,
          background: 'white'
        },
        overlay: { backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }
      }}
    >
      <div className="bg-white p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Content scheduled for {dateString}
        </h2>

        {selected ? renderDetails() : renderList()}

        <button
          className="mt-6 px-4 py-2 bg-gray-200 rounded text-gray-700 w-full"
          onClick={() => {
            setSelected(null);
            onClose();
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default EventsOnDayModal;
