const { generateEmailBody, sendEmail } = require("../email.service");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Mock the SESClient and SendEmailCommand
jest.mock("@aws-sdk/client-ses", () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  SendEmailCommand: jest.fn(),
}));

describe("generateEmailBody", () => {
  it("should generate the correct email body", () => {
    const messageBody = {
      name: "John",
      content: "Hello world",
    };
    const expectedEmailBody =
      "Hello John!<br><br>Here's the message content: Hello world.";
    expect(generateEmailBody(messageBody)).toEqual(expectedEmailBody);
  });
});

describe("sendEmail", () => {
  it("should send an email with the correct parameters", async () => {
    const recipientEmail = "test@example.com";
    const subject = "Test email";
    const body = "This is a test email";
    const expectedParams = {
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Html: {
            Data: body,
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: "sender@example.com",
    };

    const sesClient = new SESClient({});
    await sendEmail(recipientEmail, subject, body);

    // expect(SESClient).toHaveBeenCalledTimes(1);
    // expect(SendEmailCommand).toHaveBeenCalledTimes(1);
    expect(SendEmailCommand).toHaveBeenCalledWith(expectedParams);
    // expect(sesClient.send).toHaveBeenCalledTimes(1);
  });
});
