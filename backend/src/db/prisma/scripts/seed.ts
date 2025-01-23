import { prisma } from "../../index";
async function main() {
  // Seed Gmail App
  const gmailApp = await prisma.app.upsert({
    where: { name: 'Gmail' },
    update: {},
    create: {
      name: 'Gmail',
      description: 'Google’s email service',
      logoUrl: 'https://logo.clearbit.com/gmail.com',
      triggers: {
        create: [
          {
            key: 'GMAIL_NEW_EMAIL',
            name: 'New Email',
            description: 'Triggered when a new email arrives',
            type: 'POLLING',
            configSchema: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Gmail label to monitor' },
              },
              required: ['label'],
            },
          },
        ],
      },
      actions: {
        create: [
          {
            key: 'GMAIL_SEND_EMAIL',
            name: 'Send Email',
            description: 'Sends an email via Gmail',
            configSchema: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Recipient email address' },
                subject: { type: 'string', description: 'Email subject' },
                body: { type: 'string', description: 'Email body' },
              },
              required: ['to', 'subject', 'body'],
            },
          },
        ],
      },
    },
  });

  console.log('Seeded Gmail App:', gmailApp);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });