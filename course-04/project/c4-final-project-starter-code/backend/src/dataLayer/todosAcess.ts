import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIntex = process.env.TODOS_CREATED_AT_INDEX
  ) {}
  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    try {
      logger.info('Getting the given todo item')
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          KeyConditionExpression: 'userId = :userId AND id = :todoId',
          ExpressionAttributeValues: {
            ':userId': userId,
            ':todoId': todoId
          }
        })
        .promise()

      logger.info('Successfully got the todo from DB')
      if (!result) {
        logger.info('Todo item is not found')
      }
      return result.Items[0] as TodoItem
    } catch (err) {
      logger.error(err)
      throw 'Failed to get todos'
    }
  }
  async getTodos(userId: string): Promise<TodoItem[]> {
    try {
      logger.info('Getting all tods')
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.createdAtIntex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()

      const items = result.Items
      logger.info('Successfully got the todos from DB')
      if (items.length === 0) {
        logger.info('Todos list is empty')
      }
      return items as TodoItem[]
    } catch (err) {
      logger.error(err)
      throw 'Failed to get todos'
    }
  }
  async createTodo(item: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo')
    try {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: item
      })
      return item
    } catch (err) {
      logger.error(err)
      throw 'Failed to create todos'
    }
  }
  async updateTodo(
    item: TodoUpdate,
    id: string,
    userId: string
  ): Promise<Boolean> {
    try {
      logger.info('Updating todo')
      await this.docClient.put({
        TableName: this.todosTable,
        Item: {
          ...item,
          id,
          userId
        }
      })
      logger.info('Updated todo')
      return true
    } catch (err) {
      logger.error(err)
      throw 'Failed to update todos'
    }
  }
  async deleteTodo(userId: string, todoId: string): Promise<Boolean> {
    try {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          id: { S: todoId },
          userId: { S: userId }
        }
      })
      return true
    } catch (err) {
      logger.error(err)
      throw 'Failed to delete todos'
    }
  }
}
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
