import { BudgetCategory, OPENING_BALANCE, SavingsGoal, Transaction } from './models';

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'TX-1042', description: 'Mission UI — startup Abidjan', category: 'Freelance', type: 'income', amount: 350_000, date: '2026-10-15', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1041', description: 'Versement ordinateur', category: 'Épargne', type: 'expense', amount: 50_000, date: '2026-10-15', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1040', description: 'Abonnement Canal+', category: 'Loisirs', type: 'expense', amount: 6_900, date: '2026-10-14', paymentMethod: 'Orange Money', status: 'completed' },
  { id: 'TX-1039', description: 'Courses Prosuma', category: 'Alimentation', type: 'expense', amount: 18_700, date: '2026-10-12', paymentMethod: 'Carte', status: 'completed' },
  { id: 'TX-1038', description: 'Acompte formation UX', category: 'Formation', type: 'expense', amount: 25_000, date: '2026-10-11', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1037', description: 'Pharmacie du Plateau', category: 'Santé', type: 'expense', amount: 6_500, date: '2026-10-09', paymentMethod: 'Espèces', status: 'completed' },
  { id: 'TX-1036', description: 'Déjeuner coworking', category: 'Loisirs', type: 'expense', amount: 12_000, date: '2026-10-08', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1035', description: 'Versement fonds d’urgence', category: 'Épargne', type: 'expense', amount: 40_000, date: '2026-10-07', paymentMethod: 'Orange Money', status: 'completed' },
  { id: 'TX-1034', description: 'Gbaka + zemidjan', category: 'Transport', type: 'expense', amount: 8_400, date: '2026-10-06', paymentMethod: 'Espèces', status: 'completed' },
  { id: 'TX-1033', description: 'Forfait data Orange', category: 'Télécoms', type: 'expense', amount: 10_000, date: '2026-10-04', paymentMethod: 'Orange Money', status: 'completed' },
  { id: 'TX-1032', description: 'Courses du mois', category: 'Alimentation', type: 'expense', amount: 32_500, date: '2026-10-03', paymentMethod: 'Carte', status: 'completed' },
  { id: 'TX-1031', description: 'Loyer chambre Cocody', category: 'Logement', type: 'expense', amount: 85_000, date: '2026-10-02', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1030', description: 'Transfert familial', category: 'Transfert familial', type: 'income', amount: 80_000, date: '2026-10-01', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1029', description: 'Remboursement client (en attente)', category: 'Freelance', type: 'income', amount: 45_000, date: '2026-10-16', paymentMethod: 'Virement', status: 'pending' },
  { id: 'TX-1024', description: 'Mission landing page', category: 'Freelance', type: 'income', amount: 220_000, date: '2026-09-22', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1023', description: 'Loyer chambre Cocody', category: 'Logement', type: 'expense', amount: 85_000, date: '2026-09-02', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1022', description: 'Courses et marché', category: 'Alimentation', type: 'expense', amount: 41_200, date: '2026-09-08', paymentMethod: 'Espèces', status: 'completed' },
  { id: 'TX-1021', description: 'Transport du mois', category: 'Transport', type: 'expense', amount: 16_800, date: '2026-09-18', paymentMethod: 'Espèces', status: 'completed' },
  { id: 'TX-1020', description: 'Versement ordinateur', category: 'Épargne', type: 'expense', amount: 40_000, date: '2026-09-20', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1019', description: 'Transfert familial', category: 'Transfert familial', type: 'income', amount: 80_000, date: '2026-09-01', paymentMethod: 'Wave', status: 'completed' },
  { id: 'TX-1012', description: 'Mission identité visuelle', category: 'Freelance', type: 'income', amount: 180_000, date: '2026-08-18', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1011', description: 'Loyer chambre Cocody', category: 'Logement', type: 'expense', amount: 85_000, date: '2026-08-02', paymentMethod: 'Virement', status: 'completed' },
  { id: 'TX-1010', description: 'Alimentation', category: 'Alimentation', type: 'expense', amount: 36_400, date: '2026-08-12', paymentMethod: 'Carte', status: 'completed' },
  { id: 'TX-1009', description: 'Versement fonds d’urgence', category: 'Épargne', type: 'expense', amount: 35_000, date: '2026-08-25', paymentMethod: 'MTN MoMo', status: 'completed' },
  { id: 'TX-1008', description: 'Transfert familial', category: 'Transfert familial', type: 'income', amount: 75_000, date: '2026-08-01', paymentMethod: 'Wave', status: 'completed' },
];

export const DEMO_BUDGETS: BudgetCategory[] = [
  { id: 'b-food', name: 'Alimentation', limit: 60_000 },
  { id: 'b-transport', name: 'Transport', limit: 25_000 },
  { id: 'b-rent', name: 'Logement', limit: 85_000 },
  { id: 'b-telco', name: 'Télécoms', limit: 15_000 },
  { id: 'b-health', name: 'Santé', limit: 15_000 },
  { id: 'b-fun', name: 'Loisirs', limit: 20_000 },
  { id: 'b-learn', name: 'Formation', limit: 30_000 },
  { id: 'b-save', name: 'Épargne', limit: 100_000 },
  { id: 'b-misc', name: 'Divers', limit: 20_000 },
];

export const DEMO_GOALS: SavingsGoal[] = [
  { id: 'g-laptop', name: 'Acheter un ordinateur', targetAmount: 450_000, savedAmount: 180_000, targetDate: '2026-12-15' },
  { id: 'g-ux', name: 'Financer une formation', targetAmount: 200_000, savedAmount: 75_000, targetDate: '2026-11-30' },
  { id: 'g-emergency', name: 'Fonds d’urgence', targetAmount: 300_000, savedAmount: 120_000, targetDate: '2027-03-01' },
];

export const DEMO_SETTINGS = {
  displayName: 'Aya Koné',
  city: 'Abidjan',
  currency: 'XOF' as const,
  compactNumbers: false,
  period: 'this-month' as const,
};

export const DEMO_OPENING_BALANCE = OPENING_BALANCE;
