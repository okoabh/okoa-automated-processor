/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as deals from "../deals.js";
import type * as documents from "../documents.js";
import type * as fireflies from "../fireflies.js";
import type * as folders from "../folders.js";
import type * as processing from "../processing.js";
import type * as processingJobs from "../processingJobs.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  deals: typeof deals;
  documents: typeof documents;
  fireflies: typeof fireflies;
  folders: typeof folders;
  processing: typeof processing;
  processingJobs: typeof processingJobs;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
