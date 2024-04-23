const { ObjectId } = require("mongodb");
const getCollection = require("../db/connect");
const bcrypt = require("bcryptjs");
const sendEmailVerification = require("../utils/sendEmailVerification")
const verifyPassword = require("../utils/verifyPassword");
const getUserByEmail = require("../utils/getUserByEmail");
const createTokenJWT = require("../utils/createTokenJWT");
const encryptPassword = require("../utils/encryptPassword");
const sendNewPasswordEmail = require("../utils/sendNewPasswordEmail")
const sendErrorResponse = require("../utils/sendErrorResponse");
const sendSuccessResponse = require("../utils/sendSuccessResponse")
const checkUserIsBlocked = require("../utils/checkUserIsBlocked")
const handleWrongPassword = require("../utils/handleWrongPassword")
const checkIfTokenWasUsed = require("../utils/checkIfTokenWasUsed")
const storeEmailSended = require("../utils/storeEmailSended")
const checkLastEmailSended = require("../utils/checkLastEmailSended")

class DataController {

  async resendEmailVerification(req, res) {

    try {
      const email = req.email

      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        return sendErrorResponse(res, 404, "Email não cadastrado.", "Por favor, cadastre-se para acessar sua conta.")
      }

      if (existingUser.emailVerified) {
        return sendErrorResponse(res, 404, "Email já foi validado", "Não é necessário validar novamente.")
      }

      const isBlocked = await checkUserIsBlocked(existingUser._id)
      const now = new Date();
      
      if (isBlocked && now < isBlocked) {
        return sendErrorResponse(res, 404, "Usuário bloqueado por limite de tentativas.", "Por favor, tente novamente mais tarde.")
      }

      const emailSended = await sendEmailVerification(email, existingUser._id);
      if (!emailSended.accepted.includes(email)) {
        throw new Error("Falha ao enviar e-mail de verificação.");
      }

      return sendSuccessResponse(res, 200, "Sucesso!")
      
    } catch (error) {
      return sendErrorResponse(res, 500, "Erro ao reenviar o email de verificação.", error)
    }
    
  }

  async createUser(req, res) {
    const userId = new ObjectId();
    try {
      const { name, email, password } = req.body;

      const hashedPassword = await encryptPassword(password);
 
        const user = {
          _id: userId,
          name,
          email,
          password: hashedPassword,
          emailVerified: false,
        };

        const insertionResult = await this.insertUser(user);
        if (!insertionResult.acknowledged) {
          return sendErrorResponse(res, 500, "Falha ao inserir usuário.", insertionResult);
        }

        const emailSended = await sendEmailVerification(email, userId);
        if (!emailSended.accepted.includes(email)) {
            throw new Error("Falha ao enviar e-mail de verificação.");
        }

        return sendSuccessResponse(res, 200, "Sucesso!")

    } catch (error) {
      return sendErrorResponse(res, 500, "Erro ao salvar usuário.", error)
    }
  }

  async test(req, res) {
    return res.json("Hello world!")
  }

  async insertUser(user, res) {
    try {
      const collection = await getCollection("Users", "LearnMusicDatabase");
      const insertionResult = await collection.insertOne(user);

      return insertionResult
      
    } catch (err) {
      return sendErrorResponse(res, 500, "Erro ao salvar usuário.", err)
    }
  }

  async emailExists(email) {
    const existingUser = await getUserByEmail(email);
    return !!existingUser;
  }

  async validateLink(req, res) {
    try {
      const user = req.user

      if (user.length === 0) {
        return sendErrorResponse(res, 404, "Usuário não encontrado.")
      }

      const collection = await getCollection("Users", "LearnMusicDatabase");

      await collection.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { emailVerified: true } }
      );

      return sendSuccessResponse(res, 200, "Email verificado com sucesso.")
    } catch (error) {
      return sendErrorResponse(res, 500, "Erro ao validar link.")
    }
  }

  async authenticate(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return sendErrorResponse(res, 400, "Usuário não encontrado.", "Houve um erro na autenticação pois o usuário não foi encontrado.")
      }

      const isBlocked = await checkUserIsBlocked(user._id)
      const now = new Date();
      
      if (isBlocked && now < isBlocked) {
        return sendErrorResponse(res, 404, "Usuário bloqueado por limite de tentativas.", "Por favor, tente novamente mais tarde.")
      }

      const userData = {
        name: user.name,
        email: user.email,
      };
      return sendSuccessResponse(res, 200, "Usuário autenticado sucesso.", userData)
    } catch (error) {
      return sendErrorResponse(res, 500, "Erro ao autenticar usuário.", error)
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const existingUser = await getUserByEmail(email);

      if (!existingUser) {
        return sendErrorResponse(res, 404, "Email não cadastrado.", "Por favor, cadastre-se para acessar sua conta.")
      }
      
      const isBlocked = await checkUserIsBlocked(existingUser._id)
      const now = new Date();
      
      if (isBlocked && now < isBlocked) {
        return sendErrorResponse(res, 404, "Usuário bloqueado por limite de tentativas.", "Por favor, tente novamente mais tarde.")
      }

      if (!existingUser.emailVerified) {
        return sendErrorResponse(res, 403, "Email não verificado.", "Por favor, verifique seu email para acessar este recurso.")
      }

      const isMatch = await verifyPassword(password, existingUser.password);
      if (!isMatch) {
        await handleWrongPassword(existingUser)
        return sendErrorResponse(res, 401, "Email ou senha incorretos.", "Por favor, verifique seu email ou senha.")
      }

      const jwtToken = createTokenJWT(existingUser._id.toString());

      if (!jwtToken) {
        return sendErrorResponse(res, 500, "Ocorreu um erro ao obter o Token", "Tente novamente mais tarde ou entre em contato com o suporte.")
      }

      return sendSuccessResponse(res, 200, "Operação realizada com sucesso, usuário autenticado.", {token: jwtToken})

    } catch (error) {
      return sendErrorResponse(res, 500, "Ocorreu um erro durante o processo de login.", `Erro: ${error}`)
    }
  }

  async changeName(req, res) {
    try {
      const collection = await getCollection("Users", "LearnMusicDatabase");
      const { newName, oldName } = req.body;

      if (newName.length > 60)  {
        return sendErrorResponse(res, 404, "O nome não pode ter mais de 60 caracteres.")
      }
      const user = req.user;

      if (!user) {
        return sendErrorResponse(res, 401, "Usuário não encontrado durante a operação de mudança de nome.", "Tente novamente mais tarde ou entre em contato com o suporte.")
      }

      //configurações para update
      const filter = { _id: new ObjectId(user._id) };
      const update = {
        $set: {
          name: newName,
          oldName: oldName,
        },
      };

      const result = await collection.findOneAndUpdate(filter, update, {
        returnDocument: "after",
        upsert: false, // Não criar um novo documento se nenhum for encontrado
      });

      if (!result) {
        return sendErrorResponse(res, 500, "Erro ao alterar nome de usuário.", "Se o erro persistir entre em contato com o suporte.")
      }

      const userDataResponse = {
        name: result.name,
      };

      return sendSuccessResponse(res, 200, "Nome alterado com sucesso.", {newName: userDataResponse.name})

    } catch (error) {
      return sendErrorResponse(res, 500, "Ocorreu um erro.", `Error: , ${error}`)
    }
  }

  async deleteAccount(req, res) {
    try {
      const collection = await getCollection("Users", "LearnMusicDatabase");
      const { password } = req.body;

      if (!password) {
        return sendErrorResponse(res, 404, "Senha não fornecida.", "Por favor, forneça a senha para deletar a conta.")
      }
      const user = req.user;

      if (!user) {
        return sendErrorResponse(res, 401, "Usuário não encontrado.")
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const result = await collection.deleteOne({
          _id: new ObjectId(user._id),
        });

        if (!result.acknowledged) {
          return sendErrorResponse(res, 500, "Ocorreu um erro ao deletar o usuário.")
        }

        return sendSuccessResponse(res, 200, "Usuário deletado com sucesso!")

      } else {
        return sendErrorResponse(res, 401, "Senha inválida.")
      }
    } catch (error) {
      return sendErrorResponse(res, 500, "Erro ao deletar usuário.", `Erro: ${error}`)
    }
  }

  async sendPasswordRecovery(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendErrorResponse(res, 404, "Email não fornecido.", "Por favor, forneça o email para receber o link de recuperação de senha.")
      }
      const existingUser = await getUserByEmail(email);

      if (!existingUser) {
        return sendErrorResponse(res, 404, "Email não encontrado na base de dados.")
      }

      if (!existingUser.emailVerified) {
        return sendErrorResponse(res, 404, "Email não verificado.")
      }

      if (existingUser.lastEmailSended) {
        const checkTime = await checkLastEmailSended(res, existingUser)
        if (!checkTime) {
          return sendErrorResponse(res, 401, "Aguarde para solicitar um novo envio de email.")
        }
      } 

      const userId = existingUser._id.toString();
      const emailSended = await sendNewPasswordEmail(res, email, userId);
      console.log(emailSended)
      if (!emailSended.accepted.includes(email)) {
        throw new Error("Falha ao enviar e-mail de verificação.");
      }
      
      return sendSuccessResponse(res, 200, "Email enviado com sucesso.")

    } catch (error) {
      console.log(error)
      return sendErrorResponse(res, 404, "Ocorreu um erro durante a solicitação de recuperação de senha.", `Erro: ${error}`)
    }
  }


  async changePassword(req, res) {
    const collection = await getCollection("Users", "LearnMusicDatabase");
    const { password, newPassword } = req.body;

    const user = req.user;
    const isMatch = await bcrypt.compare(password, user.password);

    if (password == newPassword) {
      return sendErrorResponse(res, 401, "Por favor, para sua segurança escolha uma senha diferente da atual.")
    }
    if (isMatch) {
      const hashedNewPassword = await encryptPassword(newPassword);
      const filter = { _id: new ObjectId(user._id) };
      const update = {
        $set: {
          password: hashedNewPassword,
        },
      };

      const result = await collection.findOneAndUpdate(filter, update, {
        returnDocument: "after",
        upsert: false,
      });

      if (!result) {
        return sendErrorResponse(res, 501, "Erro ao alterar a senha do usuário.")
      }

      return sendSuccessResponse(res, 200, "Senha alterado com sucesso.")

    } else {
      return sendErrorResponse(res, 401, "Senha atual inválida.")
    }
  }

  async recoverPassword(req, res) {

    try {
      console.log("Entrou na rota?")
      const user = req.user;
      const newPassword = req.body.newPassword;
      const token = req.token;


      const data = await checkIfTokenWasUsed(token)
      if (data.used) {
        return sendErrorResponse(res, 401, "Token já foi utilizado.")
      }

      if (!user) {
        return sendErrorResponse(res, 401, "Usuário não encontrado.")
      }

      const isMatch = await bcrypt.compare(newPassword, user.password);

      if (isMatch) {
        return sendErrorResponse(res, 401, "Por favor, para sua segurança escolha uma senha diferente da atual.")
      }
      const collection = await getCollection("Users", "LearnMusicDatabase");
      const hashedNewPassword = await encryptPassword(newPassword);
      const filter = { _id: new ObjectId(user._id) };
      const update = {
        $set: {
          password: hashedNewPassword,
        },
      };

      const result = await collection.findOneAndUpdate(filter, update, {
        returnDocument: "after",
        upsert: false, // Não criar um novo documento se nenhum for encontrado
      });

      return sendSuccessResponse(res, 201, "Senha alterada com sucesso.")
    }
    catch (error) {
      return sendErrorResponse(res, 500, "Ocorreu um erro ao alterar a senha.")
    }
    
  }
}

module.exports = new DataController();
