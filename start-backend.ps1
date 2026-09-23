# Run this in a dedicated PowerShell window and leave it open while using EduFund.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "backend")
py -3.13 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
