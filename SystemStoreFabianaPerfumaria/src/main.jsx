import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter,Route,Routes} from "react-router-dom"
import './index.css'
import App from './App.jsx'

//pages
import ScreenLogin from './Models/ScreenLogin/ScreenLogin.jsx'
import ScreenMain from './Models/ScreenMain/ScreenMain.jsx'
import AdicionarProduto from './Models/pages/AdicionarProduto/AdicionarProduto.jsx'
import ExcluirProdutos from './Models/pages/ExcluirProdutos/ExcluirProdutos.jsx'
import HistoricoEEstatistica from './Models/pages/HistoricoEEstatistica/HistoricoEEstatistica.jsx'
import EditarProduto from './Models/pages/EditarProduto/EditarProduto.jsx'
import RealizarUmaVenda from './Models/pages/RealizarUmaVenda/RealizarUmaVenda.jsx'
import CadastroDeClientes from './Models/pages/CadastroDeCliente/CadastroDeClientes.jsx'
import EditarCliente from './Models/pages/EditarClientes/EditarCliente.jsx'
import HistoricoDeVenda from './Models/pages/HistoricoDeVenda/HistoricoDeVenda.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
          <Routes>
              <Route element={<App/>}>
                  <Route path="/" element={<ScreenLogin/>}/>
                  <Route path='/ScreenMain' element={<ScreenMain/>}/>
                  <Route path='/AdicionarProduto' element={<AdicionarProduto/>}/>
                  <Route path='/ExcluirProdutos' element={<ExcluirProdutos/>}/>
                  <Route path='/HistoricoEEstatistica' element={<HistoricoEEstatistica/>}/>
                  <Route path='/EditarProduto' element={<EditarProduto/>}/>
                  <Route path='/RealizarUmaVenda' element={<RealizarUmaVenda/>}/>
                  <Route path='/CadastroDeClientes' element={<CadastroDeClientes/>}/>
                  <Route path='/EditarCliente' element={<EditarCliente/>}/>
                  <Route path='/HistoricoDeVenda' element={<HistoricoDeVenda/>}/>

                  



              </Route>
          </Routes> 
    </BrowserRouter>
  </StrictMode>,
)
