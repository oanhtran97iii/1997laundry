# 1997 Laundry - Premium Web Landing Page

A premium, modern, and fully responsive landing page built for **1997 Laundry** targeting foreigners, expats, and tourists in Saigon (HCMC), Vietnam. 

## Features
- **Modern Aesthetics**: Built with a sleek Space Blue (`#09002d`) and Brand Orange (`#f26a19`) color theme. High-fidelity layouts matching tech-startup styles.
- **Dynamic Cost Estimator**: Users can select standard wash & fold, dry cleaning, or shoe spa services, adjusting weights/quantities with a range slider to see instant cost calculations in VND and USD.
- **Interactive Capabilities Slider**: Clean tab selectors that showcase different laundry treatments with smooth progress bars and micro-interactions (e.g. animated spinning washers, swaying hangers, clean shoe shining stars, and breeze waves).
- **Interactive Pricing Switch**: A custom toggle button switching between weight-based billing (Per KG) and individual piece-based billing (Per Item), rebuilding pricing tier cards on the fly.
- **Interactive Customer Testimonials**: Tab selections switching expat reviews, star ratings, and roles with fade-in animation.
- **Mobile Responsive Layout**: Optimized viewports from desktop screens down to narrow mobile phones (toggles mobile hamburger navigation drawer, wraps cards, adapts font-sizes).
- **Clean SEO & Semantic HTML**: Structured headings (`h1` to `h5`), custom meta descriptions, and FontAwesome SVG icons.

---

## File Directory Structure
```text
website-1997/
├── index.html       # Primary semantic HTML5 structure with SEO tags
├── index.css        # Clean CSS styles including responsive rules and animations
├── index.js         # Interactive Javascript handlers
└── README.md        # Project guide and GitHub integration instructions
```

---

## Local Development & Preview
To preview the website locally on your computer:
1. Double-click the `index.html` file in your file browser (Finder or Windows Explorer) to open it in Google Chrome, Safari, or your default web browser.
2. Alternatively, if you have VS Code installed, you can right-click and select **"Open with Live Server"**.

---

## How to Upload to GitHub

Since this project needs to be saved on GitHub, here are the step-by-step instructions to initialize Git and push it to your account:

1. **Open your Terminal** (or Git Bash) and navigate to the project directory:
   ```bash
   cd /Users/oanhtran97/.gemini/antigravity/scratch/website-1997
   ```

2. **Initialize Git**:
   ```bash
   git init
   ```

3. **Stage all files** for the first commit:
   ```bash
   git add .
   ```

4. **Commit the files**:
   ```bash
   git commit -m "Initial commit: Premium 1997 Laundry Website"
   ```

5. **Create a remote repository** on GitHub:
   - Go to [github.com](https://github.com) and log in.
   - Click the **New** repository button.
   - Name your repository `website-1997` (keep it public or private as you prefer).
   - **Do NOT** check "Add a README", "Add .gitignore", or "Choose a license" (since we already have local files).
   - Click **Create repository**.

6. **Link your local git repository to GitHub and push**:
   Copy and run the commands shown on GitHub:
   ```bash
   # Rename the default branch to main
   git branch -M main

   # Add the remote repository URL (Replace with your actual GitHub username)
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/website-1997.git

   # Push your code to GitHub
   git push -u origin main
   ```
