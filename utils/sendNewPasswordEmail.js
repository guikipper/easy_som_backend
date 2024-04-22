const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const storeTokenInfo = require("./storeTokenInfo");
const sendErrorResponse = require("./sendErrorResponse");

const htmlCode = (link) => `<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container {
            background-color: #FAFAFA;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .email-content {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
        }
        .header {
            font-size: 24px;
            color: #333333;
        }
        .message {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #00a2ff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 18px;
        }
        .button:hover {
            background-color: #006dcd;
        }
        .footer {
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }
        .legal {
            font-size: 10px;
            color: #999999;
            margin-top: 20px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <div class="header">Recuperação de Senha</div>
            <p class="message">Por favor, clique no botão abaixo para redefinir sua senha. Este link expirará em 10min.</p>
            <a href="${link}" class="button">Recuperar senha</a>
            <p class="footer">Se você não solicitou essa mudança, por favor ignore este e-mail ou entre em contato com nosso suporte.</p>
            <div class="legal">
                Este é um e-mail automático, por favor não responda. Se você tiver qualquer dúvida, entre em contato com o suporte.
                <br>© 2024 EasySom, Todos os direitos reservados.
            </div>
        </div>
    </div>
</body>
</html>`;

const sendNewPasswordEmail = async (res, email, userId) => {
    const jwtPasswordSecret = process.env.JWT_SECRET_PASSWORD_CHANGE;
    const systemMail = process.env.EMAIL_USER; 
    const emailPassword = process.env.EMAIL_PASSWORD;

    const generateToken = (userId) => {
      return jwt.sign({ userId, used: false }, jwtPasswordSecret, { expiresIn: "10min" });
    };
    
    const token = generateToken(userId);
    if(!token) {sendErrorResponse(res, 500, "Ocorreu um erro ao gerar o token.")}

    const data = await storeTokenInfo(userId, token)
    if (!data.acknowledged) {sendErrorResponse(res, 500, "Ocorreu um com o token.")}

    const url = "https://easysom.com.br"
    const link = `${url}/recoverPassword?token=${token}`;

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: systemMail,
        pass: emailPassword,
      },
      tls: {
        rejectUnauthorized: false, // Desativa a verificação do certificado
      },
    });
    const sendedEmail = await transport.sendMail({
      from: "Easy Som <techlowgray@gmail.com>",
      to: email,
      subject: "Pedido de recuperação de senha",
      html: htmlCode(link),
    });

    return sendedEmail;
}

module.exports = sendNewPasswordEmail;
