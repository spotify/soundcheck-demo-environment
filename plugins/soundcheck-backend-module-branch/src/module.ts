import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { factCollectionExtensionPoint } from '@spotify/backstage-plugin-soundcheck-node';
import { BranchCountFactCollector } from './branchcount';

export const soundcheckModuleBranch = createBackendModule({
  pluginId: 'soundcheck',
  moduleId: 'branch',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        soundcheck: factCollectionExtensionPoint,
      },
      async init({ config, logger, soundcheck }) {
        soundcheck.addFactCollector(
          BranchCountFactCollector.create(config, logger),
        );
      },
    });
  },
});
