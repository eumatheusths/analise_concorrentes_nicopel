export default async function handler(req, res) {
  // Este é um teste para ver se o servidor está lendo as variáveis de ambiente
  
  const emailKey = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  const report = {
    emailEncontrado: false,
    comprimentoDaChavePrivada: 0,
    mensagem: "",
  };

  if (emailKey && emailKey.length > 0) {
    report.emailEncontrado = true;
  } else {
    report.mensagem += "ERRO: GOOGLE_SERVICE_ACCOUNT_EMAIL não foi encontrado. ";
  }

  if (privateKey && privateKey.length > 0) {
    report.comprimentoDaChavePrivada = privateKey.length;
  } else {
    report.mensagem += "ERRO: GOOGLE_PRIVATE_KEY não foi encontrado.";
  }

  if (report.emailEncontrado && report.comprimentoDaChavePrivada > 0) {
     report.mensagem = "SUCESSO: Ambas as chaves foram lidas pelo servidor!";
  }

  // Isto vai retornar o relatório de diagnóstico
  return res.status(200).json(report);
}