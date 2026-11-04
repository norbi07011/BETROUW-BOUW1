/** Which project (index in `projectDetails.items`) belongs to which service
 * (index in `services.items`). The order of both lists is the same in every
 * language, so this mapping is language-independent. `null` = no matching
 * project yet: the button then just opens the project overview. */
export const SERVICE_TO_PROJECT: (number | null)[] = [
  0, // Kunststof kozijnen        -> Kunststof kozijnen - Den Haag
  3, // Dakkapellen               -> Dakkapellen - montage
  4, // Houten kozijnen / keralit -> Houten kozijnen met gevelbekleding
  null, // Deuren montage         -> (no project with door photos yet)
  5, // Schuifpuien               -> Schuifpuien en vouwwanden
  2, // Nieuwbouw projecten       -> Glazen gevel villa - Aalsmeer (new build)
  7, // Schilderwerkzaamheden     -> Schilderwerkzaamheden - Amsterdam
  8, // Glaswerkzaamheden         -> Glaswerkzaamheden
];
