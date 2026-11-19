export interface StudentSummary {
  id: string
  name: string
  avatarUrl: string | null
}

export interface Comment {
  id: string
  projectId: string
  authorName: string
  body: string
  createdAt: string
}

export type ProjectType = 'startup' | 'outsource'

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  startup: 'Startup',
  outsource: 'Outsource',
}

export interface Project {
  id: string
  studentId: string
  title: string
  description: string
  repoUrl: string | null
  liveUrl: string | null
  videoUrl: string | null
  imageUrls: string[]
  type: ProjectType
  deployed: boolean
  usersCount: number
  revenueAmount: string
  uiUxRating: number
  functionalityRating: number
  likeCount: number
  createdAt: string
  updatedAt: string
  student?: StudentSummary
  _count?: { comments: number }
  comments?: Comment[]
  score: number
  rank?: number
}

export type StudentStatus = 'pending' | 'approved' | 'rejected'

export interface Student {
  id: string
  email: string
  role: 'student'
  status: StudentStatus
  name: string
  avatarUrl: string | null
  bio: string | null
  className: string | null
  graduationYear: number | null
  createdAt: string
  studentProfile?: { skills: string[]; portfolioLinks: string[] } | null
}
