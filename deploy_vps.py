import os
import paramiko

# Connection Details
IP = "103.97.127.31"
PORT = 2018
USER = "root"
PASS = "Q0HS3SsOwH"
TARGET_DIR = "/var/www/1997-laundry"

# Files to upload
files_to_upload = [
    "index.html",
    "bedding.html",
    "",
    "app.js",
    "index.css",
    "pay.html",
    "shoes.html",
    "report.html",
    "server.js",
    "bot_manager.js",
    "logo.png",
    "logo-dark.svg",
    "logo-light.svg",
    ".env",
    "package.json",
    # 12 SEO Landing Pages
    "laundry-service-le-thanh-ton.html",
    "laundry-near-caravelle-hotel-saigon.html",
    "laundry-near-sheraton-saigon.html",
    "laundry-near-rex-hotel-saigon.html",
    "laundry-near-park-hyatt-saigon.html",
    "laundry-service-thao-dien.html",
    "laundry-service-masteri-thao-dien.html",
    "laundry-service-vinhomes-central-park.html",
    "how-much-does-laundry-cost-in-vietnam.html",
    "laundry-in-bui-vien-avoid-scams.html",
    "hotel-laundry-vs-outside-services-saigon.html",
    "best-same-day-dry-cleaning-services-district-1.html"
]

def main():
    print("🚀 Starting automated Python deployer to VPS...")
    
    # Establish SSH Client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"🔌 Connecting to {USER}@{IP}:{PORT}...")
        ssh.connect(IP, port=PORT, username=USER, password=PASS, timeout=10)
        print("✅ SSH Connection established.")
        
        # Ensure target directory and uploads directory exist
        stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {TARGET_DIR}/uploads")
        stdout.read() # block until done
        
        # Upload Files via SFTP
        print("📤 Opening SFTP session to upload files...")
        sftp = ssh.open_sftp()
        
        for file_name in files_to_upload:
            local_path = file_name
            remote_path = f"{TARGET_DIR}/{file_name}"
            if os.path.exists(local_path):
                print(f"  Uploading {local_path} -> {remote_path}...")
                sftp.put(local_path, remote_path)
            else:
                print(f"  ⚠️ File not found locally: {local_path}")
                
        sftp.close()
        print("✅ All files uploaded successfully.")
        
        # Restart PM2 process
        print("🔄 Clearing port 4000 and restarting PM2 process...")
        commands = [
            f"cd {TARGET_DIR}",
            "npx pm2 delete 1997laundry || true",
            "fuser -k 4000/tcp || kill -9 $(lsof -t -i:4000) || true",
            "sleep 2",
            "npx pm2 start server.js --name \"1997laundry\""
        ]
        full_command = " && ".join(commands)
        print(f"Executing: {full_command}")
        
        stdin, stdout, stderr = ssh.exec_command(full_command)
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        
        print("\n--- STDOUT ---")
        print(out)
        print("--- STDERR ---")
        print(err)
        print("--------------")
        
        # Check if running on port 4000
        stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep 4000")
        netstat_out = stdout.read().decode('utf-8')
        print(f"Port 4000 status:\n{netstat_out}")
        
        print("🎉 Deployment completed successfully!")
        
    except Exception as e:
        print(f"❌ Error occurred during deployment: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
