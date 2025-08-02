import Link from 'next/link'
import { BookOpen, Calendar, FileText, Home } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Study Planner</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link href="/courses" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </Link>
              <Link href="/documents" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Link>
              <Link href="/calendar" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 