const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  await RefreshToken.destroy({
    where: {
      expiresAt: { [Op.lt]: new Date() }, // Delete tokens that have expired
    },
  });
  console.log('Expired refresh tokens cleaned up');
});