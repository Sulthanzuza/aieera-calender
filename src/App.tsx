import React from 'react';
import CalendarView from './components/CalendarView';
import { Calendar, Users, TrendingUp } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aieera Calender</h1>
                <p className="text-sm text-gray-600">Plan, schedule, and never miss a post</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">Content Planning</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Smart Reminders</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Scheduled Posts</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Reminders Set</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Content Types</p>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                  <p className="text-xs text-gray-500">Posts, Reels, Stories</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Calendar Component */}
        <CalendarView />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to get started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <div>
                <p className="font-medium">Click on any date</p>
                <p className="text-blue-600">Select a date to schedule your content</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <div>
                <p className="font-medium">Fill in the details</p>
                <p className="text-blue-600">Add caption, type, time, and email</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <p className="font-medium">Get reminded</p>
                <p className="text-blue-600">Receive email alerts 4 hours before posting</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
              <div>
                <p className="font-medium">Never miss a post</p>
                <p className="text-blue-600">Stay consistent with your content schedule</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Social Media Content Calendar - Built with React, TypeScript, and Express
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;