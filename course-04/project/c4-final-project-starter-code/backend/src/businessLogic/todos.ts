import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('DataLayer')

const todoAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Calling get todos')
  return todoAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  logger.info('Calling create todo')
  const newItem = await todoAccess.createTodo({
    todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
  return newItem
}
export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<Boolean> {
  logger.info('Calling update todo')
  const item = todoAccess.getTodo(userId, todoId)
  logger.info(item)
  if (!item) {
    logger.info('the todo item not found')
    createError(404, 'This todo item does not exist!')
  }
  return await todoAccess.updateTodo(
    {
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done
    },
    userId,
    todoId
  )
}
export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<Boolean> {
  logger.info('Calling delete todo')
  const item = todoAccess.getTodo(userId, todoId)
  if (!item) {
    logger.info('the todo item not found')
    createError(404, 'This todo item does not exist!')
  }
  return await todoAccess.deleteTodo(userId, todoId)
}
export function createAttachmentPresignedUrl(todoId: string): string {
  logger.info('Getting presigned URL')

  const url = todoAccess.getPresigneURL(todoId)
  return url
}
