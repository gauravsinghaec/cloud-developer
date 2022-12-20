export interface TodoItem {
  id: string
  userId: string
  name: string
  dueDate: string
  done: boolean
  createdAt: string
  attachmentUrl?: string
}
