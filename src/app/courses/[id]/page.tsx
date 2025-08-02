'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Clock, MapPin, User, FileText, Plus, Edit, Trash2 } from 'lucide-react'

interface Course {
  id: string
  name: string
  abbreviation: string | null
  credits: number
  semester: string
  instructor: string
  day: string
  time: string
  room: string
  documents: any[]
  importantDates: any[]
  createdAt: string
  updatedAt: string
}

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }
      
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <BookOpen className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error loading course</h3>
          <p className="text-gray-400 mb-6">{error || 'Course not found'}</p>
          <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/courses" className="inline-flex items-center text-gray-300 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{course.name}</h1>
            {course.abbreviation && (
              <p className="text-blue-400 mt-1 font-medium">{course.abbreviation}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/courses/${id}/edit`} className="inline-flex items-center px-3 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button className="inline-flex items-center px-3 py-2 border border-red-600 text-red-400 rounded-md hover:bg-red-900 transition-colors">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Information */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Course Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Instructor:</span>
                  <span className="ml-2 text-gray-300">{course.instructor}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Day:</span>
                  <span className="ml-2 text-gray-300">{course.day}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Time:</span>
                  <span className="ml-2 text-gray-300">{course.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Room:</span>
                  <span className="ml-2 text-gray-300">{course.room}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Credits:</span>
                  <span className="ml-2 text-gray-300">{course.credits} ECTS</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-300">Semester:</span>
                  <span className="ml-2 text-gray-300">{course.semester}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
              <Link href={`/courses/${id}/documents`} className="inline-flex items-center px-3 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-md hover:bg-blue-900 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Link>
            </div>
            <div className="space-y-3">
              {course.documents.length > 0 ? (
                course.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-white">{doc.name}</h3>
                        <p className="text-sm text-gray-400">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
              <Link href={`/courses/${id}/events/new`} className="inline-flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 border border-red-600 rounded-md hover:bg-red-900 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Link>
            </div>
            <div className="space-y-3">
              {course.importantDates.length > 0 ? (
                course.importantDates.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.type.replace('_', ' ')} • {new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.type === 'EXAM_DATE' ? 'bg-red-600 text-white' :
                      event.type === 'ASSIGNMENT_DUE' ? 'bg-blue-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No events scheduled yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Documents</span>
                <span className="font-medium text-white">{course.documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Events</span>
                <span className="font-medium text-white">{course.importantDates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ECTS Credits</span>
                <span className="font-medium text-white">{course.credits}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href={`/courses/${id}/documents`} className="block w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-blue-900 rounded-md transition-colors">
                View All Documents
              </Link>
              <Link href={`/courses/${id}/events`} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900 rounded-md transition-colors">
                View All Events
              </Link>
              <Link href={`/courses/${id}/edit`} className="block w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-900 rounded-md transition-colors">
                Edit Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 