# Impressum Configuration

This document explains how to configure the legal imprint (Impressum) for your application.

## Overview

The imprint page is required by German law (§5 TMG, §55 RStV) and displays important legal information about your organization.

## Configuration

All imprint data is configured via environment variables in the `.env` file. This allows you to easily update the information without modifying the source code.

### Required Environment Variables

Edit your `.env` file and set the following variables:

```env
# Organization Information
VITE_IMPRINT_ORGANIZATION_NAME=Your Organization Name
VITE_IMPRINT_STREET=Your Street Name
VITE_IMPRINT_POSTAL_CODE=12345
VITE_IMPRINT_CITY=Your City
VITE_IMPRINT_COUNTRY=Deutschland

# Contact Information
VITE_IMPRINT_PHONE=+49 123 456789
VITE_IMPRINT_EMAIL=kontakt@example.de
VITE_IMPRINT_WEBSITE=https://www.example.de

# Legal Representative
VITE_IMPRINT_REPRESENTED_BY=Full Name of Representative

# Register Entry (optional, only for registered companies)
VITE_IMPRINT_REGISTER_COURT=Amtsgericht City
VITE_IMPRINT_REGISTER_NUMBER=HRB 12345

# VAT ID (if applicable)
VITE_IMPRINT_VAT_ID=DE123456789

# Content Responsibility (§ 55 Abs. 2 RStV)
VITE_IMPRINT_CONTENT_RESPONSIBLE_NAME=Full Name
VITE_IMPRINT_CONTENT_RESPONSIBLE_ADDRESS=Street and Number
VITE_IMPRINT_CONTENT_RESPONSIBLE_POSTAL_CODE=12345
VITE_IMPRINT_CONTENT_RESPONSIBLE_CITY=City Name
```

### Optional Fields

Some fields are optional and can be left empty if they don't apply to your organization:

- `VITE_IMPRINT_WEBSITE` - Only shown if provided
- `VITE_IMPRINT_REPRESENTED_BY` - Only shown if provided
- `VITE_IMPRINT_REGISTER_COURT` and `VITE_IMPRINT_REGISTER_NUMBER` - Only shown if both are provided
- `VITE_IMPRINT_VAT_ID` - Only shown if provided

## Deployment

For production deployments, make sure to:

1. **Never commit the `.env` file to version control** - It's already in `.gitignore`
2. **Set environment variables in your hosting platform** (Vercel, Netlify, etc.)
3. **Use `.env.example` as a template** for other developers

### Example for different environments:

**.env.local** (for local development):
```env
VITE_IMPRINT_ORGANIZATION_NAME=Test Organization (Local)
# ... other variables
```

**.env.production** (for production - configure in hosting platform):
```env
VITE_IMPRINT_ORGANIZATION_NAME=Real Organization Name
# ... other variables with real data
```

## Accessing the Imprint

The imprint page is available at:
- `/imprint` - Public route accessible to all visitors

## Legal Requirements

Make sure to:

1. ✅ Provide accurate and complete information
2. ✅ Link to the imprint from your footer (already done via `visitor_footer_imprint` translation)
3. ✅ Ensure the imprint is easily accessible within 2 clicks from any page
4. ✅ Keep the information up to date

## Internationalization

The imprint supports multiple languages (German, English, Danish). The text content is managed via the i18n system in `/src/i18n/uranus-i18n-index.ts`.

## TypeScript Support

Type definitions for all imprint environment variables are available in `env.d.ts`, providing full autocomplete and type checking in your IDE.

## Questions?

For legal advice on what information you need to provide in your specific case, please consult a lawyer specializing in German internet law.
