import { DateTime } from "luxon";

/**
 * True if the author feed already contains a post published by `did` on the
 * same Prague day as `date`.
 *
 * Posting is not idempotent, so the daily job checks this first: the workflow
 * can be dispatched more than once a day (a manual run, a retry of the
 * external scheduler, a test run) and each dispatch would otherwise publish
 * another copy of the same post.
 */
export function hasPostedOn(feed, did, date) {
    return feed.some(({post}) =>
        post?.author?.did === did &&
        DateTime.fromISO(post.record.createdAt, {zone: "Europe/Prague"}).hasSame(date, "day")
    );
}
