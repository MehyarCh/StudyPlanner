'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, FileText, Plus, Clock, AlertTriangle, CheckSquare, Square, X, Grid, Columns } from 'lucide-react'

interface DashboardStats {
  totalCourses: number
  totalDocuments: number
  upcomingEvents: number
}

interface Event {
  id: string
  title: string
  date: string
  type: string
  description?: string
  course: {
    id: string
    name: string
  }
}

interface Deadline {
  id: string
  title: string
  type: 'private' | 'administrative' | 'uni'
  completed: boolean
  createdAt: Date
  dueDate?: string
  dueTime?: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalDocuments: 0,
    upcomingEvents: 0
  })
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([])
  const [weeklyDeadlines, setWeeklyDeadlines] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeadline, setNewDeadline] = useState<{ 
    title: string; 
    type: 'private' | 'administrative' | 'uni';
    dueDate: string;
    dueTime: string;
  }>({ 
    title: '', 
    type: 'private',
    dueDate: '',
    dueTime: ''
  })
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'columns'>('grid')

  useEffect(() => {
    fetchDashboardData()
    loadDeadlines()
  }, [])

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []
    
    Object.keys(countdowns).forEach(id => {
      const interval = setInterval(() => {
        setCountdowns(prev => {
          const newCountdowns = { ...prev }
          newCountdowns[id] = Math.max(0, newCountdowns[id] - 1)
          
          if (newCountdowns[id] === 0) {
            delete newCountdowns[id]
            const filtered = deadlines.filter(d => d.id !== id)
            setDeadlines(filtered)
            saveDeadlines(filtered)
            setDeletingIds(prev => {
              const newSet = new Set(prev)
              newSet.delete(id)
              return newSet
            })
          }
          
          return newCountdowns
        })
      }, 1000)
      intervals.push(interval)
    })

    return () => intervals.forEach(clearInterval)
  }, [countdowns, deadlines])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveDeadline(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const loadDeadlines = () => {
    const saved = localStorage.getItem('deadlines')
    if (saved) {
      const parsed = JSON.parse(saved).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt)
      }))
      setDeadlines(parsed)
    }
  }

  const saveDeadlines = (newDeadlines: Deadline[]) => {
    localStorage.setItem('deadlines', JSON.stringify(newDeadlines))
  }

  const addDeadline = () => {
    if (!newDeadline.title.trim()) return
    
    const deadline: Deadline = {
      id: Date.now().toString(),
      title: newDeadline.title.trim(),
      type: newDeadline.type,
      completed: false,
      createdAt: new Date(),
      dueDate: newDeadline.dueDate || undefined,
      dueTime: newDeadline.dueTime || undefined
    }
    
    const updated = [...deadlines, deadline]
    setDeadlines(updated)
    saveDeadlines(updated)
    setNewDeadline({ title: '', type: 'private', dueDate: '', dueTime: '' })
    setShowAddForm(false)
  }

  const toggleDeadline = (id: string) => {
    const updated = deadlines.map(d => 
      d.id === id ? { ...d, completed: !d.completed } : d
    )
    setDeadlines(updated)
    saveDeadlines(updated)
    
    const deadline = updated.find(d => d.id === id)
    if (deadline?.completed) {
      setDeletingIds(prev => new Set([...prev, id]))
      setCountdowns(prev => ({ ...prev, [id]: 3 }))
    } else {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      setCountdowns(prev => {
        const newCountdowns = { ...prev }
        delete newCountdowns[id]
        return newCountdowns
      })
    }
  }

  const deleteDeadline = (id: string) => {
    const filtered = deadlines.filter(d => d.id !== id)
    setDeadlines(filtered)
    saveDeadlines(filtered)
  }

  const moveDeadline = (dragIndex: number, dropIndex: number) => {
    const newDeadlines = [...deadlines]
    const [draggedItem] = newDeadlines.splice(dragIndex, 1)
    newDeadlines.splice(dropIndex, 0, draggedItem)
    setDeadlines(newDeadlines)
    saveDeadlines(newDeadlines)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'private':
        return 'bg-purple-600/80 text-white'
      case 'administrative':
        return 'bg-orange-600/80 text-white'
      case 'uni':
        return 'bg-green-600/80 text-white'
      default:
        return 'bg-gray-600/80 text-white'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'private':
        return 'Private'
      case 'administrative':
        return 'Admin'
      case 'uni':
        return 'LMU'
      default:
        return type
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch courses for stats
      const coursesResponse = await fetch('/api/courses')
      const courses = coursesResponse.ok ? await coursesResponse.json() : []
      
      // Fetch today's events
      const todayResponse = await fetch('/api/events/today')
      const todaysEventsData = todayResponse.ok ? await todayResponse.json() : []
      
      // Fetch weekly deadlines
      const weekResponse = await fetch('/api/events/week')
      const weeklyDeadlinesData = weekResponse.ok ? await weekResponse.json() : []
      
      // Calculate stats
      const totalDocuments = courses.reduce((sum: number, course: any) => sum + course.documents.length, 0)
      const upcomingEvents = courses.reduce((sum: number, course: any) => sum + course.importantDates.length, 0)
      
      setStats({
        totalCourses: courses.length,
        totalDocuments,
        upcomingEvents
      })
      
      setTodaysEvents(todaysEventsData)
      setWeeklyDeadlines(weeklyDeadlinesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM_DATE':
        return 'bg-red-600 text-white'
      case 'ASSIGNMENT_DUE':
        return 'bg-blue-600 text-white'
      case 'PROJECT_DUE':
        return 'bg-orange-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getEventTypeLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase()
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Study Planner
            </h1>
            <p className="text-gray-300 mt-2 text-lg">Track your courses, documents, and important dates</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex border border-gray-600/50 rounded-lg backdrop-blur-sm bg-gray-800/50 shadow-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('columns')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  viewMode === 'columns'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Columns className="h-4 w-4" />
              </button>
            </div>
            <Link href="/courses/new" className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      {viewMode === 'grid' ? (
        // Grid Layout (original)
        <>
          {/* Main Actions */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/courses" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">Courses</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Manage your courses and schedules</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalCourses}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Courses</p>
                </div>
              </Link>

              <Link href="/documents" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 border border-gray-700/50 hover:border-green-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">Documents</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Organize lecture notes and materials</p>
                    </div>
                    <FileText className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalDocuments}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Documents</p>
                </div>
              </Link>

              <Link href="/calendar" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-red-500/20 transition-all duration-500 border border-gray-700/50 hover:border-red-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors duration-300">Calendar</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">View important dates and deadlines</p>
                    </div>
                    <Calendar className="h-6 w-6 text-red-400 group-hover:text-red-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.upcomingEvents}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Upcoming Events</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/courses" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">Courses</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Manage your courses and schedules</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalCourses}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Courses</p>
                </div>
              </Link>

              <Link href="/documents" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 border border-gray-700/50 hover:border-green-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">Documents</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Organize lecture notes and materials</p>
                    </div>
                    <FileText className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalDocuments}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Documents</p>
                </div>
              </Link>

              <Link href="/calendar" className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-red-500/20 transition-all duration-500 border border-gray-700/50 hover:border-red-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors duration-300">Calendar</h3>
                      <p className="text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">View important dates and deadlines</p>
                    </div>
                    <Calendar className="h-6 w-6 text-red-400 group-hover:text-red-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.upcomingEvents}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Upcoming Events</p>
                </div>
              </Link>
            </div>
          )}

          {/* To-Dos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">To-Dos</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add To-Do
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              ) : (deadlines.length > 0 || weeklyDeadlines.length > 0) ? (
                <div className="divide-y divide-gray-700/50">
                  {/* Drop zone indicator at the top */}
                  {draggedIndex !== null && dragOverIndex === 0 && (
                    <div className="p-4 border-2 border-dashed border-green-400/50 bg-green-900/10 rounded-lg m-2 animate-pulse">
                      <div className="flex items-center justify-center text-green-400 text-sm font-medium">
                        <span>Drop here to move to top</span>
                      </div>
                    </div>
                  )}
                  
                  {/* User-created to-dos */}
                  {deadlines.map((deadline, index) => (
                    <div
                      key={deadline.id}
                      className={`p-4 flex items-center justify-between cursor-move hover:bg-gray-700/30 transition-all duration-500 relative group ${
                        deletingIds.has(deadline.id) ? 'opacity-50' : ''
                      } ${draggedIndex === index ? 'bg-blue-900/20 border-l-4 border-l-blue-500 scale-105 shadow-2xl z-10' : ''} ${
                        dragOverIndex === index ? 'bg-green-900/20 border-l-4 border-l-green-500' : ''
                      }`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOverItem(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drag indicator glow */}
                      {draggedIndex === index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm animate-pulse"></div>
                      )}
                      
                      {/* Drop zone indicator */}
                      {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-sm animate-pulse border-2 border-green-400/50"></div>
                      )}
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center space-x-3 w-full">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleDeadline(deadline.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 hover:scale-110 transform"
                          >
                            {deadline.completed ? (
                              <CheckSquare className="h-8 w-8" />
                            ) : (
                              <Square className="h-8 w-8" />
                            )}
                          </button>
                          <span className={`ml-4 ${deadline.completed ? 'line-through text-gray-500' : 'text-white'} transition-all duration-300`}>
                            {deadline.title}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(deadline.type)} shadow-lg transition-all duration-300 hover:scale-105`}>
                          {getTypeLabel(deadline.type)}
                        </span>
                        {(deadline.dueDate || deadline.dueTime) && (
                          <div className="text-xs text-gray-400 flex items-center space-x-2">
                            {deadline.dueDate && (
                              <span className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                              </span>
                            )}
                            {deadline.dueTime && (
                              <span className="flex items-center space-x-1">
                                <span>🕐</span>
                                <span>{deadline.dueTime}</span>
                              </span>
                            )}
                          </div>
                        )}
                        {countdowns[deadline.id] && (
                          <span className="text-xs text-red-400 font-medium animate-pulse">
                            Deleting in {countdowns[deadline.id]}s
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteDeadline(deadline.id)}
                        className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110 transform relative z-10"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Drop zone indicator at the bottom */}
                  {draggedIndex !== null && dragOverIndex === deadlines.length && (
                    <div className="p-4 border-2 border-dashed border-green-400/50 bg-green-900/10 rounded-lg m-2 animate-pulse">
                      <div className="flex items-center justify-center text-green-400 text-sm font-medium">
                        <span>Drop here to move to bottom</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No to-dos this week</p>
                </div>
              )}
            </div>
            {showAddForm && (
              <div className="mt-4 p-6 bg-gradient-to-br from-gray-700/90 to-gray-800/90 rounded-xl shadow-2xl border border-gray-600/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Add New To-Do</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="To-do title"
                      value={newDeadline.title}
                      onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    />
                    <select
                      value={newDeadline.type}
                      onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value as 'private' | 'administrative' | 'uni' })}
                      className="px-4 py-3 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    >
                      <option value="private">Private</option>
                      <option value="administrative">Admin</option>
                      <option value="uni">LMU</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={newDeadline.dueDate}
                      onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    />
                    <input
                      type="time"
                      value={newDeadline.dueTime}
                      onChange={(e) => setNewDeadline({ ...newDeadline, dueTime: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addDeadline}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Add To-Do
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 border border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Today's Events */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Today's Events</h2>
              <Link href="/calendar" className="text-blue-400 hover:text-blue-300 text-sm transition-all duration-300 hover:scale-105">
                View All
              </Link>
            </div>
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              ) : todaysEvents.length > 0 ? (
                <div className="divide-y divide-gray-700/50">
                  {todaysEvents.map((event) => (
                    <div key={event.id} className="p-4 hover:bg-gray-700/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-white">{event.title}</h3>
                            <p className="text-sm text-gray-400">{event.course.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)} shadow-lg`}>
                            {getEventTypeLabel(event.type)}
                          </span>
                          <span className="text-sm text-gray-400">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No events scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Column Layout - 3 columns
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Deadlines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">To-Dos</h2>
            </div>
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              ) : (deadlines.length > 0 || weeklyDeadlines.length > 0) ? (
                <div className="divide-y divide-gray-700/50">
                  {/* Drop zone indicator at the top */}
                  {draggedIndex !== null && dragOverIndex === 0 && (
                    <div className="p-4 border-2 border-dashed border-green-400/50 bg-green-900/10 rounded-lg m-2 animate-pulse">
                      <div className="flex items-center justify-center text-green-400 text-sm font-medium">
                        <span>Drop here to move to top</span>
                      </div>
                    </div>
                  )}
                  
                  {/* User-created deadlines */}
                  {deadlines.map((deadline, index) => (
                    <div
                      key={deadline.id}
                      className={`p-3 flex items-center justify-between cursor-move hover:bg-gray-700/30 transition-all duration-300 ${
                        deletingIds.has(deadline.id) ? 'opacity-50' : ''
                      } ${draggedIndex === index ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOverItem(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleDeadline(deadline.id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 hover:scale-110"
                        >
                          {deadline.completed ? (
                            <CheckSquare className="h-6 w-6" />
                          ) : (
                            <Square className="h-6 w-6" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${deadline.completed ? 'line-through text-gray-500' : 'text-white'} truncate transition-all duration-300`}>
                              {deadline.title}
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(deadline.type)} flex-shrink-0 shadow-lg`}>
                              {getTypeLabel(deadline.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDeadline(deadline.id)}
                        className="text-gray-400 hover:text-red-400 ml-2 transition-all duration-300 hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Course-related to-dos (moved from This Week's Deadlines) */}
                  {weeklyDeadlines.map((event) => (
                    <div key={event.id} className="p-4 hover:bg-gray-700/30 transition-all duration-300 group relative">
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                          <div>
                            <h3 className="font-medium text-white group-hover:text-orange-300 transition-colors duration-300">{event.title}</h3>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300">{event.course.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)} shadow-lg transition-all duration-300 hover:scale-105`}>
                            {getEventTypeLabel(event.type)}
                          </span>
                          <span className="text-sm text-gray-400 group-hover:text-gray-300">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No to-dos this week</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add To-Do
              </button>
            </div>
            {showAddForm && (
              <div className="mt-4 p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 rounded-xl shadow-2xl border border-gray-600/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Add New To-Do</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="To-do title"
                      value={newDeadline.title}
                      onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    />
                    <select
                      value={newDeadline.type}
                      onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value as 'private' | 'administrative' | 'uni' })}
                      className="px-3 py-2 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="private">Private</option>
                      <option value="administrative">Admin</option>
                      <option value="uni">LMU</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newDeadline.dueDate}
                      onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    />
                    <input
                      type="time"
                      value={newDeadline.dueTime}
                      onChange={(e) => setNewDeadline({ ...newDeadline, dueTime: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-600/50 text-white rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addDeadline}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Add To-Do
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 border border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Today's Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Today's Events</h2>
              <Link href="/calendar" className="text-blue-400 hover:text-blue-300 text-sm transition-all duration-300 hover:scale-105">
                View All
              </Link>
            </div>
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              ) : todaysEvents.length > 0 ? (
                <div className="divide-y divide-gray-700/50">
                  {todaysEvents.map((event) => (
                    <div key={event.id} className="p-3 hover:bg-gray-700/30 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{event.title}</h3>
                          <p className="text-xs text-gray-400 truncate">{event.course.name}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)} shadow-lg`}>
                            {getEventTypeLabel(event.type)}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No events scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Action Cards */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Main Actions</h2>
            <div className="space-y-4">
              <Link href="/courses" className="group block relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">Courses</h3>
                      <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">Manage your courses and schedules</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalCourses}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Courses</p>
                </div>
              </Link>

              <Link href="/documents" className="group block relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 border border-gray-700/50 hover:border-green-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">Documents</h3>
                      <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">Organize lecture notes and materials</p>
                    </div>
                    <FileText className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.totalDocuments}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total Documents</p>
                </div>
              </Link>

              <Link href="/calendar" className="group block relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-2xl hover:shadow-red-500/20 transition-all duration-500 border border-gray-700/50 hover:border-red-500/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors duration-300">Calendar</h3>
                      <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">View important dates and deadlines</p>
                    </div>
                    <Calendar className="h-6 w-6 text-red-400 group-hover:text-red-300 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    {loading ? '...' : stats.upcomingEvents}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Upcoming Events</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
