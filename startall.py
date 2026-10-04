"""Start the RechargeX Flask API and Vite frontend together on Windows."""
import os
import shutil
import signal
import subprocess
import sys
import threading
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(ROOT, "backend")
frontend_dir = os.path.join(ROOT, "frontend")

processes = [
    subprocess.Popen([sys.executable, "app.py"], cwd=backend_dir),
    subprocess.Popen(["npm.cmd" if os.name == "nt" else "npm", "run", "dev", "--", "--host", "0.0.0.0"], cwd=frontend_dir),
]
required_processes = list(processes)

cloudflared = shutil.which("cloudflared")
if not cloudflared:
    installed_cloudflared = r"C:\Program Files (x86)\cloudflared\cloudflared.exe"
    if os.path.exists(installed_cloudflared):
        cloudflared = installed_cloudflared
if cloudflared:
    tunnel = subprocess.Popen(
        [cloudflared, "tunnel", "--url", "http://localhost:5173", "--no-autoupdate"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    processes.append(tunnel)

    def show_tunnel_output():
        for line in tunnel.stdout:
            if "trycloudflare.com" in line:
                print(f"PUBLIC LINK: {line.strip()}", flush=True)

    threading.Thread(target=show_tunnel_output, daemon=True).start()

print("RechargeX is starting...")
print("Frontend: http://localhost:5173/")
print("Backend:  http://localhost:5000/api/health")
if cloudflared:
    print("Cloudflare Tunnel: waiting for a public trycloudflare.com URL...")
else:
    print("Cloudflare Tunnel: not installed; local-only mode.")
print("Ensure MySQL and Ollama are running before testing database or chatbot features.")

try:
    while True:
        time.sleep(1)
        if any(process.poll() is not None for process in required_processes):
            break
except KeyboardInterrupt:
    print("Stopping RechargeX...")
finally:
    for process in processes:
        if process.poll() is None:
            process.send_signal(signal.CTRL_BREAK_EVENT if os.name == "nt" else signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
