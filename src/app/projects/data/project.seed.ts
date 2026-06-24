import { createProject } from '../domain/project';
import type { Project } from '../domain/project';

export const PROJECT_SEED: readonly Project[] = [
  createProject({
    id: 'project-payment-platform-migration',
    name: 'Payment Platform Migration',
    customer: {
      id: 'customer-northstar-bank',
      name: 'Northstar Bank',
      industry: 'Banking',
    },
    owner: {
      id: 'team-member-maya-chen',
      name: 'Maya Chen',
      role: 'Delivery Manager',
    },
    status: 'Active',
    priority: 'High',
    summary: 'Move the bank payment platform to a resilient cloud-based architecture.',
    startDate: '2026-01-12',
    targetDate: '2026-10-30',
  }),
  createProject({
    id: 'project-customer-portal-redesign',
    name: 'Customer Portal Redesign',
    customer: {
      id: 'customer-acme-industries',
      name: 'Acme Industries',
      industry: 'Manufacturing',
    },
    owner: {
      id: 'team-member-jonas-keller',
      name: 'Jonas Keller',
      role: 'Lead Consultant',
    },
    status: 'Planning',
    priority: 'Medium',
    summary: 'Redesign the customer portal around faster self-service workflows.',
    startDate: '2026-08-03',
    targetDate: '2027-02-26',
  }),
  createProject({
    id: 'project-compliance-reporting-automation',
    name: 'Compliance Reporting Automation',
    customer: {
      id: 'customer-helvetia-finance',
      name: 'Helvetia Finance',
      industry: 'Financial Services',
    },
    owner: {
      id: 'team-member-sofia-rossi',
      name: 'Sofia Rossi',
      role: 'Program Manager',
    },
    status: 'At Risk',
    priority: 'High',
    summary: 'Automate regulated reports and reduce manual reconciliation work.',
    startDate: '2025-11-17',
    targetDate: '2026-07-31',
  }),
];
