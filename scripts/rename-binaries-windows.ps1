# Get name and version from package.json
$packageJson = Get-Content "./package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
$name = if ($packageJson.build -and $packageJson.build.productName) { $packageJson.build.productName } else { $packageJson.name }

# Normalize name used in filenames (avoid spaces in file names we create)
$nameForFile = ($name -replace "\s+", "_")

$artifactDir = "build/output"
$escapedVersion = [regex]::Escape($version)
$setupPattern = "Setup[-_ ]$escapedVersion"

# Copy NSIS installer to a stable manual-download name.
$installerCandidates = @(
    Get-ChildItem -Path $artifactDir -Filter "*.exe" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match $setupPattern }
)

if ($installerCandidates.Count -eq 0) {
    Write-Error "Installer artifact not found in $artifactDir"
    exit 1
}

$installerTargetName = "${nameForFile}_setup_intel.exe"
Copy-Item -LiteralPath $installerCandidates[0].FullName -Destination (Join-Path -Path $artifactDir -ChildPath $installerTargetName) -Force
Write-Host "Copied installer to $installerTargetName"

# Copy portable executable to a stable manual-download name.
$portableCandidates = @(
    Get-ChildItem -Path $artifactDir -Filter "*.exe" -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -ne $installerTargetName -and
            $_.Name -notmatch $setupPattern
        }
)

if ($portableCandidates.Count -eq 0) {
    Write-Error "Portable executable artifact not found in $artifactDir"
    exit 1
}

$portableTargetName = "${nameForFile}_portable_intel.exe"
Copy-Item -LiteralPath $portableCandidates[0].FullName -Destination (Join-Path -Path $artifactDir -ChildPath $portableTargetName) -Force
Write-Host "Copied portable executable to $portableTargetName"

# Hide all files in win-unpacked except the executable, resources, and licenses
$unpackedDir = "build/output/win-unpacked"
if (Test-Path -LiteralPath $unpackedDir) {
    # Items to keep visible
    $exeName = "${name}.exe"
    $keep = @(
        $exeName,
        "resources",
        "LICENSES.chromium.html",
        "LICENSE.electron.txt"
    )

    function Set-Hidden {
        param(
            [Parameter(Mandatory = $true)]
            [string] $Path
        )

        try {
            $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
            $attrs = $item.Attributes
            $newAttrs = $attrs -bor [IO.FileAttributes]::Hidden
            if ($attrs -ne $newAttrs) {
                Set-ItemProperty -LiteralPath $Path -Name Attributes -Value $newAttrs -ErrorAction Stop
            }
            Write-Host "Hidden: $Path"
        } catch {
            Write-Warning "Failed to hide: $Path - $($_.Exception.Message)"
        }
    }

    # Hide everything in win-unpacked except the allowed items
    $children = Get-ChildItem -LiteralPath $unpackedDir -Force -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        if ($keep -notcontains $child.Name) {
            Set-Hidden -Path $child.FullName
        }
    }

    # Additionally hide resources/assets and resources/page if present
    $resourcesDir = Join-Path -Path $unpackedDir -ChildPath "resources"
    foreach ($sub in @("assets", "page")) {
        $subPath = Join-Path -Path $resourcesDir -ChildPath $sub
        if (Test-Path -LiteralPath $subPath) {
            Set-Hidden -Path $subPath
        }
    }
} else {
    Write-Warning "Unpacked directory not found: $unpackedDir"
}

# Finally, rename win-unpacked to NAME_VERSION (NAME from build.productName or package name)
$finalDirName = "${name}_${version}"
$finalDirPath = Join-Path -Path "build/output" -ChildPath $finalDirName

if (Test-Path -LiteralPath $unpackedDir) {
    if (Test-Path -LiteralPath $finalDirPath) {
        Write-Warning "Target directory already exists: $finalDirPath"
    } else {
        try {
            Rename-Item -LiteralPath $unpackedDir -NewName $finalDirName -ErrorAction Stop
            Write-Host "Renamed directory to: $finalDirName"
        } catch {
            Write-Error "Failed to rename directory: $($_.Exception.Message)"
            exit 1
        }
    }
}
