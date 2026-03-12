$pids = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
if ($pids) { Stop-Process -Id $pids -Force }

$pids = (Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue).OwningProcess
if ($pids) { Stop-Process -Id $pids -Force }

Rename-Item -Path "server" -NewName "backend"

New-Item -ItemType Directory -Force -Path "frontend"

$itemsToMove = @("src", "public", "index.html", "package.json", "package-lock.json", "node_modules", "vite.config.js", "tailwind.config.js", "postcss.config.js", "eslint.config.js", ".gitignore", "README.md")

foreach ($item in $itemsToMove) {
    if (Test-Path $item) {
        Move-Item -Path $item -Destination "frontend\" -Force
    }
}
