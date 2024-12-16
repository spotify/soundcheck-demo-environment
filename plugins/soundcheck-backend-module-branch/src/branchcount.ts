import { FactCollector } from '@spotify/backstage-plugin-soundcheck-node';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  CollectionConfig,
  ExtractorConfig,
  Fact,
  FactRef,
  getFactRef,
  stringifyFactRef,
  getEntityScmUrl,
  isScmEntity,
} from '@spotify/backstage-plugin-soundcheck-common';
import { Config, JsonObject } from '@backstage/config';
import { DateTime } from 'luxon';
import parseGitUrl from 'git-url-parse';
import {
  DefaultGithubCredentialsProvider,
  GithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import { graphql, GraphQlQueryResponseData } from '@octokit/graphql';
import { LoggerService } from '@backstage/backend-plugin-api';

// EXAMPLE OF A CUSTOM FACT COLLECTOR

export class BranchCountFactCollector implements FactCollector {
  public static ID = 'branch';

  // Private fields
  readonly #logger: LoggerService;
  readonly #credentialsProvider: GithubCredentialsProvider;

  /**
   * Factory method for creating instances of BranchCountFactCollector
   * @param {Config} config - Configuration object
   * @param {Logger} logger - Logger object
   * @return {BranchCountFactCollector} An instance of BranchCountFactCollector
   */
  public static create(
    config: Config,
    logger: LoggerService,
  ): BranchCountFactCollector {
    return new BranchCountFactCollector(config, logger);
  }

  /** {@inheritDoc @spotify/backstage-plugin-soundcheck-node#FactCollector.id} */
  id = BranchCountFactCollector.ID;

  /**
   * @constructor
   * @description The constructor is private, use the static create() method to create instances
   * @param {Config} config Configuration object
   * @param {Logger} logger Logger object
   */
  private constructor(config: Config, logger: LoggerService) {
    this.#logger = logger.child({
      target: this.id,
    });
    this.#credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(
        ScmIntegrations.fromConfig(config),
      );
  }

  /**
   * Builds a fact object from the given parameters.
   * @param {string} entityRef - The entity reference.
   * @param {FactRef} factRef - The fact reference.
   * @param {JsonObject} factData - The fact data.
   * @returns {Fact} The constructed fact object.
   */
  buildFact(entityRef: string, factRef: FactRef, factData: JsonObject) {
    return {
      factRef: factRef,
      entityRef: entityRef,
      data: factData,
      timestamp: DateTime.now().toUTC().toISO(),
    };
  }

  /**
   * Builds collection configurations from the given parameters.
   * @param {string} source - The source string.
   * @param {ExtractorConfig[]} extractorConfigs - Array of extractor configurations.
   * @returns {CollectionConfig[]} The constructed CollectionConfig array.
   */
  buildCollectionConfigs(
    source: string,
    extractorConfigs: ExtractorConfig[],
  ): CollectionConfig[] {
    return extractorConfigs.map(extractorConfig => ({
      factRefs: [getFactRef(source, extractorConfig)],
      filter: extractorConfig.filter,
      frequency: extractorConfig.frequency,
      cache: extractorConfig.cache,
    }));
  }

  /**
   * Collect facts for a set of entities. When called by the Soundcheck
   * backend, this method typically receives a single entity at a time,
   * but this behavior is not guaranteed. The collector should return
   * a list of facts for each given entity according to the given
   * parameters. If no fact references are provided, the collector should
   * return all facts that it can collect for the given entity.
   * The refresh parameter is used to control which facts should be
   * fetched again, even if they are already cached by the collector. This
   * caching is in reference to the collector itself, and is separate from
   * any caching that the Soundcheck backend may perform.

   * This is the primary method and purpose of the collector.
   */
  async collect(
    entities: Entity[],
    _params?: { factRefs?: FactRef[]; refresh?: FactRef[] },
  ) {
    try {
      const factRef: FactRef = stringifyFactRef({
        name: 'branch_count',
        scope: 'default',
        source: this.id,
      });
      const results = await Promise.all(
        entities
          .filter(entity => isScmEntity(entity))
          .map(entity => this.collectData(entity, factRef)),
      );

      return results.filter((result): result is Fact => result !== null);
    } catch (e) {
      this.#logger.error(`Failed to collect branch data with error: ${e}`);
      return Promise.reject([]);
    }
  }

  /**
   * Helper method to fetch the data used to in constructing a Fact.
   */
  async collectData(entity: Entity, factRef: string) {
    const entityRef = stringifyEntityRef(entity);
    const entityScmUrl = getEntityScmUrl(entity);
    const gitUrl = parseGitUrl(entityScmUrl);

    const { token } = await this.#credentialsProvider.getCredentials({
      url: entityScmUrl,
    });
    try {
      const {
        repository: { refs: totalCount },
      } = await graphql<GraphQlQueryResponseData>(
        `
          query numBranches($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
              refs(first: 0, refPrefix: "refs/heads/") {
                totalCount
              }
            }
          }
        `,
        {
          owner: gitUrl.owner,
          repo: gitUrl.name,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      this.#logger.info(
        `BranchCountFactCollector: ${gitUrl.owner} ${gitUrl.name} - Total Count: ${totalCount} `,
      );

      return this.buildFact(entityRef, factRef, totalCount);
    } catch (e) {
      this.#logger.error(
        `BranchCountFactCollector: ${gitUrl.owner} ${gitUrl.name} - Failed to collect branch data with error: ${e}`,
      );
      return null;
    }
  }

  /**
    * Returns the CollectionConfigs set on the collector,
    * which are configurations for how to collect facts
    * supported by this collector. These configurations include
    * a set of facts, a filter for which entities to collect those
    * facts against, a schedule for how often to collect those facts,
    * an initial delay for how long to wait to collect after startup,
    * and a cache configuration for how long to cache the collected facts.
    * See the CollectionConfig type for more information.

   * @returns {Promise<CollectionConfig[]>} - A Promise that resolves with an array of collection configurations
   */
  async getCollectionConfigs(): Promise<CollectionConfig[]> {
    return [];
  }
  /**
   * Get the schema of a fact that this collector can collect, including the
   * fact's name, description, and any other relevant metadata.
   * This is used by the front end to show data about the fact when creating
   * new checks via Soundchecks No-Code UI.
   * @param {_factRef: FactRef} factRef - The reference to the fact.
   * @returns {Promise<string | undefined>} A promise that resolves with the data schema or undefined.
   */
  getDataSchema(_factRef: FactRef) {
    return Promise.resolve(undefined);
  }

  /**
  /**
   * Get the names of all facts that this collector can collect.
   * This is used by the front end to show which facts can be collected when creating
   * new checks via Soundchecks No-Code UI.
   * @returns {Promise<string[]>} A promise that resolves with an array of fact names.
   */
  async getFactNames(): Promise<string[]> {
    return ['branch_count'];
  }
}
