import { DEPARTMENTS } from '../data/mockData';
import { Department } from '../types';

export interface SubCategoryDetail {
  name: string;
  slug: string;
  parentDepartment: Department;
  description: string;
  competencies: string[];
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
}

export function getSubCategoryUrl(dept: Department | string, subNameOrSlug: string): string {
  let code = typeof dept === 'string' ? dept : (dept.code || dept.id);
  code = code.replace(/^dept-/, '').toUpperCase();
  const slug = toSlug(subNameOrSlug);
  return `/departments/${code}/${slug}`;
}

export function getHospitalUrl(hospital: { name: string; id?: string } | string): string {
  const name = typeof hospital === 'string' ? hospital : hospital.name;
  return `/hospitals/${toSlug(name)}`;
}

export function getAllSubCategories(): { name: string; slug: string; parentDept: Department }[] {
  const result: { name: string; slug: string; parentDept: Department }[] = [];
  DEPARTMENTS.forEach(dept => {
    if (dept.subDepartments) {
      dept.subDepartments.forEach(subName => {
        result.push({
          name: subName,
          slug: toSlug(subName),
          parentDept: dept
        });
      });
    }
  });
  return result;
}

export function getSubCategoryDetailByDeptAndSlug(deptParam?: string, slugParam?: string): SubCategoryDetail | null {
  if (!slugParam) return null;
  const targetSlug = toSlug(slugParam);

  // If department parameter is provided, prioritize searching within that department
  if (deptParam) {
    const cleanDeptParam = deptParam.trim().toUpperCase();
    const dept = DEPARTMENTS.find(d => 
      d.code.toUpperCase() === cleanDeptParam || 
      d.id.toUpperCase() === cleanDeptParam ||
      d.id.toUpperCase() === `DEPT-${cleanDeptParam}`
    );

    if (dept && dept.subDepartments) {
      const foundSub = dept.subDepartments.find(subName => toSlug(subName) === targetSlug || toSlug(subName).includes(targetSlug));
      if (foundSub) {
        return {
          name: foundSub,
          slug: toSlug(foundSub),
          parentDepartment: dept,
          description: `Specialized ${foundSub} clinical rotation program under the ${dept.name} department, featuring direct patient care, mentor supervision, and DMHCA certification.`,
          competencies: dept.clinicalHighlights
        };
      }
    }
  }

  // Fallback to global sub-category lookup
  return getSubCategoryDetailBySlug(slugParam);
}

export function getSubCategoryDetailBySlug(slug: string): SubCategoryDetail | null {
  const allSub = getAllSubCategories();
  const targetSlug = toSlug(slug);
  const found = allSub.find(item => item.slug === targetSlug || toSlug(item.name) === targetSlug);
  
  if (!found) {
    // Fallback search by fuzzy name
    const fallback = allSub.find(item => item.slug.includes(targetSlug) || targetSlug.includes(item.slug));
    if (!fallback) return null;
    return {
      name: fallback.name,
      slug: fallback.slug,
      parentDepartment: fallback.parentDept,
      description: `Specialized ${fallback.name} clinical rotation program under the ${fallback.parentDept.name} department, featuring direct patient care, mentor supervision, and DMHCA certification.`,
      competencies: fallback.parentDept.clinicalHighlights
    };
  }

  return {
    name: found.name,
    slug: found.slug,
    parentDepartment: found.parentDept,
    description: `Specialized ${found.name} clinical rotation program under the ${found.parentDept.name} department, featuring direct patient care, mentor supervision, and DMHCA certification.`,
    competencies: found.parentDept.clinicalHighlights
  };
}

export function getProfileInitials(name?: string): string {
  if (!name) return 'AR';
  
  // Strip salutations/titles like Dr., Dr, Prof., Prof, Mr., Mr, Ms., Ms, Mrs., Mrs, Er., Er
  const cleaned = name
    .trim()
    .replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|ms\.|ms|mrs\.|mrs|er\.|er)\s+/i, '');

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  // First letter of first name + First letter of last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
