# Company and service content

Company details are maintained in `shared/company.ts` and displayed with English, Hindi and Marathi labels on About and Contact, with registration and contact details in the footer.

The Udyam number is `UDYAM-MH-26-1192362`, transcribed from the supplied registration certificate. The Warje and Pimpri office addresses, contact name, two phone numbers, two email addresses and website come from the supplied business cards. The certificate's registered address (PIN 411058) is labelled separately from the Warje office address on the card (PIN 411052). The certificate itself is not included in public website assets.

The service catalogue contains the ten services in the supplied flyer, plus patient attendants (ward boy, maushi and aya) from the card and the existing day/night care service. New services are inserted by the existing API startup seeding. Existing administrator-edited records are preserved.

## Images

Four new illustrative photographs were generated with the built-in image generation tool for injection/dressing, vital-sign monitoring, medication assistance and wound care. Their complete prompts and source filenames are recorded in `scripts/additional-care-photo-sources.json`.

Final website assets:

- `public/images/healthcare/injection-dressing.webp`
- `public/images/healthcare/vital-signs-monitoring.webp`
- `public/images/healthcare/medication-assistance.webp`
- `public/images/healthcare/wound-care.webp`

The existing physiotherapy and mother/newborn photographs illustrate the corresponding new services. Every catalogue service has a distinct photo, with translated alt text and the existing illustrative-image disclosure.

To prepare the four generated source images again:

```powershell
node scripts/prepare-healthcare-photos.mjs scripts/additional-care-photo-sources.json
```

## Validation

```powershell
npm.cmd run build
npm.cmd test
$env:E2E_CLIENT_PORT='5184'
$env:E2E_API_PORT='4111'
npm.cmd run test:e2e -- e2e/healthcare.spec.ts
```

The optional E2E ports avoid interrupting another project's local preview. Browser coverage includes all three languages, company contact links and PIN codes, service search, enquiry preselection, images, responsive layouts, gallery keyboard controls and owner editing.

Verified on 30 October 2026: production build passed, 31 unit/integration tests passed, and all five healthcare browser scenarios passed (the responsive scenario was rerun after updating its old six-service assertion). Responsive coverage spans 360, 390, 768, 1024, 1440 and 1920 pixels. The build reports an existing large-bundle warning. No deployment was performed.
