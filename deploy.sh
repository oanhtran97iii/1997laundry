#!/bin/bash
# deploy.sh for 1997-laundry

IP="103.97.127.31"
PORT="2018"
USER="root"

echo "================================================"
echo "🚀 1997 Laundry - Production VPS Deployer"
echo "================================================"
echo "Target Host: $USER@$IP:$PORT"
echo ""

# Step 1: Set project directory on VPS
TARGET_DIR="/var/www/1997-laundry"

echo "✅ Target Directory: $TARGET_DIR"
echo ""

# Step 2: Upload updated files
echo "📤 Uploading updated pages, styles, and assets..."
ssh -p $PORT $USER@$IP "mkdir -p $TARGET_DIR/uploads"
scp -P $PORT index.html bedding.html booking.html app.js index.css pay.html shoes.html report.html server.js bot_manager.js logo.png .env package.json $USER@$IP:$TARGET_DIR/

if [ $? -ne 0 ]; then
    echo "❌ File upload failed. Please verify your password and try again."
    exit 1
fi

echo "✅ Upload completed successfully!"
echo ""

# Step 3: Restart PM2
echo "🔄 Restarting application on VPS via PM2..."
ssh -p $PORT $USER@$IP "cd $TARGET_DIR && pm2 restart 1997laundry || pm2 restart server || pm2 restart app || pm2 restart index"

if [ $? -ne 0 ]; then
    echo "⚠️  Could not restart PM2 automatically. You might need to restart it manually."
else
    echo "✅ Application restarted successfully!"
fi

echo ""
echo "================================================"
echo "🎉 Deployment to 1997laundry.com completed!"
echo "================================================"
