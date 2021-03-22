import { checkAuth, logout } from "./auth";

export function loadDashboard() {
    checkAuth();
    setupLinks();

    
}

function setupLinks() {
    document.getElementById("connectionsBtn").addEventListener("click", function(e) { window.location.href = "./connections.html"});
    document.getElementById("logoutBtn").addEventListener("click", function(e) { logout() });
}