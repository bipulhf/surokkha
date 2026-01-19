/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_correspondentsInvite from "../actions/correspondentsInvite.js";
import type * as actions_reportStatusUpdate from "../actions/reportStatusUpdate.js";
import type * as actions_reportsSubmit from "../actions/reportsSubmit.js";
import type * as correspondents from "../correspondents.js";
import type * as departments from "../departments.js";
import type * as http from "../http.js";
import type * as proctors from "../proctors.js";
import type * as reportLocations from "../reportLocations.js";
import type * as reports from "../reports.js";
import type * as students from "../students.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/correspondentsInvite": typeof actions_correspondentsInvite;
  "actions/reportStatusUpdate": typeof actions_reportStatusUpdate;
  "actions/reportsSubmit": typeof actions_reportsSubmit;
  correspondents: typeof correspondents;
  departments: typeof departments;
  http: typeof http;
  proctors: typeof proctors;
  reportLocations: typeof reportLocations;
  reports: typeof reports;
  students: typeof students;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
