export const participationConfirmation = (nickname: string) => ({
  subject: 'Welcome to The Vault! Your Entry is Confirmed',
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d;">Welcome to The Vault!</h1>
      <p>Hello ${nickname},</p>
      <p>Your entry to The Vault has been confirmed! You're now in the running to win this week's prize pool.</p>
      <p>The draw will take place this Sunday at midnight (00:00). We'll notify you if you're the lucky winner!</p>
      <p>Good luck!</p>
      <p>Best regards,<br>The Vault Team</p>
    </div>
  `,
});

export const winnerNotification = (nickname: string, amount: number) => ({
  subject: 'Congratulations! You Won The Vault Prize!',
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d;">🎉 Congratulations!</h1>
      <p>Dear ${nickname},</p>
      <p>We're thrilled to announce that you're this week's winner of The Vault!</p>
      <p>Your prize amount: €${amount.toLocaleString()}</p>
      <p>We'll be in touch shortly with details about claiming your prize.</p>
      <p>Best regards,<br>The Vault Team</p>
    </div>
  `,
});