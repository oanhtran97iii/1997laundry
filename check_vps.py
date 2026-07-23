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
    
    # 1. Check PM2 status
    stdin, stdout, stderr = ssh.exec_command("npx pm2 status")
    print(f"PM2 Status:\n{stdout.read().decode('utf-8')}")
    
    # 2. Check netstat for port 4000
    stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep 4000")
    print(f"Port 4000 status:\n{stdout.read().decode('utf-8')}")
    
    # 3. Check logs of 1997laundry
    stdin, stdout, stderr = ssh.exec_command("tail -n 30 /root/.pm2/logs/1997laundry-out.log")
    print(f"PM2 Out Logs:\n{stdout.read().decode('utf-8')}")
    
    stdin, stdout, stderr = ssh.exec_command("tail -n 30 /root/.pm2/logs/1997laundry-error.log")
    print(f"PM2 Error Logs:\n{stdout.read().decode('utf-8')}")
    
    ssh.close()

if __name__ == "__main__":
    main()
