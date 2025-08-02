'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Clock, MapPin, Plus, User, Search, Filter, Grid, List, Calculator, Trash2 } from 'lucide-react'

interface Course {
  id: string
  name: string
  credits: number
  semester: string
  instructor: string
  day: string
  time: string
  room: string
  abbreviation: string
  status: 'ENROLLED' | 'PASSED' | 'FAILED'
  documents: any[]
  importantDates: any[]
  createdAt: string
  updatedAt: string
}

interface CourseGrade {
  courseId: string
  grade: string
}

interface DragState {
  isDragging: boolean
  draggedCourse: Course | null
  draggedIndex: number | null
  sourceSemester: string | null
  dropTarget: {
    semester: string | null
    index: number | null
  } | null
}

// Convert semester code to sortable value
const getSemesterSortValue = (semester: string): number => {
  const type = semester.substring(0, 2) // WS or SS
  let year: number
  
  if (semester.includes('/')) {
    // Format like WS24/25 - extract first year
    year = parseInt(semester.substring(2, 4))
  } else {
    // Format like SS25 - extract year
    year = parseInt(semester.substring(2, 4))
  }
  
  // Create a sortable value that represents chronological order
  // We want: WS24/25 → SS25 → WS25/26 → SS26 → WS26/27
  // SS comes before WS in the same year (SS < WS)
  // For WS semesters, use the start year
  // For SS semesters, use the year as is
  // So we use: year * 10 + (SS=0, WS=5)
  // This gives us: WS24/25=245, SS25=250, WS25/26=255, SS26=260, WS26/27=265
  const typeValue = type === 'SS' ? 0 : 5
  
  return year * 10 + typeValue
}

