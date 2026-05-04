# cloud_tim10

Da biste namestile bazu potrebno je da udjete u database folder i uradite: docker compose up
Sto ce pokrenuti doker i kreirati sql server

Da biste videle da li radi server potrebno je da upalite SQL Server Managament Studio i da se prikacite na bazu putem
ovog ConnectionStrignga: Data Source=localhost,1433;Initial Catalog=master;Persist Security Info=True;User ID=sa;Password=LozinkaJakaCloudTim10!#;Pooling=False;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Command Timeout=0

Mozda ce biti potrebno da kreirate SmartMeteringDB, to radite desni klik na databases i create.

Nakon toga potrebno je dodati local.settings.json unutar SmartGrid.Functions koji izgleda
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "Logging:LogLevel:Default": "Information",
    "AllowedHosts": "*",
    "AzureTableOptions:ConnectionString": "UseDevelopmentStorage=true",
    "AzureBlobOptions:ConnectionString": "UseDevelopmentStorage=true",
    "AzureQueueOptions:ConnectionString": "UseDevelopmentStorage=true",
    "AzureSQLOptions:ConnectionString": "Server=localhost,1433;Database=SmartMeteringDB;User Id=sa;Password=LozinkaJakaCloudTim10!#;TrustServerCertificate=True;"
  }
}

Kada nesto budete radili sa EntityCoreFrameworkom i zelite da kreirate tabele za te klase koje ste kreirale
Potrebno je da to uradite unutar Packet Manager Console komandama: 1) Add-Migration ImeMigracije
                                                                   2) Update-Database

Nakon toga trebalo bi da vam se prikazu tabele unutar Server Managementa Studia.

Todje unutar WebAPI-a sam u app.settings.js dodao na kraj:
  "AzureSQLOptions": {
    "ConnectionString": "Server=localhost,1433;Database=SmartMeteringDB;User Id=sa;Password=LozinkaJakaCloudTim10!#;TrustServerCertificate=True;"
  }

Ne znam da li treba, proverite