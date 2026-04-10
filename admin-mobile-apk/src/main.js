import "./style.css";
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const SUPABASE_URL = "https://gwgfrcwwawbewsobvels.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Z2ZyY3d3YXdiZXdzb2J2ZWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDY2MDEsImV4cCI6MjA5MTM4MjYwMX0.--HWAMEnDn27XsdtuWVn4Teij5sbOsr1UdlLcn62GQc";
const ADMIN_WEB_URL = "https://openworldchats.vercel.app/admin/";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.querySelector("#app").innerHTML = `
  <main class="app">
    <h1>OpenWorld Admin Mobile</h1>
    <p class="sub">Realtime payment alerts for Daniel Nao</p>

    <section class="card">
      <h2>Live Status</h2>
      <p id="status-line">Connecting to payment stream...</p>
      <button id="open-admin" class="btn">Open Admin Console</button>
      <button id="refresh" class="btn secondary">Refresh Pending Count</button>
      <p id="pending-count" class="meta">Pending approvals: --</p>
    </section>

    <section class="card">
      <h2>Latest Payment Requests</h2>
      <div id="feed" class="feed"></div>
    </section>
  </main>
`;

const statusLine = document.getElementById("status-line");
const feed = document.getElementById("feed");
const pendingCount = document.getElementById("pending-count");
const openAdminBtn = document.getElementById("open-admin");
const refreshBtn = document.getElementById("refresh");

async function ensureNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    await LocalNotifications.requestPermissions();
  }
}

async function notifyNewPayment(payload) {
  const name = payload?.name || "Unknown";
  const phone = payload?.phone || "No phone";
  const code = payload?.mpesa_code || "No code";
  const body = `${name} • ${phone} • ${code}`;

  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 2147483647,
          title: "New Payment Request",
          body,
          schedule: { at: new Date(Date.now() + 250) }
        }
      ]
    });
    return;
  }

  // Web fallback during local testing.
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("New Payment Request", { body });
  }
}

function appendFeedItem(item) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <strong>${item.name || "-"}</strong>
    <span>${item.phone || "-"}</span>
    <span>${item.mpesa_code || "-"}</span>
    <span class="badge">${item.status || "pending"}</span>
  `;
  feed.prepend(row);
}

async function loadLatest() {
  const { data, error } = await supabase
    .from("payment_requests")
    .select("name,phone,mpesa_code,status,id")
    .order("id", { ascending: false })
    .limit(10);

  if (error) {
    statusLine.textContent = "Failed to load latest requests.";
    return;
  }

  feed.innerHTML = "";
  data.forEach(appendFeedItem);
}

async function updatePendingCount() {
  const { count, error } = await supabase
    .from("payment_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    pendingCount.textContent = "Pending approvals: unavailable";
    return;
  }
  pendingCount.textContent = `Pending approvals: ${count ?? 0}`;
}

function startRealtime() {
  const channel = supabase
    .channel("admin-payment-alerts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "payment_requests",
        filter: "status=eq.pending"
      },
      async (event) => {
        appendFeedItem(event.new);
        await updatePendingCount();
        await notifyNewPayment(event.new);
      }
    )
    .subscribe((state) => {
      statusLine.textContent =
        state === "SUBSCRIBED"
          ? "Connected. Waiting for new payment requests..."
          : `Realtime status: ${state}`;
    });

  return channel;
}

openAdminBtn.addEventListener("click", () => {
  window.open(ADMIN_WEB_URL, "_blank");
});

refreshBtn.addEventListener("click", async () => {
  await loadLatest();
  await updatePendingCount();
});

(async function init() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  await ensureNotificationPermission();
  await loadLatest();
  await updatePendingCount();
  startRealtime();
})();
