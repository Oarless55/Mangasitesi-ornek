const CronJob = require('cron').CronJob
const Story = require('../../models/Story')

module.exports = {
  start: () => {
    // Haftalık (Her Pazartesi saat 00:00'da) - '0 0 * * 1'
    new CronJob(
      '0 0 * * 1',
      async () => {
        try {
          await Story.updateMany({}, { $set: { viewsWeekly: 0 } })
          console.log('[CRON] Haftalık görüntülemeler başarıyla sıfırlandı.')
        } catch (e) {
          console.error('[CRON ERROR] Haftalık sıfırlama hatası:', e)
        }
      },
      null,
      true,
      'Europe/Istanbul'
    )

    // Aylık (Her Ayın 1'i saat 00:00'da) - '0 0 1 * *'
    new CronJob(
      '0 0 1 * *',
      async () => {
        try {
          await Story.updateMany({}, { $set: { viewsMonthly: 0 } })
          console.log('[CRON] Aylık görüntülemeler başarıyla sıfırlandı.')
        } catch (e) {
          console.error('[CRON ERROR] Aylık sıfırlama hatası:', e)
        }
      },
      null,
      true,
      'Europe/Istanbul'
    )
  }
}
