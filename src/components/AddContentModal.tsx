import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { CreateContentData, ApiResponse, CalendarEvent, ContentEvent } from '../types';
import { X, Calendar, Clock, Mail, MessageSquare, Link as LinkIcon, Send, User, Fullscreen } from 'lucide-react';
import moment from 'moment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: Date;
  mode?: 'add' | 'edit';
  initialData?: CalendarEvent | null;
}

Modal.setAppElement('#root');

const AddContentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  mode = 'add',
  initialData
}) => {
  /* ---------- state ---------- */
  const [formData, setFormData] = useState<Omit<CreateContentData, 'userEmail'>>({
    date: '',
    contentType: 'post',
    caption: '',
    contentLink: '',
    scheduledTime: '09:00',
    clientName: ''
  });
  const [userEmails, setUserEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const API_BASE_URL = 'http://localhost:5000/api';

  /* ---------- pre-fill in edit mode ---------- */
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const res = initialData.resource;
      setFormData({
        date: moment(res.date).format('YYYY-MM-DD'),
        contentType: res.contentType,
        caption: res.caption,
        contentLink: res.contentLink || '',
        scheduledTime: moment(res.scheduledTime).format('HH:mm'),
        clientName: res.clientName
      });
      setUserEmails(res.userEmail);
    } else {
      // reset for add mode
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
      setUserEmails(['']);
    }
    setError('');
    setSuccess('');
  }, [isOpen, mode, initialData, selectedDate]);

  /* ---------- handlers ---------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleEmailChange = (idx: number, value: string) => {
    const copy = [...userEmails];
    copy[idx] = value;
    setUserEmails(copy);
    if (error) setError('');
  };
  const addEmail = () => setUserEmails(prev => [...prev, '']);
  const removeEmail = (idx: number) => {
    const copy = [...userEmails];
    copy.splice(idx, 1);
    setUserEmails(copy.length ? copy : ['']);
  };

  /* ---------- validation ---------- */
  const validate = (): boolean => {
    if (!formData.date) return setErr('Please select a date');
    if (!formData.clientName.trim()) return setErr('Client name is required');
    if (!formData.caption.trim()) return setErr('Caption is required');
    if (formData.caption.length > 2200) return setErr('Caption cannot exceed 2200 characters');
    if (!formData.scheduledTime) return setErr('Time is required');

    // emails
    if (userEmails.some(e => !e.trim())) return setErr('Please fill all email fields');
    if (userEmails.some(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))
      return setErr('One or more email addresses are invalid');

    // URL
    if (formData.contentLink && !/^https?:\/\/.+/.test(formData.contentLink))
      return setErr('Content link must be a valid URL');

    // future time
    const dt = new Date(`${formData.date}T${formData.scheduledTime}`);
    if (dt <= new Date()) return setErr('Scheduled time must be in the future');

    return true;

    function setErr(msg: string) {
      setError(msg);
      return false;
    }
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const payload: CreateContentData = {
      ...formData,
      userEmail: userEmails.map(e => e.trim().toLowerCase()).filter(Boolean)
    };

    try {
      if (mode === 'edit' && initialData) {
        await axios.put<ApiResponse<ContentEvent>>(
          `${API_BASE_URL}/content/${initialData.id}`,
          payload
        );
      } else {
        await axios.post<ApiResponse<ContentEvent>>(`${API_BASE_URL}/content`, payload);
      }

      setSuccess(mode === 'edit' ? 'Content updated!' : 'Content scheduled!');
      setTimeout(() => {
        onSave();
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- modal styles ---------- */
  const modalStyles = {
    overlay: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
    content: {
      top: '50%', left: '50%', transform: 'translate(-50%,-50%)', height:'650px',
      maxWidth: '500px', width: '90%', borderRadius: '12px', padding: 0
    }
  };

  /* ---------- render ---------- */
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <div className="bg-white">
        {/* header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'edit' ? 'Edit Content' : 'Schedule Content'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* date / time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />Date
              </label>
              <input
                type="date" name="date" value={formData.date} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />Time
              </label>
              <input
                type="time" name="scheduledTime" value={formData.scheduledTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />Client Name
            </label>
            <input
              type="text" name="clientName" value={formData.clientName}
              onChange={handleInputChange} placeholder="Acme Corp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* content type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <div className="flex space-x-4">
              {( ['post','reel','story'] as const ).map(type => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio" name="contentType" value={type}
                    checked={formData.contentType === type} onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`px-4 py-2 rounded-lg border-2 ${
                    formData.contentType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    {type}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageSquare className="w-4 h-4 inline mr-1" />Caption
            </label>
            <textarea
              name="caption" value={formData.caption} onChange={handleInputChange}
              rows={4} maxLength={2200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              required
            />
            <div className="text-xs text-gray-500">
              {formData.caption.length}/2200 characters
            </div>
          </div>

          {/* link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <LinkIcon className="w-4 h-4 inline mr-1" />Content Link (optional)
            </label>
            <input
              type="url" name="contentLink" value={formData.contentLink}
              onChange={handleInputChange} placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />Emails for Reminder
            </label>
            {userEmails.map((e, idx) => (
              <div key={idx} className="flex mb-2 space-x-2">
                <input
                  type="email" value={e}
                  onChange={ev => handleEmailChange(idx, ev.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {userEmails.length > 1 && (
                  <button type="button" onClick={() => removeEmail(idx)}
                    className="px-2 bg-red-500 text-white rounded">
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addEmail}
              className="text-blue-600 text-xs mt-1">+ Add another email</button>
          </div>

          {/* errors / success */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center"><Send className="w-4 h-4 mr-1"/>{success}</div>}

          {/* buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="w-4 h-4" /><span>{mode === 'edit' ? 'Update' : 'Schedule'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddContentModal;
