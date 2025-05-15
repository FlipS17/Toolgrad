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
      <img src="https://imgur.com/Qxymuum" alt="ToolGrad" style="height:40px;margin-bottom:20px;" />
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

export async function sendPasswordResetEmail(email: string, token: string) {
	const resetLink = `http://localhost:3000/account/reset-password?token=${encodeURIComponent(
		token
	)}`
	const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <img src="https://imgur.com/Qxymuum" alt="ToolGrad" style="height:40px;margin-bottom:20px;" />
      <h2>Сброс пароля</h2>
      <p>Вы запросили сброс пароля на сайте <strong>ToolGrad</strong>.</p>
      <p>Перейдите по ссылке ниже, чтобы установить новый пароль:</p>
      <a href="${resetLink}" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#F89514;color:#fff;text-decoration:none;border-radius:6px;">
        Сбросить пароль
      </a>
      <p style="margin-top:20px;font-size:14px;color:#777;">Если вы не запрашивали это — просто проигнорируйте письмо.</p>
    </div>
  `

	await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to: email,
		subject: 'Сброс пароля • ToolGrad',
		html,
	})
}
