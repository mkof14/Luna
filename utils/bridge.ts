import { BridgeReflectionInput, PartnerNoteInput } from '../types';
import { hasMeaningfulText, normalizeUserText } from './text';

export const normalizeBridgeReflectionInput = (input: BridgeReflectionInput): BridgeReflectionInput => ({
  language: input.language.trim().toLowerCase() || 'en',
  reflection: {
    quiet_presence: normalizeUserText(input.reflection.quiet_presence),
    not_meaning: normalizeUserText(input.reflection.not_meaning),
    kindness_needed: normalizeUserText(input.reflection.kindness_needed),
  },
});

export const normalizePartnerNoteInput = (input: PartnerNoteInput): PartnerNoteInput => ({
  ...input,
  partner_name: input.partner_name ? normalizeUserText(input.partner_name) : undefined,
  preferred_terms: input.preferred_terms ? normalizeUserText(input.preferred_terms) : undefined,
  avoid_terms: input.avoid_terms
    ? input.avoid_terms.map(normalizeUserText).filter(hasMeaningfulText)
    : undefined,
  language: input.language?.trim().toLowerCase() || 'en',
});
