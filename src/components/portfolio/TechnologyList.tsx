import { Link } from '@/i18n/navigation';
import type { Skill } from '@/content/types';

/**
 * Technologies as quiet text tags. Technology names stay Latin/LTR in both locales (IL-5).
 * When the Skills page exists, each links to its entry there (IA §5: Project → Skills).
 */
export function TechnologyList({
  technologies,
  linkToSkills,
}: {
  technologies: Skill[];
  linkToSkills: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {technologies.map((tech) => {
        const label = tech.label ?? tech.name;
        const classes =
          'inline-flex min-h-9 items-center rounded-sm border border-line px-3 font-label text-xs text-fg-muted';
        return (
          <li key={tech.id} dir="ltr">
            {linkToSkills ? (
              <Link
                href={`/skills#skill-${tech.id}`}
                className={`${classes} transition-colors duration-(--duration-base) hover:border-line-strong hover:text-fg`}
              >
                {label}
              </Link>
            ) : (
              <span className={classes}>{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
