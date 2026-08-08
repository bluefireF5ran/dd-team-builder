$modIds = @("3579896525", "3655327391", "2203158200", "2615162542", "2168601201")
$workshop = "D:\Program Files (x86)\Steam\steamapps\workshop\content\262060"

foreach ($id in $modIds) {
    $path = Join-Path $workshop $id
    if (Test-Path $path) {
        Write-Host "${id}: EXISTS"
        $heroesPath = Join-Path $path "heroes"
        if (Test-Path $heroesPath) {
            $heroes = Get-ChildItem $heroesPath -Directory
            foreach ($h in $heroes) {
                $portraits = Get-ChildItem $h.FullName -Recurse -Filter "*portrait*" -ErrorAction SilentlyContinue
                Write-Host "  Hero folder: $($h.Name), Portraits: $($portraits.Count)"
                foreach ($p in $portraits) {
                    Write-Host "    - $($p.Name)"
                }
            }
        } else {
            Write-Host "  No heroes folder"
        }
    } else {
        Write-Host "${id}: NOT FOUND"
    }
}