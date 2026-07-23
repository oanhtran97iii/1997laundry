import paramiko

# Connection Details
IP = "103.97.127.31"
PORT = 2018
USER = "root"
PASS = "Q0HS3SsOwH"

def main():
    print("🔌 Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(IP, port=PORT, username=USER, password=PASS, timeout=10)
    print("✅ Connected.")
    
    # Search for Pancake in PM2 out logs
    command = "grep -i 'pancake' /root/.pm2/logs/1997laundry-out.log | tail -n 50"
    stdin, stdout, stderr = ssh.exec_command(command)
    print(f"Pancake Webhook logs:\n{stdout.read().decode('utf-8')}")
    
    ssh.close()

if __name__ == "__main__":
    main()
