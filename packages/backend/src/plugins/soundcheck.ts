import { SoundcheckBuilder } from '@spotify/backstage-plugin-soundcheck-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GithubFactCollector } from '@spotify/backstage-plugin-soundcheck-backend-module-github';
import { ScmFactCollector } from '@spotify/backstage-plugin-soundcheck-backend-module-scm';
import { BranchCountFactCollector } from '../factcollectors/branchcount';
import { PagerDutyFactCollector } from '@spotify/backstage-plugin-soundcheck-backend-module-pagerduty';
import { SonarQubeFactCollector } from '@spotify/backstage-plugin-soundcheck-backend-module-sonarqube';
import { DataDogFactCollector } from '@spotify/backstage-plugin-soundcheck-backend-module-datadog';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return SoundcheckBuilder.create({ ...env })
    .addFactCollectors(
      ScmFactCollector.create(env.config, env.logger),
      GithubFactCollector.create(env.config, env.logger, env.cache),
      BranchCountFactCollector.create(env.config, env.logger),
      PagerDutyFactCollector.create({
        config: env.config,
        cache: env.cache,
        logger: env.logger,
      }),
      SonarQubeFactCollector.create(env.logger),
      DataDogFactCollector.create(env.logger),
      // CUSTOM OR 3P FACT COLLECTORS GO HERE
    )
    .build();
}
