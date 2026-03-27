import parseApiError from "./parseApiError";

const mockAxiosError = (response) => ({
  isAxiosError: true,
  response: response,
  message: "Request failed"
});

const mockNetworkError = () => ({
  isAxiosError: true,
  request: {},
  message: "Network Error"
});

const err1 = mockAxiosError({
  status: 400,
  data: {
    errors: {
      Nome: ["O nome é obrigatório"],
      Preco: ["O preço deve ser maior que zero"]
    }
  }
});
parseApiError(err1);

const err2 = mockAxiosError({
  status: 500,
  data: { message: "Erro interno no banco de dados" }
});
parseApiError(err2);

const err3 = mockNetworkError();
parseApiError(err3);

const err4 = mockAxiosError({ status: 404, data: null });
parseApiError(err4);

const err5 = new Error("Algo quebrou no código");
parseApiError(err5);
