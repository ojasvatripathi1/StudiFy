/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";

// Initialize Firebase Admin
admin.initializeApp();

// Export the scheduled functions
export {checkUserDailyActivity} from "./scheduled/dailyUserCheck";
export {generateDailyQuiz} from "./scheduled/dailyQuizGenerator";

// Set global options for all functions
setGlobalOptions({maxInstances: 10});
