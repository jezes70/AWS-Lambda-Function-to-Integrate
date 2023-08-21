const { generateSMSTemplate, publishSmsToPhoneNumber } = require("../index");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

jest.mock("@aws-sdk/client-sns");

describe("generateSMSTemplate", () => {
  it("should generate an SMS template with the correct message", () => {
    const messageBody = {
      name: "John",
      content: "Hello, world!",
    };
    const expectedTemplate =
      "Hello John! Here's the message content: Hello, world!.";
    const actualTemplate = generateSMSTemplate(messageBody);
    expect(actualTemplate).toEqual(expectedTemplate);
  });
});

describe("publishSmsToPhoneNumber", () => {
  it("should publish an SMS message to the given phone number", async () => {
    const phoneNumber = "+1234567890";
    const message = "Hello, world!";
    const snsParams = {
      PhoneNumber: phoneNumber,
      Message: message,
    };
    const snsSendMock = jest.fn();
    SNSClient.mockImplementation(() => ({
      send: snsSendMock,
    }));
    await publishSmsToPhoneNumber(phoneNumber, message);
    expect(SNSClient).toHaveBeenCalledWith({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
      },
    });
  });
});
