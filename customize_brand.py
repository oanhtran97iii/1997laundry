import os

files_to_modify = ['index.html', 'booking.html', 'pay.html', 'server.js', 'bot_manager.js']

replacements = [
    ("Nice Fold Saigon", "1997 Premium Laundry"),
    ("Nice Fold Assistant", "1997 Laundry Assistant"),
    ("Nice Fold", "1997 Laundry"),
    ("nicefoldsaigon.vn", "1997laundry.com"),
    ("Nicefold Saigon Laundry", "1997 Premium Laundry"),
    ("nice-fold", "1997-laundry")
]

for filename in files_to_modify:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        for target, replacement in replacements:
            content = content.replace(target, replacement)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Customized {filename}")