// Group courses by semester
const groupCoursesBySemester = (courses: Course[]) => {
  const grouped = courses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = []
    }
    acc[course.semester].push(course)
    return acc
  }, {} as Record<string, Course[]>)
  
  // Sort courses alphabetically within each semester
  Object.keys(grouped).forEach(semester => {
    grouped[semester].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return Object.entries(grouped).sort(([a], [b]) => {
    // Sort by the calculated sort value
    return getSemesterSortValue(a) - getSemesterSortValue(b)
  })
}

// Get course status from localStorage
const getCourseStatus = (courseId: string): 'ENROLLED' | 'PASSED' | 'FAILED' => {
  const courseStatuses = JSON.parse(localStorage.getItem('courseStatuses') || '{}')
  return courseStatuses[courseId] || 'ENROLLED'
}

// Calculate weighted average
const calculateAverage = (courses: Course[], grades: CourseGrade[]): { average: number; totalEcts: number; currentEcts: number; passedCourses: number } => {
  let totalWeightedGrade = 0
  let currentEcts = 0
  let passedCourses = 0

  courses.forEach(course => {
    const gradeEntry = grades.find(g => g.courseId === course.id)
    if (gradeEntry && gradeEntry.grade.trim() !== '') {
      const grade = parseFloat(gradeEntry.grade)
      if (!isNaN(grade) && grade >= 1.0 && grade <= 5.0) {
        totalWeightedGrade += grade * course.credits
        currentEcts += course.credits
        passedCourses++
      }
    }
  })

  const average = currentEcts > 0 ? totalWeightedGrade / currentEcts : 0

  return {
    average: Math.round(average * 100) / 100, // Round to 2 decimal places
    totalEcts: courses.reduce((sum, course) => sum + course.credits, 0),
    currentEcts,
    passedCourses
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [grades, setGrades] = useState<CourseGrade[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'grades'>('courses')
  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    // Try to get saved semester filter from localStorage, default to empty (all semesters)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coursesSemesterFilter')
      return saved || ''
    }
    return ''
  })
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    // Try to get saved view mode from localStorage, default to 'grid'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coursesViewMode')
      return (saved as 'grid' | 'list') || 'grid'
    }
    return 'grid'
  })
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCourse: null,
    draggedIndex: null,
    sourceSemester: null,
    dropTarget: null
  })
  const [showDeleteZone, setShowDeleteZone] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  // Ensure all courses have grade entries when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const currentGradeIds = grades.map(g => g.courseId)
      const missingGrades = courses.filter(course => !currentGradeIds.includes(course.id))
      
      if (missingGrades.length > 0) {
        const newGrades = [...grades, ...missingGrades.map(course => ({
          courseId: course.id,
          grade: ''
        }))]
        setGrades(newGrades)
        localStorage.setItem('courseGrades', JSON.stringify(newGrades))
      }
    }
  }, [courses, grades])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      setCourses(data)
      
      // Load saved grades from localStorage
      const savedGrades = localStorage.getItem('courseGrades')
      let initialGrades: CourseGrade[] = []
      
      if (savedGrades) {
        try {
          const parsedGrades = JSON.parse(savedGrades)
          // Check if saved grades is an array (new format) or object (old format)
          if (Array.isArray(parsedGrades)) {
            initialGrades = parsedGrades
          } else {
            // Convert old format to new format
            initialGrades = data.map((course: Course) => ({
              courseId: course.id,
              grade: parsedGrades[course.id] || ''
            }))
          }
        } catch (error) {
          console.error('Error parsing saved grades:', error)
          initialGrades = data.map((course: Course) => ({
            courseId: course.id,
            grade: ''
          }))
        }
      } else {
        // No saved grades, create empty grades for all courses
        initialGrades = data.map((course: Course) => ({
          courseId: course.id,
          grade: ''
        }))
      }
      
      setGrades(initialGrades)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (courseId: string, grade: string) => {
    const newGrades = grades.map(g => 
      g.courseId === courseId ? { ...g, grade } : g
    )
    setGrades(newGrades)
    localStorage.setItem('courseGrades', JSON.stringify(newGrades))
    
    // Update course status based on grade
    const course = courses.find(c => c.id === courseId)
    if (course) {
      const gradeNum = parseFloat(grade)
      let newStatus: 'ENROLLED' | 'PASSED' | 'FAILED' = 'ENROLLED'
      
      if (!isNaN(gradeNum)) {
        if (gradeNum >= 1.0 && gradeNum <= 4.0) {
          newStatus = 'PASSED'
        } else if (gradeNum > 4.0) {
          newStatus = 'FAILED'
        }
      }
      
      // Update course status in localStorage
      const courseStatuses = JSON.parse(localStorage.getItem('courseStatuses') || '{}')
      courseStatuses[courseId] = newStatus
      localStorage.setItem('courseStatuses', JSON.stringify(courseStatuses))
    }
  }

  const handleDragStart = (e: React.DragEvent, course: Course, index: number, semester: string) => {
    setDragState({
      isDragging: true,
      draggedCourse: course,
      draggedIndex: index,
      sourceSemester: semester,
      dropTarget: null
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', course.id)
    
    // Create custom drag image
    const dragImage = document.createElement('div')
    dragImage.innerHTML = `
      <div style="
        background: #1f2937;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      ">
        📚 ${course.name}
      </div>
    `
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 10, 10)
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)
    
    setShowDeleteZone(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCourseDragOver = (e: React.DragEvent, targetSemester: string, targetIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (dragState.isDragging && dragState.draggedCourse && dragState.sourceSemester !== targetSemester) {
      setDragState(prev => ({
        ...prev,
        dropTarget: {
          semester: targetSemester,
          index: targetIndex
        }
      }))
    }
  }

  const handleSemesterDragOver = (e: React.DragEvent, targetSemester: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Only set drop target if we're dragging over a different semester
    if (dragState.isDragging && dragState.draggedCourse && dragState.sourceSemester !== targetSemester) {
      const semesterCourses = groupedCourses.find(([semester]) => semester === targetSemester)?.[1] || []
      const targetIndex = viewMode === 'grid' ? semesterCourses.length : 0 // End for grid, beginning for list
      setDragState(prev => ({
        ...prev,
        dropTarget: {
          semester: targetSemester,
          index: targetIndex
        }
      }))
    }
  }

  const handleDrop = async (e: React.DragEvent, targetSemester: string) => {
    e.preventDefault()
    
    if (!dragState.draggedCourse || !dragState.sourceSemester) {
      return
    }
    
    const courseId = dragState.draggedCourse.id
    
    // If dropping on delete zone, delete the course
    if (targetSemester === 'delete') {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setCourses(prev => prev.filter(c => c.id !== courseId))
        }
      } catch (error) {
        console.error('Error deleting course:', error)
      }
    } else if (targetSemester !== dragState.sourceSemester) {
      // Move course to different semester
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...dragState.draggedCourse,
            semester: targetSemester
          })
        })
        
        if (response.ok) {
          setCourses(prev => 
            prev.map(c => 
              c.id === courseId 
                ? { ...c, semester: targetSemester }
                : c
            )
          )
        }
      } catch (error) {
        console.error('Error updating course:', error)
      }
    }
    
    setDragState({
      isDragging: false,
      draggedCourse: null,
      draggedIndex: null,
      sourceSemester: null,
      dropTarget: null
    })
    setShowDeleteZone(false)
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedCourse: null,
      draggedIndex: null,
      sourceSemester: null,
      dropTarget: null
    })
    setShowDeleteZone(false)
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('coursesViewMode', mode)
    }
  }

  const handleSemesterFilterChange = (semester: string) => {
    setSelectedSemester(semester)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('coursesSemesterFilter', semester)
    }
  }

  // Filter courses by selected semester and search term
  const filteredCourses = courses.filter(course => {
    const matchesSemester = !selectedSemester || course.semester === selectedSemester
    const matchesSearch = !searchTerm || 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.abbreviation && course.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSemester && matchesSearch
  })

  const groupedCourses = groupCoursesBySemester(filteredCourses)
  const { average, totalEcts, currentEcts, passedCourses } = calculateAverage(courses, grades)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <BookOpen className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error loading courses</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchCourses}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <p className="text-gray-300 mt-2">Manage your course schedule and materials</p>
        </div>
        <Link href="/courses/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Course Overview
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'grades'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calculator className="h-4 w-4 inline mr-2" />
          Grades & Average
        </button>
      </div>

      {activeTab === 'courses' ? (
        <>
          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-700">
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedSemester}
                  onChange={(e) => handleSemesterFilterChange(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">All Semesters</option>
                  <option value="WS24/25">WS24/25</option>
                  <option value="SS25">SS25</option>
                  <option value="WS25/26">WS25/26</option>
                  <option value="SS26">SS26</option>
                  <option value="WS26/27">WS26/27</option>
                </select>
                {selectedSemester && (
                  <button 
                    onClick={() => handleSemesterFilterChange('')}
                    className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
                <button className={`inline-flex items-center px-3 py-2 border rounded-md transition-colors ${
                  selectedSemester 
                    ? 'border-blue-600 text-blue-400 bg-blue-900' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}>
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedSemester ? `Filtered: ${selectedSemester}` : 'Filter'}
                </button>
                {/* Search Results Indicator */}
                {(searchTerm || selectedSemester) && (
                  <div className="flex items-center px-3 py-2 text-sm text-gray-400">
                    <span>
                      {filteredCourses.length} of {courses.length} courses
                      {searchTerm && ` matching "${searchTerm}"`}
                      {selectedSemester && ` in ${selectedSemester}`}
                    </span>
                  </div>
                )}
                {/* View Toggle */}
                <div className="flex border border-gray-600 rounded-md">
                  <button 
                    onClick={() => handleViewModeChange('grid')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'text-white bg-gray-600' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('list')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'text-white bg-gray-600' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Course List by Semester */}
          <div className="space-y-8">
            {groupedCourses.map(([semester, semesterCourses]) => (
              <div 
                key={semester}
                onDragOver={(e) => handleSemesterDragOver(e, semester)}
              >
                {/* Semester Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{semester}</h2>
                  <span className="text-sm text-gray-400">{semesterCourses.length} course{semesterCourses.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Course Cards - Responsive Grid */}
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  : "space-y-2"
                }
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, semester)}
                >
                  {/* List view drop zone at the top */}
                  {viewMode === 'list' && dragState.isDragging && 
                   dragState.dropTarget?.semester === semester && 
                   dragState.dropTarget?.index === 0 && (
                    <div 
                      className="bg-gray-800 rounded-lg shadow border-2 border-dashed border-blue-400 p-4 flex items-center justify-center"
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, semester)}
                    >
                      <span className="text-blue-400 font-medium">Drop here</span>
                    </div>
                  )}
                  
                  {semesterCourses.map((course, index) => (
                    <div key={`course-${course.id}`}>
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className={`block ${
                          dragState.isDragging && dragState.draggedCourse?.id === course.id 
                            ? 'cursor-grabbing' 
                            : dragState.isDragging 
                              ? 'cursor-grabbing' 
                              : 'cursor-pointer'
                        }`}
                      >
                        <div
                          className={`${
                            viewMode === 'grid'
                              ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-500 border border-gray-700/50 hover:border-transparent relative overflow-hidden group'
                              : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-500 border border-gray-700/50 hover:border-transparent relative overflow-hidden group'
                          } ${
                            dragState.isDragging && dragState.draggedCourse?.id === course.id 
                              ? 'opacity-50 scale-95' 
                              : dragState.isDragging 
                                ? 'opacity-75' 
                                : ''
                          } ${
                            dragState.isDragging && 
                            dragState.dropTarget?.semester === semester && 
                            dragState.dropTarget?.index === index
                              ? 'border-blue-400 border-2'
                              : ''
                          } ${
                            getCourseStatus(course.id) === 'PASSED'
                              ? 'border-green-500/70 shadow-green-500/30'
                              : getCourseStatus(course.id) === 'FAILED'
                              ? 'border-red-500/70 shadow-red-500/30'
                              : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, course, index, semester)}
                          onDragOver={(e) => handleCourseDragOver(e, semester, index)}
                          onDrop={(e) => handleDrop(e, semester)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            // Prevent navigation when dragging
                            if (dragState.isDragging) {
                              e.preventDefault()
                            }
                          }}
                        >
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                          
                          {/* Animated border glow */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                          
                          {/* Inner content with backdrop blur */}
                          <div className="relative z-10 backdrop-blur-sm">
                            {viewMode === 'grid' ? (
                              <div className="p-6">
                                {/* Course Header */}
                                <div className="mb-4">
                                  <h3 className="text-lg font-semibold text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors duration-300">{course.name}</h3>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{course.semester}</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 transform group-hover:scale-105">
                                      {course.credits} ECTS
                                    </span>
                                  </div>
                                </div>

                                {/* Course Details */}
                                <div className="space-y-3 mb-4 mt-3">
                                  <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                    <User className="h-4 w-4 mr-2 flex-shrink-0 group-hover:text-blue-400 transition-colors duration-300" />
                                    <span className="truncate">{course.instructor}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0 group-hover:text-green-400 transition-colors duration-300" />
                                    <span>{course.day}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 group-hover:text-orange-400 transition-colors duration-300" />
                                    <span>{course.time}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 group-hover:text-red-400 transition-colors duration-300" />
                                    <span className="truncate">{course.room}</span>
                                  </div>
                                </div>

                                {/* Course Stats and Actions */}
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                  <div className="flex items-center space-x-4">
                                    <span className="group-hover:text-gray-300 transition-colors duration-300">{course.documents.length} documents</span>
                                    <span className="group-hover:text-gray-300 transition-colors duration-300">{course.importantDates.length} events</span>
                                  </div>
                                  <div 
                                    className="text-green-400 hover:text-green-300 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      window.location.href = `/courses/${course.id}/documents`
                                    }}
                                  >
                                    Documents
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{course.name}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
                                    <span>{course.instructor}</span>
                                    <span>•</span>
                                    <span>{course.day}</span>
                                    <span>•</span>
                                    <span>{course.semester}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 transform group-hover:scale-105">
                                    {course.credits} ECTS
                                  </span>
                                  <div className="text-gray-500 opacity-50 group-hover:opacity-75 transition-opacity duration-300">
                                    ⋮⋮
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {/* Grid view drop zone at the end */}
                  {viewMode === 'grid' && dragState.isDragging && 
                   dragState.dropTarget?.semester === semester && 
                   dragState.dropTarget?.index === semesterCourses.length && (
                    <div 
                      className="bg-gray-800 rounded-lg shadow border-2 border-dashed border-blue-400 p-6 flex items-center justify-center"
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, semester)}
                    >
                      <span className="text-blue-400 font-medium">Drop here</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {courses.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Get started by adding your first course</p>
              <Link href="/courses/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Course
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Grades Section */}
          <div className="space-y-6">
            {/* Average Display */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
              {/* Ambient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 opacity-100 rounded-xl"></div>
              
              {/* Inner content */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                      Grade Average
                    </h2>
                    <p className="text-gray-300 text-sm">Weighted average based on ECTS credits</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                      {average.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {passedCourses} of {courses.length} courses graded
                    </div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Current ECTS: {currentEcts} / {totalEcts}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Grades Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedCourses.map(([semester, semesterCourses]) => (
                <div key={semester} className="col-span-1">
                  <h3 className="text-lg font-semibold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{semester}</h3>
                  {semesterCourses.map((course) => {
                    const gradeEntry = grades.find(g => g.courseId === course.id)
                    const currentGrade = gradeEntry?.grade || ''
                    
                    return (
                      <div key={course.id} className={`bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-500 border border-gray-700/50 hover:border-transparent relative overflow-hidden group p-4 mb-2 ${
                        getCourseStatus(course.id) === 'PASSED'
                          ? 'border-green-500/70 shadow-green-500/30'
                          : getCourseStatus(course.id) === 'FAILED'
                          ? 'border-red-500/70 shadow-red-500/30'
                          : ''
                      }`}>
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        
                        {/* Inner content with backdrop blur */}
                        <div className="relative z-10 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white text-sm group-hover:text-green-300 transition-colors duration-300">
                                {course.abbreviation || course.name.substring(0, 3).toUpperCase()}
                              </h3>
                              <span className="text-xs text-gray-500 truncate group-hover:text-gray-400 transition-colors duration-300">• {course.name.length > 15 ? course.name.substring(0, 15) + '...' : course.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{course.semester} • <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{course.credits} ECTS</span></span>
                              {/* Status indicator */}
                              {getCourseStatus(course.id) === 'PASSED' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-600/80 text-green-100 shadow-lg">
                                  PASSED
                                </span>
                              )}
                              {getCourseStatus(course.id) === 'FAILED' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-600/80 text-red-100 shadow-lg">
                                  FAILED
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <label htmlFor={`grade-${course.id}`} className="text-sm text-gray-300 whitespace-nowrap group-hover:text-gray-200 transition-colors duration-300">
                              Grade:
                            </label>
                            <input
                              type="number"
                              id={`grade-${course.id}`}
                              min="1.0"
                              max="5.0"
                              step="0.1"
                              value={currentGrade}
                              onChange={(e) => handleGradeChange(course.id, e.target.value)}
                              placeholder="1.0-5.0"
                              className="flex-1 px-2 py-1 text-sm bg-gray-700/80 border border-gray-600/50 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 group-hover:bg-gray-700/90 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Empty State for Grades */}
            {courses.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No courses to grade</h3>
                <p className="text-gray-400 mb-6">Add some courses first to start tracking your grades</p>
                <Link href="/courses/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Course
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Zone */}
      {showDeleteZone && (
        <div className="fixed bottom-6 right-6 z-50">
          <div 
            className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-dashed border-red-400 flex items-center space-x-2"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'delete')}
          >
            <Trash2 className="h-6 w-6" />
            <span className="font-medium">Drop to delete</span>
          </div>
        </div>
      )}
    </div>
  )
} 