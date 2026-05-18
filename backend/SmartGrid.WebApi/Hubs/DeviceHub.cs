using Microsoft.AspNetCore.SignalR;

namespace SmartGrid.WebApi.Hubs
{
    public class DeviceHub : Hub
    { 
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        public async Task LeaveAdminGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
        }
    }
}
