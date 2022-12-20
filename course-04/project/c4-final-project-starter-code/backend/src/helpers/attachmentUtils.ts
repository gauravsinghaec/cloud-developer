import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

//  Implement the fileStogare logic
export function getUploadUrl(todoId, userId, bucket, expire) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: todoId + userId,
    Expires: expire
  })
}
