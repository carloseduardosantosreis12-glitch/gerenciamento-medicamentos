const recursos = require('./src/config/recursos');

const permissoesDeAvisos = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_EXACT_ALARM',
];

module.exports = ({ config }) => {
  const plugins = (config.plugins || []).filter(plugin =>
    (Array.isArray(plugin) ? plugin[0] : plugin) !== 'expo-notifications');
  const android = { ...config.android };
  android.permissions = (android.permissions || []).filter(item => !permissoesDeAvisos.includes(item));
  android.blockedPermissions = (android.blockedPermissions || []).filter(item => !permissoesDeAvisos.includes(item));
  if (recursos.notificacoes) {
    plugins.push('expo-notifications');
    android.permissions.push('android.permission.SCHEDULE_EXACT_ALARM');
  } else {
    android.blockedPermissions.push(...permissoesDeAvisos);
  }
  return { ...config, android, plugins };
};
