/**
 * City Flywheel Scoring Engine
 * =============================
 *
 *   flywheelScore(city, weights) =
 *      marketSize         × w.marketSize         +
 *      existingBase       × w.existingBase       +
 *      densityPotential   × w.densityPotential   +
 *      (100 − competition)× w.competitionPressure+
 *      supplyReadiness    × w.supplyReadiness    +
 *      strategicValue     × w.strategicValue
 *
 * Each component is normalised to 0–100 BEFORE entering the score so the
 * weighted sum stays in the same range. Weights sum to 1.0.
 *
 * Tier mapping (configurable in cities.js):
 *   ≥80 → S    ≥65 → A    ≥50 → B    <50 → C
 */

import { TIER_THRESHOLDS } from '../data/cities.js';

/**
 * Normalize population on a log scale (linear scale would crush small cities).
 *   minLog = log10(300_000), maxLog = log10(12_000_000) — covers the 30-city range.
 */
function logNorm(value, minLog, maxLog) {
  const v = Math.log10(Math.max(value, 1));
  return Math.max(0, Math.min(100, ((v - minLog) / (maxLog - minLog)) * 100));
}

/** Compute the six component scores for a single city, all in [0, 100]. */
export function componentScores(city) {
  return {
    marketSize:           logNorm(city.population, Math.log10(300_000), Math.log10(12_000_000)),
    existingBase:         city.density99,
    densityPotential:     city.densityPotential,
    competitionPressure:  100 - city.ifoodShare * 1.0
                              - (city.keetaPresent ? 12 : 0),     // Keeta presence hurts
    supplyReadiness:      city.supplyReadiness,
    strategicValue:       city.strategicValue,
  };
}

/** Weighted flywheel score for a single city. */
export function flywheelScore(city, weights) {
  const s = componentScores(city);
  const score =
    s.marketSize          * weights.marketSize +
    s.existingBase        * weights.existingBase +
    s.densityPotential    * weights.densityPotential +
    s.competitionPressure * weights.competitionPressure +
    s.supplyReadiness     * weights.supplyReadiness +
    s.strategicValue      * weights.strategicValue;
  return Math.round(score * 10) / 10;
}

/** S/A/B/C tier from a 0–100 score. */
export function tierOf(score) {
  if (score >= TIER_THRESHOLDS.S) return 'S';
  if (score >= TIER_THRESHOLDS.A) return 'A';
  if (score >= TIER_THRESHOLDS.B) return 'B';
  return 'C';
}

/** Recommended action — drives map color and strategy generator.
 *  By the time 99Food has launched 15 of the top 30, all Tier-A unlaunched
 *  cities are gone, so "enter" gates at Tier-B unlaunched (score ≥ 50);
 *  Tier-C high (≥ 45) drops to "watch"; the rest "hold". Captures the real
 *  next-wave decision shape, not a textbook one.
 */
export function recommendation(city, score) {
  if (city.isLaunched) return 'launched';
  if (city.keetaPresent) return 'contest';         // Keeta beachhead — attack
  if (score >= TIER_THRESHOLDS.B) return 'enter';  // Tier-B unlaunched = next wave
  if (score >= 45) return 'watch';                 // Tier-C high
  return 'hold';
}

export const RECOMMENDATION_META = {
  launched: { label: 'Launched',    color: '#FFD200', tone: 'signal' },
  contest:  { label: 'Contest',     color: '#E63946', tone: 'alert'  },
  enter:    { label: 'Enter now',   color: '#FF8C42', tone: 'orange' },
  watch:    { label: 'Watch',       color: '#8B92A3', tone: 'muted'  },
  hold:     { label: 'Hold',        color: '#3A3F4B', tone: 'dim'    },
};

/** Rank all cities by score, returning attached _score and _tier fields. */
export function rankCities(cities, weights) {
  return cities
    .map((c) => {
      const score = flywheelScore(c, weights);
      return {
        ...c,
        _score: score,
        _tier: tierOf(score),
        _components: componentScores(c),
        _recommendation: recommendation(c, score),
      };
    })
    .sort((a, b) => b._score - a._score);
}
