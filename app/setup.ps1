# STL Icons setup
#
# Installs the STL Icons add-in in desktop PowerPoint and, optionally, sets this PC up to work on the code.
# Run it from PowerShell:
#     irm https://magnusacj.github.io/stl-icons/setup.ps1 | iex
# Set $env:STL_ICONS_DRYRUN = '1' first to see what it would do without changing anything.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$SiteUrl   = 'https://magnusacj.github.io/stl-icons'
$RepoUrl   = 'https://github.com/magnusacj/stl-icons.git'
$AddinId   = '4c26de9c-0ac6-469f-9fbf-9daf5e90e289'
$AddinDir  = Join-Path $env:LOCALAPPDATA 'STL Icons'
# Not in Documents: that is often synced by OneDrive, which clashes with Git
$CodeDir   = Join-Path $env:USERPROFILE 'stl-icons'
$GhVersion = '2.103.3'
$DryRun    = $env:STL_ICONS_DRYRUN -eq '1'

function Step($text) { Write-Host "`n> $text" -ForegroundColor Cyan }
function Ok($text)   { Write-Host "  $text" -ForegroundColor Green }
function Note($text) { Write-Host "  $text" -ForegroundColor Yellow }
function Do-It($description, [scriptblock]$action) {
    if ($DryRun) { Write-Host "  [dry run] would $description" -ForegroundColor DarkGray } else { & $action }
}
function Find-Exe($name, $candidates) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
    return $null
}
function Refresh-Path {
    $env:PATH = [Environment]::GetEnvironmentVariable('PATH', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('PATH', 'User')
}

Write-Host ''
Write-Host '  STL Icons setup' -ForegroundColor White
Write-Host '  ---------------'
if ($DryRun) { Note 'Dry run: nothing will be changed.' }

# ---------------------------------------------------------------- 1. PowerPoint add-in

Step 'Installing the STL Icons add-in for PowerPoint'

if (Get-Process POWERPNT -ErrorAction SilentlyContinue) {
    Note 'PowerPoint is open. Please save your work and close PowerPoint now.'
    Read-Host '  Press Enter once PowerPoint is closed'
}

$manifest = Join-Path $AddinDir 'manifest.xml'
Do-It "download the add-in file to $manifest" {
    New-Item -ItemType Directory -Force $AddinDir | Out-Null
    Invoke-WebRequest "$SiteUrl/manifest.xml" -OutFile $manifest -UseBasicParsing
}
Do-It 'register the add-in with PowerPoint (current user only)' {
    $key = 'HKCU:\Software\Microsoft\Office\16.0\WEF\Developer'
    if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
    New-ItemProperty -Path $key -Name $AddinId -Value $manifest -PropertyType String -Force | Out-Null
}
Ok 'Done. In PowerPoint: Insert > Add-ins > My Add-ins > Developer Add-ins > STL Icons.'

# ---------------------------------------------------------------- 2. Developer setup (optional)

$answer = Read-Host "`n  Also set this PC up to edit the STL Icons code? (y/n)"
if ($answer -notmatch '^[Yy]') {
    Write-Host "`n  All done. Open PowerPoint to start using STL Icons.`n" -ForegroundColor Green
    return
}

$hasWinget = [bool](Get-Command winget -ErrorAction SilentlyContinue)

Step 'Git'
$git = Find-Exe 'git' @("$env:LOCALAPPDATA\Programs\Git\cmd\git.exe", "$env:ProgramFiles\Git\cmd\git.exe")
if ($git) { Ok "Already installed ($git)" }
elseif (-not $hasWinget) { Note 'Please install Git from https://git-scm.com/download/win and run this again.'; return }
else {
    Do-It 'install Git (for this user)' {
        winget install --id Git.Git -e --scope user --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
        Refresh-Path
    }
    $git = Find-Exe 'git' @("$env:LOCALAPPDATA\Programs\Git\cmd\git.exe", "$env:ProgramFiles\Git\cmd\git.exe")
    if ($git -or $DryRun) { Ok 'Installed' } else { Note 'Git did not install. Install it from https://git-scm.com/download/win and run this again.'; return }
}

Step 'GitHub CLI (used to sign in to GitHub)'
$ghDir = Join-Path $env:LOCALAPPDATA 'Programs\gh'
$gh = Find-Exe 'gh' @("$ghDir\bin\gh.exe", "$env:ProgramFiles\GitHub CLI\gh.exe")
if ($gh) { Ok "Already installed ($gh)" }
else {
    # Portable copy: no administrator rights needed
    Do-It "download GitHub CLI $GhVersion to $ghDir" {
        $zip = Join-Path $env:TEMP 'gh.zip'
        Invoke-WebRequest "https://github.com/cli/cli/releases/download/v$GhVersion/gh_${GhVersion}_windows_amd64.zip" -OutFile $zip -UseBasicParsing
        New-Item -ItemType Directory -Force $ghDir | Out-Null
        Expand-Archive $zip -DestinationPath $ghDir -Force
        Remove-Item $zip
        $userPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
        if ($userPath -notlike "*$ghDir\bin*") { [Environment]::SetEnvironmentVariable('PATH', "$userPath;$ghDir\bin", 'User') }
        Refresh-Path
    }
    $gh = "$ghDir\bin\gh.exe"
    Ok 'Installed'
}

Step 'Python (used to preview and build the add-in)'
$python = Get-Command python -ErrorAction SilentlyContinue
$pythonWorks = $false
if ($python) { try { $null = & python --version 2>$null; $pythonWorks = ($LASTEXITCODE -eq 0) } catch { } }
if ($pythonWorks) { Ok 'Already installed' }
elseif (-not $hasWinget) { Note 'Please install Python from https://www.python.org/downloads/ later.' }
else {
    Do-It 'install Python 3.12 (for this user)' {
        winget install --id Python.Python.3.12 -e --scope user --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
        Refresh-Path
    }
    Ok 'Installed'
}

Step 'Signing in to GitHub'
Note 'A browser window will open. Sign in with the GitHub account that has access to magnusacj/stl-icons.'
Do-It 'run GitHub sign-in' {
    $env:PATH = (Split-Path $git) + ';' + $env:PATH
    & $gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { & $gh auth login --hostname github.com --git-protocol https --web }
    & $gh auth setup-git
}

Step "Downloading the code to $CodeDir"
if (Test-Path (Join-Path $CodeDir '.git')) { Ok 'Already downloaded. Getting the latest version.'; Do-It 'pull latest changes' { & $git -C $CodeDir pull } }
else { Do-It "clone $RepoUrl" { & $git clone $RepoUrl $CodeDir } }

Do-It 'set the name and private GitHub email used on commits' {
    $login = & $gh api user --jq .login
    $id = & $gh api user --jq .id
    & $git -C $CodeDir config user.name $login
    & $git -C $CodeDir config user.email "$id+$login@users.noreply.github.com"
}

Write-Host ''
Write-Host '  All done.' -ForegroundColor Green
Write-Host "  - STL Icons is in PowerPoint: Insert > Add-ins > My Add-ins > Developer Add-ins"
Write-Host "  - The code is in $CodeDir. Start with README.md and ICON-STYLE-GUIDE.md."
Write-Host '  - Before you start work each time:   git pull'
Write-Host '  - To publish your changes:           git add -A ; git commit -m "what you changed" ; git push'
Write-Host ''
