import { about } from './categories/about';
import { platform } from './categories/platform';
import { industries } from './categories/industries';
import { services } from './categories/services';
import { research } from './categories/research';
import { blog } from './categories/blog';
import { team } from './categories/team';
import { stats } from './categories/stats';
import { faq } from './categories/faq';

export * from './schemas';
export * from './categories/about';
export * from './categories/platform';
export * from './categories/industries';
export * from './categories/services';
export * from './categories/research';
export * from './categories/blog';
export * from './categories/team';
export * from './categories/stats';
export * from './categories/faq';

export const content = {
  about,
  platform,
  industries,
  services,
  research,
  blog,
  team,
  stats,
  faq,
} as const;
