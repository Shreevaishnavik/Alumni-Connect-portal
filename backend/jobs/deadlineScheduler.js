const cron = require('node-cron');
const Job = require('../models/Job');

// Runs every day at midnight (00:00) to expire past-deadline opportunities
const startDeadlineScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const result = await Job.updateMany(
        { isActive: true, deadline: { $lt: now } },
        { $set: { isActive: false } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Scheduler] Marked ${result.modifiedCount} expired opportunity(ies) as inactive.`);
      }
    } catch (err) {
      console.error('[Scheduler] Error expiring opportunities:', err.message);
    }
  });

  console.log('[Scheduler] Deadline expiry cron job started (runs daily at midnight).');
};

module.exports = startDeadlineScheduler;
