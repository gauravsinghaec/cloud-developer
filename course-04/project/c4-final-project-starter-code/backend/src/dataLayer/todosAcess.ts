import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { getUploadUrl } from '../helpers/attachmentUtils'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIntex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}
  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    try {
      logger.info('Getting the given todo item')
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
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
        Item: {
          ...item,
          attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${item.todoId}`
        }
      })
      logger.info('New Todo is created')
      return item
    } catch (err) {
      logger.error(err)
      throw 'Failed to create todos'
    }
  }
  async updateTodo(
    item: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<Boolean> {
    try {
      logger.info('Updating todo')
      await this.docClient.put({
        TableName: this.todosTable,
        Item: {
          ...item,
          todoId,
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
          todoId: { S: todoId },
          userId: { S: userId }
        }
      })
      return true
    } catch (err) {
      logger.error(err)
      throw 'Failed to delete todos'
    }
  }
  getPresigneURL(userId: string, todoId: string): string {
    try {
      return getUploadUrl(todoId, userId, this.bucketName, this.urlExpiration)
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
