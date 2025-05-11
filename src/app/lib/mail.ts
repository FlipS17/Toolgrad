import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
})

export async function sendVerificationEmail(email: string, code: string) {
	const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <img src="https://toolgrad.ru/logo.png" alt="ToolGrad" style="height:40px;margin-bottom:20px;" />
      <h2>Подтверждение регистрации</h2>
      <p>Вы зарегистрировались на сайте <strong>ToolGrad</strong>. Чтобы подтвердить регистрацию, введите следующий код:</p>
      <div style="font-size:24px;font-weight:bold;margin:20px 0;color:#F89514;">${code}</div>
      <p>Если вы не запрашивали код — просто проигнорируйте это письмо.</p>
    </div>
  `

	await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to: email,
		subject: 'Код подтверждения • ToolGrad',
		html,
	})
}
