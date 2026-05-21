const BREVO_API_KEY = process.env.BREVO_API_KEY as string;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  projectTitle: string;
  token: string;
}) {
  const inviteLink = `${FRONTEND_URL}/invite/${params.token}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "TaskHelper", email: "no-reply@taskhelper.app" },
      to: [{ email: params.to }],
      subject: `${params.inviterName} vous invite sur "${params.projectTitle}"`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
          <h2 style="color:#fc7753;margin-top:0;">Invitation à collaborer 🎉</h2>
          <p style="color:#2d3748;font-size:1rem;">
            <strong>${params.inviterName}</strong> vous invite à rejoindre le projet
            <strong>"${params.projectTitle}"</strong> sur TaskHelper.
          </p>
          <p style="color:#718096;font-size:0.9rem;">
            Cette invitation est valable <strong>30 minutes</strong>.
          </p>
          <a href="${inviteLink}"
            style="display:inline-block;background:#fc7753;color:#fff;padding:13px 30px;
                   border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem;
                   margin-top:8px;">
            Accepter l'invitation
          </a>
          <p style="color:#a0aec0;font-size:0.8rem;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">
            Si vous ne souhaitez pas rejoindre ce projet, ignorez cet email.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Brevo error: ${JSON.stringify(err)}`);
  }
}
