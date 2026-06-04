## Kreiranje baze podataka

Da biste pokrenuli odgovarajući MSSQL server, potrebno je da odete u `database` folder, otvorite terminal (CMD/PowerShell) i unesete sledeću komandu:

```bash
docker compose up
```

Ovo će kreirati odgovarajući SQL Server kontejner.

Nakon toga otvorite SQL Server Management Studio (SSMS) i unesite connection string kako biste se povezali na server.

![SSMS Connection](https://github.com/user-attachments/assets/bd49dfe2-cb4b-433a-ab4e-acb7f32b5e45)


Možda će biti potrebno da unutar foldera **Databases** kreirate bazu podataka sa nazivom:

```text
SmartMeteringDB
```

---

## Kreiranje i izmena tabela

Kada kreirate bazu podataka, unutar Visual Studio-a dodajte **local.settings.json** u **SmartGrid.Functions**.

> **Hint:** Potrebno je da unutar **local.settings.json** bude connection string ka bazi ste upravo napravili.

Nakon toga otvorite **Package Manager Console**, postavite **SmartGrid.Infrastructure** kao Default project

![PMC Default project](https://github.com/user-attachments/assets/e61b2109-6856-491f-bfa1-d95f5bba734a)

i unesite sledeću komandu:

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

## 💳 Podešavanje i Testiranje Stripe Sandbox Okruženja

Ova sekcija opisuje kako lokalno konfigurisati, pokrenuti i testirati celokupan end-to-end tok plaćanja računa putem Stripe Checkout sesija i asinhronih Webhook-ova.

---

### 1. Korak: Konfiguracija API Ključeva (Stripe Dashboard)

1. Ulogujte se na svoj [Stripe Dashboard](https://dashboard.stripe.com/) i obavezno u gornjem desnom uglu uključite **Test mode** (Sandbox).
2. Idite na odeljak **Developers -> API keys**.
3. Kopirajte vaš **Secret key** (`sk_test_...`) i upišite ga u konfiguracione fajlove na sledeća mesta:

* U `SmartGrid.WebApi/appsettings.json`:
  ```json
  {
    "StripeOptions": 
    {
        "SecretKey": "sk_test_51TeeljE63tknGfd1iNzhSU8DSSyPrdArFSZnv1W90PIonANLaSBRddHfcUQimwmQqFqZxEI05AwmjlLQme0Qsiay004t6a5mzb",
        "WebhookSecret": "whsec_31775d9db52787cf92d1cb65740bf7e9ef908e41417f0bca750fcf85d9f12c78"
    }
  }
  ```

* U `SmartGrid.Functions/local.settings.json` (unutar `"Values"` sekcije):
  ```json
  {
    "StripeOptions:SecretKey": "sk_test_API_KEY",
    "StripeOptions:WebhookSecret": "whsec_..."
    }
  }
  ```

---

### 2. Korak: Podešavanje Stripe CLI za Webhook-ove

Pošto Stripe serveri ne mogu direktno da pristupe vašoj lokalnoj mašini (`localhost`), koristi se zvanični **Stripe CLI** koji otvara bezbedan tunel i prosleđuje događaje na naš API.

1. Preuzmite kompajliranu Windows arhivu sa [Zvaničnog Stripe CLI GitHub-a](https://github.com/stripe/stripe-cli/releases) (izaberite fajl `stripe_X.X.X_windows_x86_64.zip`).
2. Raspakujte izvršni fajl `stripe.exe` u proizvoljan lokalni folder (npr. `C:\StripeCLI`).
3. Otvorite PowerShell ili Command Prompt unutar tog foldera i pokrenite autentifikaciju komandom:
   ```powershell
   .\stripe login
   ```
   *(Pritisnite **Enter**, pretraživač će se automatski otvoriti, gde je potrebno da odobrite pristup vašem Stripe nalogu).*

4. Pokrenite osluškivanje i prosleđivanje događaja na Web API kontroler sledećom komandom:
   ```powershell
   .\stripe listen --forward-to https://localhost:7262/api/webhooks/stripe
   ```
5. CLI će u konzoli ispisati potpisni ključ: `Your webhook signing secret is whsec_...`
6. Kopirajte taj celokupan `whsec_...` string i unesite ga u oba konfiguraciona fajla pod ključ `WebhookSecret`:
   * **U `SmartGrid.WebApi/appsettings.json`** -> (`StripeOptions:WebhookSecret`)
   * **U `SmartGrid.Functions/local.settings.json`** -> (`StripeOptions:WebhookSecret`)

> [!WARNING]
> Nakon izmene konfiguracionih fajlova, obavezno restartujte backend aplikaciju kako bi Kestrel server učitao nove vrednosti.

---




### 3. Korak: Pokretanje i Integraciono Testiranje (Postman / Swagger)

#### 🔹 Korak A: Kreiranje Checkout Sesije
Pošaljite `POST` zahtev kako biste generisali Stripe link za plaćanje pripremljenog računa:

* **URL:** `https://localhost:7262/api/Bills/3fa85f64-5717-4562-b3fc-2c963f66afa6/checkout`
* **Metoda:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "successUrl": "http://localhost:5173/payment-success",
    "cancelUrl": "http://localhost:5173/payment-failed"
  }
  ```

#### 🔹 Korak B: Simulacija Plaćanja na Stripe Formi
1. Iz uspešnog odgovora (`200 OK`) kopirajte dobijenu vrednost iz ključa `"checkoutUrl"`.
2. Otvorite taj link u web čitaču (Browseru). Bićete preusmereni na sigurnu **Stripe Checkout** formu.
3. Unesite sledeće testne podatke:
   * **Email:** `bilo-sta@example.com`
   * **Broj kartice:** `4242 4242 4242 4242` *(Zvanična Stripe testna kartica)*
   * **MM/GG i CVC:** Bilo koji datum u budućnosti (npr. `12/30`) i bilo koja tri broja (npr. `123`).
4. Kliknite na dugme **Pay**.

#### 🔹 Korak C: Verifikacija Automatskog Webhook-a
Nakon klika na dugme, Stripe uspešno procesuira transakciju, a vaša otvorena Stripe CLI konzola će presresti događaj i ispisati poruku:

```text
--> checkout.session.completed [evt_1X...]
<-- [200] POST https://localhost:7262/api/webhooks/stripe
```

Ovaj status `[200]` potvrđuje da je Webhook uspešno aktivirao našu domensku i aplikativnu logiku. 

**Krajnja verifikacija:** Otvorite bazu podataka i proverite tabelu `Bills` za ID `3fa85f64-5717-4562-b3fc-2c963f66afa6`. Kolona `Status` je automatski prebačena iz stanja **Unpaid** u stanje **Paid**.