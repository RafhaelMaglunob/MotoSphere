import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Generic helper to write an admin action into the `changelogs` collection.
 *
 * @param {Object} params
 * @param {string} params.actorId - UID of the admin who performed the action
 * @param {string} params.actorEmail - Email of the admin
 * @param {string} [params.actorName] - Display name of the admin
 * @param {string} params.action - Short action name, e.g. "user_deleted"
 * @param {string} [params.targetType] - What was affected, e.g. "user", "settings"
 * @param {string} [params.targetId] - ID of the affected document / entity
 * @param {string} [params.summary] - Human readable description
 * @param {Object} [params.metadata] - Any extra structured data (previous values, etc.)
 */
export async function logAdminChange({
  actorId,
  actorEmail,
  actorName,
  action,
  targetType,
  targetId,
  summary,
  metadata = {},
}) {
  try {
    const logsRef = collection(db, "changelogs");
    await addDoc(logsRef, {
      actorId: actorId || null,
      actorEmail: actorEmail || null,
      actorName: actorName || null,
      action,
      targetType: targetType || null,
      targetId: targetId || null,
      summary: summary || "",
      metadata,
      // keep existing fields for backward compatibility with the UI
      type: "system", // single type used by automatic system logs
      changes: summary ? [summary] : [],
      date: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    // We never want logging failures to break main flows
    console.error("Failed to write admin change log:", err);
  }
}

