import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
export const bucketName = process.env.IMAGES_S3_BUCKET

//  Implement the fileStogare logic
export function getUploadUrl(todoId: string, userId) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId + userId,
    Expires: urlExpiration
  })
}
