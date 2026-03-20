import { useState,useEffect } from "react"
import parseApiError from "../utils/parseApiError"
import axios from "axios"
export const UseBuscaProduto = () =>{
    const [produtos,setProdutos] = useState([])
    const [nomeDoProduto,setNomeDoProduto] = useState("")
    const [codigoDoProduto,setCodigoDoProduto] = useState("")
    const [marcaDoProduto,setMarcaDoProduto] = useState("")
    const [erro,setErro] = useState(null)
    const [loading,setLoading] = useState(false)
    const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

    const envioDeDados = {
        NomeDoProduto: nomeDoProduto,
        Marca: marcaDoProduto,
        CodigoDeBarra:codigoDoProduto
    }

    async function ProdutosListados(){
        try{
            setLoading(true)
            const response = await axios.post(`${url}/AdicionarProduto/BuscarProdutoEstoque`,envioDeDados,{
                headers: {
                    "Content-Type": "application/json",
                },
            })
            setProdutos(response.data)
        }catch(error){
            const msg = parseApiError(error)
            setErro(msg)
            console.error(msg)
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        ProdutosListados()
    },[nomeDoProduto,marcaDoProduto,codigoDoProduto])

    return {
        produtos,
        nomeDoProduto,
        setNomeDoProduto,
        codigoDoProduto,
        setCodigoDoProduto,
        marcaDoProduto,
        setMarcaDoProduto,
        erro,
        setErro,
        ProdutosListados,
        loading
    }
}
