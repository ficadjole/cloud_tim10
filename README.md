## Kreiranje baze podataka

Da biste pokrenuli odgovarajući MSSQL server, potrebno je da odete u `database` folder, otvorite terminal (CMD/PowerShell) i unesete sledeću komandu:

```bash
docker compose up
```

Ovo će kreirati odgovarajući SQL Server kontejner.

Nakon toga otvorite SQL Server Management Studio (SSMS) i unesite connection string kako biste se povezali na server.

Možda će biti potrebno da unutar foldera **Databases** kreirate bazu podataka sa nazivom:

```text
SmartMeteringDB
```

---

## Kreiranje i izmena tabela

Kada kreirate bazu podataka, unutar Visual Studio-a otvorite **Package Manager Console** i unesite sledeću komandu:

```powershell
Update-Database
```

Ova komanda će primeniti postojeće migracije i automatski kreirati tabele u bazi podataka.

Ako želite da menjate entitete (a samim tim i strukturu tabela u bazi), potrebno je da izvršite:

```powershell
Add-Migration ImeMigracije
```

Nakon toga pokrenite:

```powershell
Update-Database
```

kako bi izmene bile primenjene na bazu podataka.

---

## Pokretanje projekta

Potrebno je da omogućite **Multiple startup projects**, kao na slici ispod:

![Multiple Startup Projects](https://github.com/user-attachments/assets/e14d6f11-cccb-4648-b9cc-558d7b6fbef5)

Nakon toga pokrećete projekat koji sadrži:

- Microsoft Azure Functions
- Web API

Pokretanjem Web API-ja otvoriće se Swagger stranica na kojoj možete testirati i videti šta naši API endpointi prihvataju.

---

