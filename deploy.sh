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
scp -P $PORT -r assets/ shoes_cleaning_premium.jpg bedding_laundry_premium.jpg folding_clothes.jpg hero_laundry.png laundry_room.jpg folding_black_hearts.jpg team_member_1.jpg team_member_2.jpg team_member_3.jpg team_member_4.jpg team_member_5.jpg team_member_6.jpg team_member_7.jpg team_member_8.jpg sitemap.html sitemap.xml index.html bedding.html app.js index.css pay.html shoes.html report.html server.js bot_manager.js logo.png logo-dark.svg logo-light.svg .env package.json laundry-service-le-thanh-ton.html laundry-near-caravelle-hotel-saigon.html laundry-near-sheraton-saigon.html laundry-near-rex-hotel-saigon.html laundry-near-park-hyatt-saigon.html laundry-service-thao-dien.html laundry-service-masteri-thao-dien.html laundry-service-vinhomes-central-park.html how-much-does-laundry-cost-in-vietnam.html laundry-in-bui-vien-avoid-scams.html hotel-laundry-vs-outside-services-saigon.html best-same-day-dry-cleaning-services-district-1.html $USER@$IP:$TARGET_DIR/

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
