 import axios from "axios"

 function parseApiError(err){
        if (axios.isAxiosError(err) && err.response){
            const data = err.response.data
            const msgs = []
            if (data && typeof data === "object"){
                if (data.errors && typeof data.errors === "object"){
                    Object.values(data.errors).forEach(v=>{
                        if (Array.isArray(v)) msgs.push(...v)
                        else if (v) msgs.push(String(v))
                    })
                }
                if (data.title) msgs.push(String(data.title))
                if (data.detail) msgs.push(String(data.detail))
                if (data.message) msgs.push(String(data.message))
            }else if (typeof data === "string"){
                msgs.push(data)
            }
            const statusMsg = err.response.status ? `Status ${err.response.status}` : ""
            return msgs.length ? msgs.join("\n") : statusMsg || "Erro na requisição"
        }
        return err?.message || "Erro inesperado"

}

export default parseApiError
