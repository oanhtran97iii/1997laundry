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
    
    # Check all logs for any mentions of webhook or pancake or Susan
    commands = [
        "grep -i 'webhook' /root/.pm2/logs/1997laundry-out.log | tail -n 50",
        "grep -i 'susan' /root/.pm2/logs/1997laundry-out.log || true",
        "grep -i 'error' /root/.pm2/logs/1997laundry-error.log | tail -n 50 || true"
    ]
    
    for cmd in commands:
        print(f"\nRunning: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode('utf-8'))
        
    ssh.close()

if __name__ == "__main__":
    main()
