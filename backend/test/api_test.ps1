$base = "http://localhost:4000/api"
Write-Host "Starting API tests against $base" -ForegroundColor Cyan

function PostJson($path, $body, $token){
  $uri = "$base$path"
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    $res = Invoke-RestMethod -Method Post -Uri $uri -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers
    return @{ ok = $true; data = $res }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

function GetJson($path, $token){
  $uri = "$base$path"
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    $res = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
    return @{ ok = $true; data = $res }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

function PatchJson($path, $body, $token){
  $uri = "$base$path"
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    $res = Invoke-RestMethod -Method Patch -Uri $uri -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers
    return @{ ok = $true; data = $res }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

function DeleteJson($path, $body, $token){
  $uri = "$base$path"
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    if ($body) {
      $res = Invoke-RestMethod -Method Delete -Uri $uri -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers
    } else {
      $res = Invoke-RestMethod -Method Delete -Uri $uri -Headers $headers
    }
    return @{ ok = $true; data = $res }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

# 1. Ping
$r = GetJson('/ping')
Write-Host "Ping:" ($r | ConvertTo-Json -Depth 5)

# 2. Register -> Login
$email = "tester+$(Get-Date -UFormat %s)@example.com"
$pwd = "TestPass123!"
Write-Host "Registering user $email"
$reg = PostJson('/auth/register', @{ email = $email; password = $pwd; name = 'Auto Tester' })
Write-Host "Register result:" ($reg | ConvertTo-Json -Depth 5)

Write-Host "Logging in"
$login = PostJson('/auth/login', @{ email = $email; password = $pwd })
Write-Host "Login result:" ($login | ConvertTo-Json -Depth 5)
if (-not $login.ok) { Write-Host "Login failed; aborting tests" -ForegroundColor Red; exit 1 }
$token = $login.data.token

# 3. Public generate
Write-Host "Public generate (no auth)"
$gen = PostJson('/trips/generate', @{ destination='Tokyo'; days=2; budgetType='Medium'; interests = @('Food','Culture') }, $null)
Write-Host "Generate result:" ($gen | ConvertTo-Json -Depth 10)

# 4. Create trip (authenticated)
Write-Host "Creating trip (authenticated)"
$create = PostJson('/trips', @{ destination='Tokyo'; days=2; budgetType='Medium'; interests = @('Food','Culture') }, $token)
Write-Host "Create result:" ($create | ConvertTo-Json -Depth 10)
if (-not $create.ok) { Write-Host "Create failed; aborting" -ForegroundColor Red; exit 1 }
$tripId = $create.data.trip._id

# 5. Get trips
Write-Host "Fetching trips list"
$list = GetJson('/trips', $token)
Write-Host "Trips:" ($list | ConvertTo-Json -Depth 10)

# 6. Add activity to day 1
Write-Host "Adding activity to day 1"
$add = PostJson("/trips/$tripId/activity", @{ day = 1; activity = 'Sample added activity' }, $token)
Write-Host "Add activity result:" ($add | ConvertTo-Json -Depth 10)

# 7. Remove activity (remove last index)
Write-Host "Removing last activity from day 1"
$current = GetJson("/trips/$tripId", $token)
$activities = $current.data.itinerary[0].activities
$lastIndex = $activities.Count - 1
$del = DeleteJson("/trips/$tripId/activity", @{ day = 1; index = $lastIndex }, $token)
Write-Host "Delete activity result:" ($del | ConvertTo-Json -Depth 10)

# 8. Regenerate day 1 with focus 'outdoor'
Write-Host "Regenerating day 1 with focus 'outdoor'"
$regen = PatchJson("/trips/$tripId/day/1/regenerate", @{ focus = 'outdoor' }, $token)
Write-Host "Regenerate result:" ($regen | ConvertTo-Json -Depth 10)

# 9. Get hotel suggestions
Write-Host "Fetching hotel suggestions"
$hot = GetJson("/trips/$tripId/hotels", $token)
Write-Host "Hotels:" ($hot | ConvertTo-Json -Depth 10)

# 10. Delete trip
Write-Host "Deleting trip"
$deltrip = DeleteJson("/trips/$tripId", $null, $token)
Write-Host "Delete trip result:" ($deltrip | ConvertTo-Json -Depth 10)

# 11. Verify trip deleted
Write-Host "Verifying trip deletion (should 404)"
$verify = GetJson("/trips/$tripId", $token)
Write-Host "Verify result:" ($verify | ConvertTo-Json -Depth 10)

Write-Host "API tests completed"