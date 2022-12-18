import { SNSEvent, SNSHandler, S3Event } from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";
import Jimp from "jimp/es";

const s3 = new AWS.S3();

const imagesBucketName = process.env.IMAGES_S3_BUCKET;
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET;

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log("Processing SNS event ", JSON.stringify(event));
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message;
    console.log("Processing S3 event", s3EventStr);
    const s3Event = JSON.parse(s3EventStr);
    await processImage(s3Event);
  }
};

async function processImage(s3Event: S3Event) {
  for (const record of s3Event.Records) {
    const key = record.s3.object.key;
    console.log("Processing S3 item with key: ", key);
    // key is the image URL
    await resizeImage(key);
  }
}

export async function resizeImage(imageURL) {
  try {
    console.log(
      `Start - Download image from bucket ${imagesBucketName} with url: `,
      imageURL
    );
    const response = await s3
      .getObject({
        Bucket: imagesBucketName,
        Key: imageURL,
      })
      .promise();
    console.log(
      `Complete - Download image from bucket ${imagesBucketName} with url: `,
      imageURL
    );
    console.log("Resize started");
    const data: Buffer = response.Body as Buffer;
    const photo = await Jimp.read(data);
    await photo.resize(256, Jimp.AUTO);
    console.log("Resize completed");

    const convertedBuffer = await photo.getBufferAsync(Jimp.AUTO);
    console.log(
      `Start - Upload image to bucket ${thumbnailBucketName} with url: `,
      imageURL
    );
    await s3
      .putObject({
        Bucket: thumbnailBucketName,
        Key: `${imageURL}.jpeg`,
        Body: convertedBuffer,
      })
      .promise();
    console.log(
      `Complete - Upload image to bucket ${thumbnailBucketName} for url: `,
      imageURL
    );
  } catch (error) {
    throw new Error(error);
  }
}
