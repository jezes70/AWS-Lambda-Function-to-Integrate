const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");
const dotenv = require("dotenv");
dotenv.config();

const sns = new SNSClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

const sqs = new SQSClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

exports.handler = async (event, context) => {
  try {
    const queueUrl = process.env.AWS_QUEUE_URL;
    const receiveParams = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10,
    };

    const response = await sqs.send(new ReceiveMessageCommand(receiveParams));

    if (response.Messages && response.Messages.length > 0) {
      const message = response.Messages[0];
      const messageBody = JSON.parse(message.Body);

      const smsTemplate = generateSMSTemplate(messageBody);

      await publishSmsToPhoneNumber("+1234567890", smsTemplate);

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        })
      );
    }

    return "Messages processed successfully.";
  } catch (error) {
    console.error("Lambda function error:", error);
    throw error;
  }
};

function generateSMSTemplate(messageBody) {
  const { name, content } = messageBody;

  const smsTemplate = `Hello ${name}! Here's the message content: ${content}.`;

  return smsTemplate;
}

async function publishSmsToPhoneNumber(phoneNumber, message) {
  try {
    const snsParams = {
      PhoneNumber: phoneNumber,
      Message: message,
    };

    await sns.send(new PublishCommand(snsParams));
  } catch (error) {
    console.error("Error sending SMS to phone number:", error);
    throw error;
  }
}

module.exports = {
  generateSMSTemplate,
  publishSmsToPhoneNumber,
};
