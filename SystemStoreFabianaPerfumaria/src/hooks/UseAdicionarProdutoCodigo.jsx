import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
export function UseAdicionarProdutoCodigo() {
    const [codigo, setCodigo] = useState("");
    const [produto, setProduto] = useState(() => {
        const salvo = localStorage.getItem("produto");
        return salvo ? JSON.parse(salvo) : [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mensagemCarregamento, setMensagemCarregamento] = useState(null);
    const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

    // Sincroniza automaticamente qualquer alteração dos produtos com o localStorage
    useEffect(() => {
        if (produto && produto.length > 0) {
            localStorage.setItem("produto", JSON.stringify(produto));
        }
    }, [produto]);

    async function iniciadoScraping(){
        setError(null);
        setMensagemCarregamento("Conectando ao servidor...");
        setLoading(true);
        try {
            let connection = new signalR.HubConnectionBuilder()
                .withUrl("http://192.168.0.139:5080/scrapingHub")
                .withAutomaticReconnect()
                .build();

            await connection.start();
            const connectionId = await connection.invoke("GetConnectionId");
            connection.on("ReceiveLog", (mensagem) => {
                setMensagemCarregamento(mensagem);
            });
            const response = await axios.post(`${url}/AdicionarProduto/iniciar-scraping`,
            {
                ChaveAcesso: codigo,    
                ConnectionId: connectionId 
            },
            {
                headers:{
                    "Content-Type": "application/json",
                }
            }
        );
            if (response.status === 200) {
                await ValidarProdutos(response.data);
            } else {
                setError("Erro ao adicionar o produto.");
                toast.error("Falha ao iniciar o scraping. Verifique o servidor.");
            }  
        } catch (error) {
            console.error(`Erro ao adicionar produto:`, error);
            setError("Erro ao adicionar o produto.");
            toast.error("Erro de conexão ao tentar iniciar o scraping.");
        } finally {
            setLoading(false);
            setMensagemCarregamento(null);
        }
    }
    async function ValidarProdutos(produtos){
        setError(null);
        try{
            const response = await axios.post(`${url}/AdicionarProduto/verificar-produtos`, produtos);
            if (response.status === 200) {
                setProduto(response.data);
                localStorage.setItem("produto", JSON.stringify(response.data));
                toast.success(`${response.data.length} produto(s) validado(s) com sucesso!`);
            } else {
                setError("Erro ao validar os produto.");
                toast.error("Falha ao validar os produtos. Tente novamente.");
            }
        } catch(error) {
            console.error(`Erro ao validar produto:`, error);
            setError("Erro ao validar os produto.");
            toast.error("Erro de conexão ao validar os produtos.");
        }
    }
    async function FinalizarProdutos(produtos){
        setError(null);
        setLoading(true);
        try{
            const response = await axios.post(`${url}/AdicionarProduto/adicionar-produtos`, produtos);
            if (response.status === 200) {
                setProduto([]);
                localStorage.removeItem("produto");
                toast.success("Produtos salvos no banco com sucesso! ✅");
            } else {
                setError("Erro ao adicionar o produto.");
                toast.error("Falha ao salvar os produtos. Tente novamente.");
            }
        } catch(error) {
            console.error(`Erro ao finalizar o produto:`, error);
            setError("Erro ao finalizar o produto.");
            toast.error("Erro de conexão ao salvar os produtos.");
        } finally {
            setLoading(false);
            setMensagemCarregamento(null);
        }
    }

    return { codigo, setCodigo, iniciadoScraping, produto, setProduto, loading, error, mensagemCarregamento, FinalizarProdutos };
}
