exports.command = 'setting <command>'
exports.desc = 'Cài đặt tài khoản'
exports.builder = yargs => {
  return yargs.commandDir('setting_cmds')
}
exports.handler = argv => {}
