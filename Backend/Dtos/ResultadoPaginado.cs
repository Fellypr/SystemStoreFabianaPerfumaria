using System.Collections.Generic;

namespace Backend.Dtos
{
    public class ResultadoPaginado<T>
    {
        public List<T> Itens { get; set; } = new List<T>();
        public int TotalRegistros { get; set; }
        public int PaginaAtual { get; set; }
        public int TotalPaginas { get; set; }
    }
}
