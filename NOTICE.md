# Third-party notices

## Geographic database (ODbL 1.0)

The files under `data/` are a derivative database based on
[Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database)
by Anil Dhiraj (dr5hn), distributed under the
[Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

The full ODbL text is included in `ODbL-1.0.txt` in this package.

Database contents may also be subject to the Database Contents License (DbCL);
see the upstream repository `.github/CONTENT_LICENSE`.

### Transformations in this package

The upstream JSON exports were reshaped for lazy loading:

- Per-country state and city shard files
- Compact reference and search index files
- Selected foreign-key fields attached to city records at build time

No geographic facts were invented or removed intentionally; see
`data/metadata.json` and `validation-report.json` for build provenance and
quality checks.

## Package source code

TypeScript/JavaScript source under `src/` and build scripts under `scripts/` are
licensed under the MIT License (`LICENSE`). That license applies to the **code
only**, not to the `data/` database.