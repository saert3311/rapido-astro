import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SITE } from '../src/config/site.ts';

test('SITE.carriers lists exactly InPost, GLS, SEUR, and Kanguro', () => {
  const carrierNames = SITE.carriers.map((c) => c.name.toUpperCase());
  assert.deepEqual(
    carrierNames,
    ['INPOST', 'GLS', 'SEUR', 'KANGURO'],
    'SITE.carriers must contain InPost, GLS, SEUR, Kanguro'
  );
  assert.equal(SITE.carriers.length, 4, 'There must be exactly 4 logistics operators');
});

test('User-facing pages do not reference deprecated carriers (Amazon, CTT Express)', () => {
  const filesToCheck = [
    'src/pages/index.astro',
    'src/pages/paqueteria.astro',
    'src/pages/outlet.astro',
    'src/components/ContactForm.astro',
  ];

  for (const file of filesToCheck) {
    const content = readFileSync(path.resolve(file), 'utf-8');
    assert.ok(
      !content.includes('Amazon Hub Counter'),
      `${file} must not claim Amazon Hub Counter`
    );
    assert.ok(
      !content.includes('CTT Express'),
      `${file} must not claim CTT Express`
    );
  }
});
