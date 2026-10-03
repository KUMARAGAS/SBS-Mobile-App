const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so symlinked `packages/*` (e.g. `@sbs/shared`
// -> `../../packages/shared`) trigger rebuilds and resolve.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// `@sbs/shared` uses NodeNext-style `.js` specifiers (`./enums/index.js`)
// that point at `.ts` sources. TypeScript + Node (`apps/api`) resolve
// those natively, but Metro looks for a literal `.js` file on disk and
// fails with `Unable to resolve "./enums/index.js"`. Strip the
// relative `.js` suffix and let Metro resolve `.ts` / `.tsx` via
// `sourceExts` instead.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = originalResolveRequest ?? context.resolveRequest;
  if (
    typeof moduleName === 'string' &&
    moduleName.endsWith('.js') &&
    (moduleName.startsWith('./') || moduleName.startsWith('../'))
  ) {
    try {
      return resolve(
        { ...context, resolveRequest: context.resolveRequest },
        moduleName.slice(0, -3),
        platform,
      );
    } catch {
      // Fall through to the default error below.
    }
  }
  return resolve(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
