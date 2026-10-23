import { KKM, GRADE_WEIGHTS } from './constants';

/**
 * Check if a score is below KKM
 * @param {number} score
 * @returns {boolean}
 */
export const isBelowKKM = (score) => {
  if (score === null || score === undefined || score === '') return false;
  return Number(score) < KKM;
};

/**
 * Calculate Nilai Akhir (Final Grade) for grades 7 & 8
 * NA = (0.30 × AvgDaily) + (0.30 × UTS) + (0.40 × UAS/UKK)
 * @param {number} avgDaily - Average daily grade
 * @param {number} uts - UTS score
 * @param {number} uasUkk - UAS/UKK score
 * @returns {number|null}
 */
export const calculateNA = (avgDaily, uts, uasUkk) => {
  if (avgDaily == null || uts == null || uasUkk == null) return null;
  const na =
    GRADE_WEIGHTS.DAILY * Number(avgDaily) +
    GRADE_WEIGHTS.UTS * Number(uts) +
    GRADE_WEIGHTS.UAS_UKK * Number(uasUkk);
  return Math.round(na * 100) / 100;
};

/**
 * Get CSS classes for grade cell based on KKM
 * @param {number} score
 * @returns {string}
 */
export const getGradeCellClass = (score) => {
  if (isBelowKKM(score)) {
    return 'bg-red-100 text-red-800 font-semibold';
  }
  return '';
};

/**
 * Get badge text for grade status
 * @param {number} score
 * @returns {string}
 */
export const getGradeStatus = (score) => {
  if (score === null || score === undefined || score === '') return '-';
  return isBelowKKM(score) ? 'Belum Tuntas' : 'Tuntas';
};

/**
 * Get grade calculation breakdown text
 * @param {number} avgDaily
 * @param {number} uts
 * @param {number} uasUkk
 * @returns {string}
 */
export const getCalculationBreakdown = (avgDaily, uts, uasUkk) => {
  if (avgDaily == null || uts == null || uasUkk == null) return '-';
  const dailyPart = (GRADE_WEIGHTS.DAILY * Number(avgDaily)).toFixed(2);
  const utsPart = (GRADE_WEIGHTS.UTS * Number(uts)).toFixed(2);
  const uasPart = (GRADE_WEIGHTS.UAS_UKK * Number(uasUkk)).toFixed(2);
  return `(${(GRADE_WEIGHTS.DAILY * 100)}% × ${avgDaily}) + (${(GRADE_WEIGHTS.UTS * 100)}% × ${uts}) + (${(GRADE_WEIGHTS.UAS_UKK * 100)}% × ${uasUkk}) = ${dailyPart} + ${utsPart} + ${uasPart}`;
};

/**
 * Validate score is within range 0-100
 * @param {number} score
 * @returns {boolean}
 */
export const isValidScore = (score) => {
  if (score === null || score === undefined || score === '') return true;
  const num = Number(score);
  return !isNaN(num) && num >= 0 && num <= 100;
};
