import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type QualificationLevel =
  | "Unqualified/Other"
  | "Student/Apprentice (Studying Level 2)"
  | "Student/Apprentice (Studying Level 3/6)"
  | "Level 2 Approved"
  | "Level 3 Approved"
  | "QTS / EYTS / EYPS / Level 6+";

type AgeGroup = "Under 2" | "2-3 years" | "3-5 years";

interface StaffMember {
  id: string;
  name: string;
  qualificationLevel: QualificationLevel;
  isPFAHolder: boolean;
}

interface ChildCount {
  under2: number;
  age2to3: number;
  age3Plus: number;
}

interface RatioResult {
  compliant: boolean;
  pfaCompliant: boolean;
  eyfsCompliant: boolean;
  maxCapacity: {
    under2: number;
    age2to3: number;
    age3Plus: number;
  };
  available: {
    under2: number;
    age2to3: number;
    age3Plus: number;
  };
  qualificationIssues: {
    under2: string[];
    age2to3: string[];
    age3Plus: string[];
  };
}

/**
 * Calculates EYFS ratio compliance based on staff qualifications and child counts
 */
export function calculateEYFSRatioCompliance(
  staff: StaffMember[],
  childCounts: ChildCount,
): RatioResult {
  // Initialize result
  const result: RatioResult = {
    compliant: false,
    pfaCompliant: false,
    eyfsCompliant: false,
    maxCapacity: {
      under2: 0,
      age2to3: 0,
      age3Plus: 0,
    },
    available: {
      under2: 0,
      age2to3: 0,
      age3Plus: 0,
    },
    qualificationIssues: {
      under2: [],
      age2to3: [],
      age3Plus: [],
    },
  };

  // Check PFA compliance
  const hasPFAHolder = staff.some((s) => s.isPFAHolder);
  result.pfaCompliant = hasPFAHolder;

  if (!hasPFAHolder) {
    result.qualificationIssues.under2.push("No PFA Holder");
    result.qualificationIssues.age2to3.push("No PFA Holder");
    result.qualificationIssues.age3Plus.push("No PFA Holder");
    return result; // Early return if no PFA holder
  }

  // Count staff by qualification level
  const level3Count = staff.filter(
    (s) => s.qualificationLevel === "Level 3 Approved",
  ).length;
  const level2Count = staff.filter(
    (s) => s.qualificationLevel === "Level 2 Approved",
  ).length;
  const qtsCount = staff.filter(
    (s) => s.qualificationLevel === "QTS / EYTS / EYPS / Level 6+",
  ).length;
  const level3StudentCount = staff.filter(
    (s) => s.qualificationLevel === "Student/Apprentice (Studying Level 3/6)",
  ).length;
  const level2StudentCount = staff.filter(
    (s) => s.qualificationLevel === "Student/Apprentice (Studying Level 2)",
  ).length;

  // Calculate effective counts (students count at level below)
  const effectiveLevel2Count = level2Count + level3StudentCount;
  const effectiveLevel1Count = level2StudentCount;

  // Check qualification requirements for each age group

  // Under 2s (1:3 ratio)
  const hasLevel3ForUnder2 = level3Count > 0;
  const hasEnoughLevel2ForUnder2 =
    effectiveLevel2Count >= Math.floor(staff.length / 2);

  if (hasLevel3ForUnder2 && hasEnoughLevel2ForUnder2) {
    result.maxCapacity.under2 = staff.length * 3;
  } else {
    if (!hasLevel3ForUnder2) {
      result.qualificationIssues.under2.push("No Level 3 Staff");
    }
    if (!hasEnoughLevel2ForUnder2) {
      result.qualificationIssues.under2.push("Insufficient Level 2 Staff");
    }
  }

  // 2-3 years (1:4 ratio)
  const hasLevel3For2to3 = level3Count > 0;
  const hasEnoughLevel2For2to3 =
    effectiveLevel2Count >= Math.floor(staff.length / 2);

  if (hasLevel3For2to3 && hasEnoughLevel2For2to3) {
    result.maxCapacity.age2to3 = staff.length * 4;
  } else {
    if (!hasLevel3For2to3) {
      result.qualificationIssues.age2to3.push("No Level 3 Staff");
    }
    if (!hasEnoughLevel2For2to3) {
      result.qualificationIssues.age2to3.push("Insufficient Level 2 Staff");
    }
  }

  // 3-5 years (1:8 or 1:13 ratio)
  const hasQTSFor3Plus = qtsCount > 0;
  const hasLevel3For3Plus = level3Count > 0;
  const hasEnoughLevel2For3Plus =
    effectiveLevel2Count >= Math.floor(staff.length / 2);

  if (hasQTSFor3Plus && hasLevel3For3Plus) {
    // QTS present, ratio is 1:13
    result.maxCapacity.age3Plus = staff.length * 13;
  } else if (hasLevel3For3Plus && hasEnoughLevel2For3Plus) {
    // No QTS but has Level 3 and enough Level 2, ratio is 1:8
    result.maxCapacity.age3Plus = staff.length * 8;
  } else {
    if (!hasLevel3For3Plus) {
      result.qualificationIssues.age3Plus.push("No Level 3 Staff");
    }
    if (!hasEnoughLevel2For3Plus && !hasQTSFor3Plus) {
      result.qualificationIssues.age3Plus.push("Insufficient Level 2 Staff");
    }
  }

  // Calculate available spaces
  result.available.under2 = Math.max(
    0,
    result.maxCapacity.under2 - childCounts.under2,
  );
  result.available.age2to3 = Math.max(
    0,
    result.maxCapacity.age2to3 - childCounts.age2to3,
  );
  result.available.age3Plus = Math.max(
    0,
    result.maxCapacity.age3Plus - childCounts.age3Plus,
  );

  // Check overall compliance
  const under2Compliant = childCounts.under2 <= result.maxCapacity.under2;
  const age2to3Compliant = childCounts.age2to3 <= result.maxCapacity.age2to3;
  const age3PlusCompliant = childCounts.age3Plus <= result.maxCapacity.age3Plus;

  result.eyfsCompliant =
    under2Compliant && age2to3Compliant && age3PlusCompliant;
  result.compliant = result.pfaCompliant && result.eyfsCompliant;

  return result;
}
