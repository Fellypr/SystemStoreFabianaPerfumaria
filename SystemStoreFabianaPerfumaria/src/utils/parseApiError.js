import axios from "axios";

function parseApiError(err) {
  const msgs = [];

  if (axios.isAxiosError(err)) {
    if (err.response) {
      const data = err.response.data;
      const status = err.response.status;
      
      if (data && typeof data === "object") {
        if (data.errors && typeof data.errors === "object") {
          Object.values(data.errors).forEach((v) => {
            if (Array.isArray(v)) msgs.push(...v);
            else if (v) msgs.push(String(v));
          });
        }
        
        if (msgs.length === 0) {
          if (data.message) msgs.push(String(data.message));
          if (data.detail) msgs.push(String(data.detail));
          if (data.error) msgs.push(String(data.error));
          if (data.title) msgs.push(String(data.title));
        }
      } else if (typeof data === "string" && data.length > 0) {
        msgs.push(data);
      }

      if (msgs.length === 0) {
        const statusMessages = {
          400: "Requisição inválida (400)",
          401: "Não autorizado - Faça login novamente (401)",
          403: "Acesso negado (403)",
          404: "Recurso não encontrado (404)",
          500: "Erro interno no servidor (500)",
          502: "Servidor indisponível (Bad Gateway)",
          503: "Serviço em manutenção",
        };
        msgs.push(statusMessages[status] || `Erro no servidor (Status ${status})`);
      }
    } else if (err.request) {
      msgs.push("Não foi possível conectar ao servidor. Verifique sua internet.");
    } else {
      msgs.push(`Erro ao configurar requisição: ${err.message}`);
    }
  } else if (err instanceof Error) {
    msgs.push(err.message);
  } else if (typeof err === "string") {
    msgs.push(err);
  }

  const finalMessage = msgs.length ? Array.from(new Set(msgs)).join("\n") : "Erro desconhecido ao processar requisição";
  
  return finalMessage;
}

export default parseApiError;
