using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Backend.Hubs
{
    public class ScrapingHub : Hub
    {
        public string GetConnectionId() => Context.ConnectionId;
    }
}