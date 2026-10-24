export type BudgetType = 'fixed_tier' | 'custom'
export type ProjectStatus = 'pending_review' | 'open' | 'in_progress' | 'submitted' | 'completed' | 'disputed' | 'rejected'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type SubmissionStatus = 'pending_review' | 'approved' | 'changes_requested'

export interface UserSummary {
  id: string
  name: string
}

export interface Project {
  id: string
  title: string
  description: string
  technicalSpec: string | null
  budgetType: BudgetType
  budgetAmount: string
  status: ProjectStatus
  deadline: string | null
  createdAt: string
  clientId?: string
  assignedStudentId?: string | null
  client?: UserSummary
  assignedStudent?: UserSummary | null
}

export interface Application {
  id: string
  projectId: string
  studentId: string
  proposedPrice: string | null
  message: string
  status: ApplicationStatus
  createdAt: string
  student?: UserSummary
  project?: Project
}

export interface Submission {
  id: string
  projectId: string
  studentId: string
  files: string[]
  notes: string | null
  status: SubmissionStatus
  submittedAt: string
}

export interface LedgerEntry {
  id: string
  amount: string
  type: 'inflow' | 'outflow'
  description: string
  donorName: string | null
  donorEmail: string | null
  createdAt: string
}
