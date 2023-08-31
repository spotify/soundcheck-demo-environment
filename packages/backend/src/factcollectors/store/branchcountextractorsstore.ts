import { ExtractorsStore } from "@spotify/backstage-plugin-soundcheck-node";
import { Logger } from "winston";
import { Config } from "@backstage/config";
import {
  buildExtractorConfigMap,
  ExtractorConfig,
} from "@spotify/backstage-plugin-soundcheck-common";
import { BranchCountFactCollectorSchema } from "./utils";

/**
 * Extractor store specifically for handling branch data.
 * It implements the ExtractorsStore interface from the Soundcheck plugin
 */
export class BranchCountExtractorsStore implements ExtractorsStore {
  /**
   * Static factory method for creating instances of BranchCountExtractorsStore
   * @param {Logger} logger - Logger instance
   * @param {Config} config - Configuration instance
   * @return {BranchCountExtractorsStore} - New instance of BranchCountExtractorsStore
   */
  static create(logger: Logger, config: Config) {
    return new BranchCountExtractorsStore(logger, config);
  }

  // Private fields
  #extractorConfigs: Record<string, ExtractorConfig>;
  readonly #logger: Logger;

  /**
   * The constructor is private, use the static create() method to create instances
   * @param {Logger} logger - Logger instance
   * @param {Config} config - Configuration instance
   */
  private constructor(logger: Logger, config: Config) {
    this.#logger = logger;
    this.#extractorConfigs = this.#parseExtractorSchemaTypesFromConfig(config);

    // Config#subscribe will be called when configuration is
    // updated by modifying yaml files during local development,
    // so we can call it here to shorten the feedback loop when
    // working on extractorConfigs locally.
    config.subscribe?.(() => {
      this.#extractorConfigs =
        this.#parseExtractorSchemaTypesFromConfig(config);
    });
  }

  /**
   * Parses extractor schema types from the given configuration
   * @param {Config} config - The configuration to parse
   * @return {Record<string, ExtractorConfig>} - The parsed extractor configurations
   */
  #parseExtractorSchemaTypesFromConfig(config: Config) {
    // Retrieve the 'soundcheck.collectors.branch' configuration from the app-config.yaml file if it exists
    const collectors = config.getOptional("soundcheck.collectors.branch");

    // branch collection not configured, so nothing to do.
    if (!collectors) {
      this.#logger.error(
        `No branch collectors configured, make sure you have a 'soundcheck.collectors.branch' section in your app-config.yaml file.`
      );
      return {} as Record<string, ExtractorConfig>;
    }

    // Zod verification.
    const schema = BranchCountFactCollectorSchema.safeParse(collectors);
    if (!schema.success) {
      this.#logger.error(
        `Failed to parse BranchCountFactCollector from schema.`
      );
      throw new Error(schema.error.message);
    }

    return buildExtractorConfigMap(schema.data);
  }

  /**
   * Gets the extractor configuration for the given fact name
   * @param {string} factName - The name of the fact to get the extractor configuration for
   * @return {ExtractorConfig} - The extractor configuration
   */
  getExtractorConfig(factName: string) {
    return this.#extractorConfigs[factName];
  }

  /**
   * Gets all extractor configurations
   * @return {ExtractorConfig[]} - The extractor configurations
   */
  getExtractorConfigs() {
    return Object.values(this.#extractorConfigs);
  }
}
