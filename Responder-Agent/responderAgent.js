#!/usr/bin/env node

const os = require("os");
const { networkInterfaces } = require("os");
const readline = require("readline");
const { spawn } = require("child_process");

const SERVER_URL = "http://localhost:5001/api";
let token = null;
let responderId = "";
let responderName = "";
let responderStatus = "";
let responders = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to get human-readable OS name
const getReadableOS = () => {
  const platform = os.platform();
  switch (platform) {
    case "darwin":
      return "MacOS";
    case "win32":
      return "Windows";
    case "linux":
      return "Linux";
    default:
      return "Unknown OS";
  }
};

// Function to get the local IP address
const getLocalIP = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.family === "IPv4") {
        return net.address;
      }
    }
  }
  return "Unknown IP";
};

// Register Responder
const registerResponder = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/responders/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: responderName || `Responder-${Math.floor(Math.random() * 1000)}`,
      }),
    });

    const data = await response.json();
    if (response.status !== 201 && response.status !== 200) {
      console.log(`⚠️ Registration failed: ${data.error || "Unknown error"}`);
      return;
    }

    console.log(data);
    if (!data || !data.token) {
      console.log("⚠️ Invalid response from server.");
      return;
    }

    token = data.token;
    responderId = data.id;
    responderName = data.name;
    responderStatus = data.status;
    console.log(
      `✅ '${responderName}' registered successfully with token: ${token}`
    );
    if (responderStatus === "healthy") await requestJobAssignment(responderId);
  } catch (error) {
    console.error("❌ Registration failed:", error.message);
  }
};

// Deregister Responder
const deregisterResponder = async () => {
  if (!token) {
    console.log("⚠️  No active responder session to deregister.");
    return;
  }
  try {
    const response = await fetch(`${SERVER_URL}/responders/deregister`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (response.status === 400) {
      console.log("⚠️ Responder is already deregistered.");
      return;
    }

    console.log("✅ Responder deregistered successfully.");
  } catch (error) {
    console.error("❌ Deregistration failed:", error.message);
  }
};

// Request Job Assignment
const requestJobAssignment = async (responderId) => {
  try {
    const response = await fetch(`${SERVER_URL}/jobs/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responderId }),
    });
    const data = await response.json();
    if (data.jobId) {
      await processJob(data.jobId);
    }
  } catch (error) {
    console.error("❌ Error checking for pending jobs:", error.message);
  }
};

// Process Job and Send Result Back with IP and OS info
const processJob = async (jobId) => {
  try {
    console.log(`🏁 Processing job ${jobId}`);
    // Simulate job processing time
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000
      )
    );

    const ipAddress = getLocalIP();
    const operatingSystem = getReadableOS();

    const response = await fetch(`${SERVER_URL}/jobs/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        jobId,
        result: "Completed successfully",
        ip_address: ipAddress,
        operating_system: operatingSystem,
      }),
    });
    console.log(
      `✅ Job ${jobId} completed successfully, system details updated.`
    );

    const data = await response.json();
    await requestJobAssignment(data.responderId);
  } catch (error) {
    console.error("❌ Error completing job:", error.message);
  }
};

// Function to spawn multiple responders
const spawnMultipleAgents = async (count) => {
  console.log("🚀 Starting " + count + " responder agents...\n");

  for (var i = 0; i < count; i++) {
    (function (index) {
      console.log("⚡ Responder " + (index + 1) + " started.");
      var responder = spawn("node", ["responderAgent.js"], { stdio: "pipe" });
      responder.stdin.write("register\n");

      responder.stdout.on("data", function (data) {
        console.log(
          "[Responder " + (index + 1) + "] " + data.toString().trim()
        );
      });
      responder.stderr.on("data", function (data) {
        console.error(
          "[Responder " + (index + 1) + " Error] " + data.toString().trim()
        );
      });
      responders.push(responder);
    })(i);
  }
};

// Function to deregister all spawned responders
const deregisterAllAgents = async () => {
  if (responders.length === 0) {
    console.log("⚠️ No spawned responders to deregister.");
    return;
  }
  console.log("⚠️  Deregistering all spawned responders...");
  responders.forEach(function (responder) {
    if (responder.stdin) {
      responder.stdin.write("deregister\n");
      responder.stdin.write("exit\n");
    }
  });
  responders = [];
  console.log("✅ All responders deregistered.");
};

// User Input Handler
function startCLI() {
  console.clear();
  console.log(`
██████╗ ███████╗███████╗██████╗  ██████╗ ███╗   ██╗██████╗ ███████╗██████╗ 
██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║██╔══██╗██╔════╝██╔══██╗
██████╔╝█████╗  ███████╗██████╔╝██║   ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝
██╔══██╗██╔══╝  ╚════██║██╔═══╝ ██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗
██║  ██║███████╗███████║██║     ╚██████╔╝██║ ╚████║██████╔╝███████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝
`);
  console.log(`
              █████╗  ██████╗ ███████╗███╗   ██╗████████╗
              ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
              ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
              ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
              ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
              ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
`);
  console.log(`
  📡 Welcome to **AIR Server Responder Agent**
  🔹 Manage and monitor responder agents seamlessly.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛠️ **Commands:**
  📌  Type 'register'         → Register an agent to AIR-Server
  📌  Type 'deregister'       → Deregister an agent from AIR-Server
  📌  Type 'register<number>' → Spawn multiple agents (e.g., 'register10')
  📌  Type 'deregisterall'    → Deregister all spawned agents
  📌  Type 'exit'             → Quit the application
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  rl.on("line", async function (input) {
    input = input.trim().toLowerCase();

    if (input === "register") {
      await registerResponder();
    } else if (input === "deregister") {
      await deregisterResponder();
    } else if (
      input.startsWith("register") &&
      !isNaN(parseInt(input.slice(8)))
    ) {
      // Extract the number from 'register<number>'
      let numAgents = parseInt(input.slice(8));
      if (numAgents > 0) {
        await spawnMultipleAgents(numAgents);
      } else {
        console.log("❌ Invalid number of agents.");
      }
    } else if (input === "deregisterall") {
      await deregisterAllAgents();
    } else if (input === "exit") {
      console.log("🚀 Exiting...");
      await deregisterResponder();
      await deregisterAllAgents();
      rl.close();
      process.exit(0);
    } else {
      console.log(
        "❌ Unknown command. Please type 'register', 'deregister', 'register<number>', 'deregisterAll', or 'exit'."
      );
    }
  });
}

// Handle process exit to mark responder as deregistered
process.on("SIGINT", async () => {
  console.log(" Marking responder as deregistered before shutting down...");
  await deregisterResponder();
  await deregisterAllAgents();
  process.exit(0);
});

startCLI();
