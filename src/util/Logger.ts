import * as fs from "fs-extra"
import util from "util";
import * as leeks from "leeks.js";
import config from "../config";
import Functions from "./Functions";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export default class Logger {
  private static COLORS = {
    time: leeks.colors.gray,
    log: leeks.colors.green,
    info: leeks.colors.cyan,
    warn: leeks.colors.yellowBright,
    error: leeks.colors.redBright,
    
  }

  static get log(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "log")
  }

  static get info(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "info")
  }

  static get warn(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "warn")
  }

  static get error(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "error")
  }

  static get debug(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "debug")
  }

  static get command(): OmitFirstArg<typeof Logger["_log"]> {
    return this._log.bind(this, "cmd")
  }

  private static _log(type: string, name: string | string[], message?: any) {
    const d = new Date();
    const time = d.toString().split(" ")[4];
    const date = `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
    if(!name) throw new TypeError("Missing Logger name.");
    if(!message) {
      message = name;
      name = "General";
    }
    if(typeof message !== "string") {
      if (message instanceof Buffer || typeof message === "function") message = message.toString();
      if (typeof message === "object") message = util.inspect(message, { depth: null, colors: true, showHidden: true })
    }
    
    if(!fs.existsSync(config.dir.logs.clientLogs)) fs.mkdirpSync(config.dir.logs.clientLogs);
    fs.appendFileSync(`${config.dir.logs.clientLogs}/${date}.log`, Functions.consoleSanitize(`[${time}] ${Functions.ucwords(type)} | ${name instanceof Array ? name.join(" | ") : name.toString()} | ${message}\n`))
    process.stdout.write(`[${Logger.COLORS.time(time)}] ${Logger.COLORS[type](Functions.ucwords(type))} | ${name instanceof Array ? name.map(n => Logger.COLORS[type](n)).join(" | ") : Logger.COLORS[type](name.toString())} | ${Logger.COLORS[type](message)}\n`)
  }
}