import { join } from 'node:path';

import type { InstallLocation } from '~/types/install.js';
import { dim, red } from '~/utils/ansi/ansi.js';

import { getTargetDir } from './paths.js';

/** ASCII banner displayed at the start of the installer. */
export const BANNER = `
${red('   █████╗ ██╗     ██╗ ██████╗███████╗')}
${red('  ██╔══██╗██║     ██║██╔════╝██╔════╝')}
${red('  ███████║██║     ██║██║     █████╗  ')}
${red('  ██╔══██║██║     ██║██║     ██╔══╝  ')}
${red('  ██║  ██║███████╗██║╚██████╗███████╗')}
${red('  ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝╚══════╝')}
`;

/**
 * Prints CLI usage information and exits.
 *
 * @param version - The current package version.
 */
export const showHelp = (version: string): never => {
  console.log(`alice-agents v${version}`);
  console.log('Find the right AI coding agent for your project.');
  console.log();
  console.log('Usage:');
  console.log(
    '  npx alice-agents [--global | --local] [--help] [--version] [--dry-run] [--reinstall]',
  );
  console.log();
  console.log('Flags:');
  console.log('  --global     Install to ~/.claude/ (all projects)');
  console.log('  --local      Install to ./.claude/ (current project only)');
  console.log(
    '  --dry-run    Show what would be installed without writing files',
  );
  console.log('  --reinstall  Remove previous installation before installing');
  console.log('  --help       Show this help message');
  console.log('  --version    Print version number');
  return process.exit(0) as never;
};

/**
 * Prints the dry-run summary showing what would be created.
 *
 * @param location - The install location.
 */
export const showDryRun = (location: InstallLocation): void => {
  const targetDir = getTargetDir(location);

  console.log();
  console.log(dim('[dry-run] No files will be modified.'));
  console.log();
  console.log(`  Target directory: ${dim(targetDir)}`);
  console.log(
    `  Would copy commands to: ${dim(join(targetDir, 'commands', 'alice'))}`,
  );
  console.log(
    `  Would copy workflows to: ${dim(join(targetDir, 'alice', 'workflows'))}`,
  );
  console.log(
    `  Would register hooks in: ${dim(join(targetDir, 'settings.json'))}`,
  );
  if (location === 'local') {
    console.log(`  Would update ignore files in: ${dim(process.cwd())}`);
  }
};
