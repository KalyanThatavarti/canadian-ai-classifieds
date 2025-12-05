$indexPath = "index.html"
$content = Get-Content $indexPath -Raw

# 1. Add hero-slider.css link after styles.css
$content = $content -replace '(<link rel="stylesheet" href="css/styles.css">)', "`$1`r`n    <link rel=""stylesheet"" href=""css/hero-slider.css"">"

# 2. Add hero-slider.js before closing body tag
$content = $content -replace '(</body>)', "    <script src=""js/hero-slider.js""></script>`r`n`$1"

# Save the updated content
$content | Out-File -FilePath $indexPath -Encoding UTF8 -NoNewline

Write-Host "✅ Updated index.html with CSS and JS links"
Write-Host "Next: Manually replace the hero section HTML (lines 31-50)"
Write-Host "See HERO_UPDATE_INSTRUCTIONS.md for the HTML code"
