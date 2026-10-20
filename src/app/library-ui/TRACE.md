# Traçabilité LibraryUI — Eco-save

## Composants réellement affichés

1. **Cards** (`src/app/library-ui/event-card/`) — Overview, indicateurs Revenus / Dépenses / Épargne.
2. **Table** (`src/app/library-ui/data-table/`) — page Transactions.
3. **Dropdown** (`src/app/library-ui/account-menu/`) — menu compte, période, actions de ligne.
4. **Dashboard E-learning** (`src/app/layout/ecosave-shell.component.*`) — layout sidebar + overlay mobile + indicateur nav.
5. **Confirmation** (`src/app/library-ui/confirmation-toast/`) — dialogue de suppression + toast d’annulation.
6. **Cookies** (`src/app/library-ui/cookie-consent/`) — consentement de persistance locale de la démo.

## Adaptations

- Host `min-h-screen` retiré (Cards, Dropdown) pour intégration dans le shell.
- Palette Eco-save, données financières, inputs/outputs Angular.
- Dashboard : plus aucun contenu pédagogique.
- Confirmation : Annuler vs Confirmer (dialog) puis toast Undo.
- Cookies : bas de page, stockage local de démo uniquement.

## Non utilisés

Aucun des 6 composants copiés n’a été laissé de côté.
