# Datenschutzerklärung Konfiguration

Diese Anleitung erklärt, wie Sie die Datenschutzerklärung (Privacy Policy) für Ihre Anwendung konfigurieren.

## Übersicht

Die Datenschutzerklärung ist nach DSGVO (Datenschutz-Grundverordnung) erforderlich und informiert Nutzer über die Verarbeitung ihrer personenbezogenen Daten.

## Konfiguration

Alle Datenschutz-Informationen werden über Umgebungsvariablen in der `.env` Datei konfiguriert.

### Erforderliche Umgebungsvariablen

Bearbeiten Sie Ihre `.env` Datei und setzen Sie folgende Variablen:

```env
# Organisations-Informationen (werden vom Impressum übernommen)
VITE_IMPRINT_ORGANIZATION_NAME=Ihr Organisationsname
VITE_IMPRINT_STREET=Ihre Straße
VITE_IMPRINT_POSTAL_CODE=12345
VITE_IMPRINT_CITY=Ihre Stadt
VITE_IMPRINT_COUNTRY=Deutschland
VITE_IMPRINT_PHONE=+49 123 456789
VITE_IMPRINT_EMAIL=kontakt@example.de

# Hosting-Anbieter
VITE_PRIVACY_HOSTING_PROVIDER=Name des Hosting-Anbieters
VITE_PRIVACY_HOSTING_PROVIDER_ADDRESS=Adresse des Anbieters (optional)
VITE_PRIVACY_HOSTING_PROVIDER_COUNTRY=Land des Anbieters (optional)

# Datenschutzbeauftragter (optional, nur für größere Organisationen)
VITE_PRIVACY_DPO_NAME=Name des Datenschutzbeauftragten
VITE_PRIVACY_DPO_EMAIL=datenschutz@example.de

# Letzte Aktualisierung
VITE_PRIVACY_LAST_UPDATED=2. November 2025
```

### Optionale Felder

Einige Felder sind optional und können leer gelassen werden:

- `VITE_PRIVACY_HOSTING_PROVIDER_ADDRESS` - Wird nur angezeigt, wenn angegeben
- `VITE_PRIVACY_HOSTING_PROVIDER_COUNTRY` - Wird nur angezeigt, wenn angegeben
- `VITE_PRIVACY_DPO_NAME` und `VITE_PRIVACY_DPO_EMAIL` - Nur für Organisationen mit Datenschutzbeauftragten

## Inhalt der Datenschutzerklärung

Die Datenschutzerklärung enthält folgende Abschnitte:

1. **Datenschutz auf einen Blick** - Allgemeine Informationen
2. **Hosting** - Informationen zum Hosting-Anbieter
3. **Allgemeine Hinweise und Pflichtinformationen** - DSGVO-konforme Informationen
4. **Datenerfassung auf dieser Website** - Cookies, Server-Logs, Kontaktformular, Registrierung
5. **Analyse-Tools und Werbung** - Hinweis auf keine Tracking-Tools
6. **Plugins und Tools** - Web Fonts, Kartendienste
7. **Ihre Rechte** - Betroffenenrechte nach DSGVO

## Zugriff auf die Datenschutzerklärung

Die Datenschutzerklärung ist verfügbar unter:
- `/page/privacy` - Öffentliche Route für alle Besucher

## Rechtliche Anforderungen

Stellen Sie sicher, dass Sie:

1. ✅ Genaue und vollständige Informationen bereitstellen
2. ✅ Von Ihrer Footer-Navigation auf die Datenschutzerklärung verlinken (bereits über `visitor_footer_privacy` Translation vorhanden)
3. ✅ Die Datenschutzerklärung leicht zugänglich machen (maximal 2 Klicks von jeder Seite)
4. ✅ Die Informationen aktuell halten
5. ✅ Bei Änderungen der Datenverarbeitung die Datenschutzerklärung aktualisieren

## Wichtige DSGVO-Rechte

Die Datenschutzerklärung informiert Nutzer über ihre Rechte:

- **Auskunftsrecht** (Art. 15 DSGVO)
- **Recht auf Berichtigung** (Art. 16 DSGVO)
- **Recht auf Löschung** (Art. 17 DSGVO)
- **Recht auf Einschränkung der Verarbeitung** (Art. 18 DSGVO)
- **Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruchsrecht** (Art. 21 DSGVO)
- **Beschwerderecht** bei Aufsichtsbehörden

## Anpassungen

Die Datenschutzerklärung ist ein **Template** und sollte an Ihre spezifischen Gegebenheiten angepasst werden:

- Wenn Sie Analyse-Tools verwenden (Google Analytics, Matomo, etc.), fügen Sie entsprechende Abschnitte hinzu
- Wenn Sie Drittanbieter-Dienste nutzen (Newsletter, Payment-Provider, etc.), dokumentieren Sie diese
- Wenn Sie besondere Kategorien personenbezogener Daten verarbeiten, erweitern Sie die Erklärung

## Mehrsprachigkeit

Die Datenschutzerklärung unterstützt mehrere Sprachen (Deutsch, Englisch, Dänisch). Die Textinhalte werden über das i18n-System in `/src/i18n/uranus-i18n-index.ts` verwaltet.

## TypeScript-Unterstützung

Type-Definitionen für alle Privacy-Umgebungsvariablen sind in `env.d.ts` verfügbar und bieten vollständiges Autocomplete und Type-Checking.

## Rechtlicher Hinweis

Diese Datenschutzerklärung ist ein Beispiel-Template. Für rechtssichere Datenschutzerklärungen konsultieren Sie bitte einen auf Datenschutzrecht spezialisierten Rechtsanwalt oder verwenden Sie einen professionellen Datenschutzerklärungs-Generator.

## Weiterführende Links

- [Datenschutz-Grundverordnung (DSGVO)](https://dsgvo-gesetz.de/)
- [Bundesdatenschutzgesetz (BDSG)](https://www.gesetze-im-internet.de/bdsg_2018/)
- [Informationen des Bundesbeauftragten für Datenschutz](https://www.bfdi.bund.de/)
