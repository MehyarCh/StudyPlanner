'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Clock, MapPin, User, Plus } from 'lucide-react'

interface CourseFormData {
  name: string
  abbreviation: string
  credits: string
  semester: string
  instructor: string
  day: string
  time: string
  room: string
}

export default function AddCoursePage() {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    abbreviation: '',
    credits: '',
    semester: '',
    instructor: '',
    day: '',
    time: '',
    room: ''
  })

  const [errors, setErrors] = useState<Partial<CourseFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')

  const validateForm = (): boolean => {
    const newErrors: Partial<CourseFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required'
    }

    if (!formData.credits.trim()) {
      newErrors.credits = 'Credits are required'
    } else {
      const credits = parseInt(formData.credits)
      if (isNaN(credits) || credits <= 0 || credits > 30) {
        newErrors.credits = 'Credits must be between 1 and 30'
      }
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required'
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor is required'
    }

    if (!formData.day) {
      newErrors.day = 'Day is required'
    }

    if (!formData.time.trim()) {
      newErrors.time = 'Time is required'
    }

    if (!formData.room.trim()) {
      newErrors.room = 'Room is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          abbreviation: formData.abbreviation.trim() || null,
          credits: parseInt(formData.credits),
          semester: formData.semester,
          instructor: formData.instructor.trim(),
          day: formData.day,
          time: formData.time.trim(),
          room: formData.room.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create course')
      }

      // Redirect to courses page after successful creation
      window.location.href = '/courses'
    } catch (error) {
      console.error('Error creating course:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create course')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/courses" className="inline-flex items-center text-gray-300 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Course</h1>
            <p className="text-gray-300 mt-2">Create a new course to track your studies</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          {/* Submit Error */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-md">
              <p className="text-red-300">{submitError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., Introduction to Computer Science"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Abbreviation */}
            <div>
              <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-300 mb-2">
                Abbreviation (optional)
              </label>
              <input
                type="text"
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                  errors.abbreviation ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., ICS"
              />
              {errors.abbreviation && (
                <p className="text-red-400 text-sm mt-1">{errors.abbreviation}</p>
              )}
            </div>

            {/* Credits */}
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-300 mb-2">
                ECTS Credits *
              </label>
              <input
                type="number"
                id="credits"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                  errors.credits ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="6"
                min="1"
                max="30"
              />
              {errors.credits && (
                <p className="text-red-400 text-sm mt-1">{errors.credits}</p>
              )}
            </div>

            {/* Semester */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-300 mb-2">
                Semester *
              </label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${
                  errors.semester ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Semester</option>
                <option value="WS24/25">WS24/25 (Winter Semester 2024/25)</option>
                <option value="SS25">SS25 (Summer Semester 2025)</option>
                <option value="WS25/26">WS25/26 (Winter Semester 2025/26)</option>
                <option value="SS26">SS26 (Summer Semester 2026)</option>
                <option value="WS26/27">WS26/27 (Winter Semester 2026/27)</option>
              </select>
              {errors.semester && (
                <p className="text-red-400 text-sm mt-1">{errors.semester}</p>
              )}
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-300 mb-2">
                Instructor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                    errors.instructor ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              {errors.instructor && (
                <p className="text-red-400 text-sm mt-1">{errors.instructor}</p>
              )}
            </div>

            {/* Day */}
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-300 mb-2">
                Day *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="day"
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${
                    errors.day ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              {errors.day && (
                <p className="text-red-400 text-sm mt-1">{errors.day}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                    errors.time ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g., 10:00 AM - 11:30 AM"
                />
              </div>
              {errors.time && (
                <p className="text-red-400 text-sm mt-1">{errors.time}</p>
              )}
            </div>

            {/* Room */}
            <div className="md:col-span-2">
              <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-2">
                Room *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 ${
                    errors.room ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g., Room 101, Building A"
                />
              </div>
              {errors.room && (
                <p className="text-red-400 text-sm mt-1">{errors.room}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
            <Link
              href="/courses"
              className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 