import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

//  Implement the fileStogare logic
export function getUploadUrl(todoId: string, userId) {
  const urlExpiration = process.env.SIGNED_URL_EXPIRATION
  const bucketName = process.env.IMAGES_S3_BUCKET
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId + userId,
    Expires: urlExpiration
  })
}
