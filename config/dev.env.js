const url = process.env.FRONETEND_URL || '127.0.0.1';
const port = process.env.FRONETEND_PORT || 9000;
console.log("request_url ",url+":"+port+"\n");

module.exports = {
  NODE_ENV: '"development"',
  ENV_CONFIG: '"dev"',
  BASE_API: '"http://' + url + ':' + port + '"'
}
