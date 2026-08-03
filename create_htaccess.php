<?php
$content = '# 0. URL Rewriting for Clean URLs and Ad Tracking redirects (302 Browser Redirects)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Redirect specific old ad campaign routes
    RewriteRule ^laundy-service/?$ /express-laundry.html [R=302,L,QSA]
    RewriteRule ^laundry-service/?$ /express-laundry.html [R=302,L,QSA]

    # Redirect clean URLs to actual .html files (prevents broken assets)
    RewriteRule ^dry-cleaning/?$ /dry-cleaning.html [R=302,L,QSA]
    RewriteRule ^express-laundry/?$ /express-laundry.html [R=302,L,QSA]
    RewriteRule ^shoes-cleaning/?$ /shoes-cleaning.html [R=302,L,QSA]
    RewriteRule ^steam-press/?$ /steam-press.html [R=302,L,QSA]
    RewriteRule ^curtain-cleaning/?$ /curtain-cleaning.html [R=302,L,QSA]
    RewriteRule ^order/?$ /order.html [R=302,L,QSA]

    # Redirect for /vi/ subfolder clean URLs
    RewriteRule ^vi/dry-cleaning/?$ /vi/dry-cleaning.html [R=302,L,QSA]
    RewriteRule ^vi/express-laundry/?$ /vi/express-laundry.html [R=302,L,QSA]
    RewriteRule ^vi/shoes-cleaning/?$ /vi/shoes-cleaning.html [R=302,L,QSA]
    RewriteRule ^vi/steam-press/?$ /vi/steam-press.html [R=302,L,QSA]
    RewriteRule ^vi/curtain-cleaning/?$ /vi/curtain-cleaning.html [R=302,L,QSA]
    RewriteRule ^vi/order/?$ /vi/order.html [R=302,L,QSA]
</IfModule>

# 1. Enable Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# 2. Leverage Browser Caching (Expires Headers)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    
    # CSS and JS (1 week cache)
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType application/x-javascript "access plus 1 week"
    
    # Images (1 year cache)
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    
    # Fonts (1 year cache)
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>';

if (file_put_contents('.htaccess', $content)) {
    echo "<h1>Success! .htaccess file created successfully on Hostinger!</h1>";
    echo "<p>All tracking URLs should now work perfectly. You can close this page.</p>";
    unlink(__FILE__); // self-destruct for security
} else {
    echo "<h1>Error! Failed to write .htaccess file. Please check folder permissions.</h1>";
}
?>
