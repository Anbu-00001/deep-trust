# DeepTrust focused modernization

## Goal
Turn DeepTrust from a marketing-led detector demo into a credible, evidence-first media investigation workspace. Preserve the existing analysis flow and modules, but clearly distinguish direct observations, model inference, uncertainty, and unavailable checks.

## Build
1. **Replace the landing page with the selected Forensic Command Suite**
   - Use the locked Graphite + Cobalt palette, Space Mono headings, Rubik body, and split investigation layout.
   - Make file intake and analysis the first screen, with compact navigation and a persistent evidence/status rail.
   - Remove the hero, feature marketing, fake performance statistics, decorative gradients, glows, and oversized cards.

2. **Create a truthful evidence intake state**
   - Show file type, size, hash status, supported checks, and the 100 MB limit.
   - Keep image, video, and audio upload working.
   - Before analysis, label all signals as pending or unavailable rather than displaying invented telemetry.

3. **Reframe results around evidence and uncertainty**
   - Lead with “assessment,” not a definitive authenticity verdict.
   - Present confidence, uncertainty, model limitations, and human-review guidance beside the result.
   - Group the current detailed modules into Evidence, Timeline, Signals, and Report views without deleting them.
   - Mark derived or experimental outputs consistently so they cannot be mistaken for independently measured forensic tests.

4. **Preserve investigator workflows**
   - Retain investigation mode, evidence objects, chain-of-custody metadata, caching, and report download.
   - Keep all existing detailed analysis panels reachable from the new workspace.
   - Adapt the layout for smaller screens without collapsing important evidence into unreadable cards.

5. **Credibility and quality pass**
   - Replace template page metadata with DeepTrust-specific title and descriptions.
   - Remove dead marketing links and misleading copy.
   - Resolve current console warnings where they intersect with the rebuilt screen.
   - Verify initial, selected-file, analyzing, result, and error states in the live preview.

## Technical details
- Refactor the oversized analysis screen into focused workspace pieces while keeping the existing analysis hook and result contract intact.
- Define all new colors and visual roles as semantic tokens in the global design system; use existing interface controls and icon patterns.
- Keep this phase frontend-focused: it will not claim that the current single-model analysis has become a validated multi-model forensic pipeline.
- Add an architecture note documenting the evidence-versus-inference presentation boundary.

## Deferred industry upgrades
These require deeper engine work and should follow the interface correction:
- Real frame extraction and audio processing for video/audio.
- Genuine independent detector ensemble and validation-set calibration.
- C2PA verification with accurate “provenance, not truth” language.
- Authenticated, rate-limited large-file ingestion and persistent case storage.
- Independent in-the-wild benchmark reporting with false-positive and false-negative rates.
