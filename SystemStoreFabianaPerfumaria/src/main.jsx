import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter,Route,Routes} from "react-router-dom"
import './index.css'
import App from './App.jsx'

//pages
import ScreenMain from './Models/ScreenMain/ScreenMain.jsx'
import AdicionarProduto from './Models/pages/AdicionarProduto/AdicionarProduto.jsx'
import ExcluirProdutos from './Models/pages/ExcluirProdutos/ExcluirProdutos.jsx'
import HistoricoEEstatistica from './Models/pages/HistoricoEEstatistica/HistoricoEEstatistica.jsx'
import RealizarUmaVenda from './Models/pages/RealizarUmaVenda/RealizarUmaVenda.jsx'
import CadastroDeClientes from './Models/pages/CadastroDeCliente/CadastroDeClientes.jsx'
import EditarCliente from './Models/pages/EditarClientes/EditarCliente.jsx'
import HistoricoDeVenda from './Models/pages/HistoricoDeVenda/HistoricoDeVenda.jsx'
import ProdutosEmEstoque from './Models/pages/ProdudosEmEstoques/ProdutosEmEstoque.jsx'
import HistoricoDeFicha from './Models/pages/HistoricoDeFicha/HistoricoDeFicha.jsx'
import BuscarPreço from './Models/pages/BuscarPreço/BuscarPreço.jsx'
import MontarKit from './Models/pages/MontarKit/MontarKit.jsx'
import Comissao from './Models/pages/Comissão/Comissao.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
          <Routes>
              <Route element={<App/>}>
                  <Route path="/" element={<ScreenMain/>}/>
                  <Route path='/AdicionarProduto' element={<AdicionarProduto/>}/>
                  <Route path='/ExcluirProdutos' element={<ExcluirProdutos/>}/>
                  <Route path='/HistoricoEEstatistica' element={<HistoricoEEstatistica/>}/>
                  <Route path='/RealizarUmaVenda' element={<RealizarUmaVenda/>}/>
                  <Route path='/CadastroDeClientes' element={<CadastroDeClientes/>}/>
                  <Route path='/EditarCliente' element={<EditarCliente/>}/>
                  <Route path='/HistoricoDeVenda' element={<HistoricoDeVenda/>}/>
                  <Route path='/ProdutosEmEstoques' element={<ProdutosEmEstoque/>}/>
                  <Route path='/HistoricoDeFicha' element={<HistoricoDeFicha/>}/>
                  <Route path='/MontarKit' element={<MontarKit/>}/>
                  <Route path='/BuscarPreço' element={<BuscarPreço/>}/>
                  <Route path='/graciele' element={<Comissao/>}/>
              </Route>
          </Routes> 
    </BrowserRouter>
  </StrictMode>,
)
